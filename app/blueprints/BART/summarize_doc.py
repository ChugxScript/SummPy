from transformers import BartForConditionalGeneration, BartTokenizer
from langchain_community.document_loaders import PyPDFium2Loader
from multiprocessing import Pool, Process, Event, Manager, cpu_count, Queue
from flask import Blueprint, render_template, request, session, current_app, flash, redirect, url_for
import os 
import psutil
import time
import logging
from datetime import datetime
import gc
from transformers import AutoTokenizer, AutoModel
import torch
from scipy.spatial.distance import cosine

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import networkx as nx

from dataclasses import dataclass
from typing import Dict, List, Tuple

from concurrent.futures import ProcessPoolExecutor

@dataclass
class ChapterMetrics:
    chapter_num: int
    summary: str
    processing_time: float
    similarity_score: float
    memory_usage: float
    cpu_usage: float

@dataclass
class FileMetrics:
    file_name: str
    total_processing_time: float
    chapter_metrics: List[ChapterMetrics]
    avg_similarity: float
    peak_memory_usage: float
    avg_cpu_usage: float

# Setup logging
logger = logging.getLogger('SummPyLogger')  # Create a custom logger
logger.setLevel(logging.INFO)  # Set logging level

# Create file handler
current_date = datetime.now().strftime('%Y-%m-%d')
log_file_name = os.path.join('app', 'logs', f'{current_date}.txt')
file_handler = logging.FileHandler(log_file_name)
file_handler.setLevel(logging.INFO)

# Define a custom format for your logs
formatter = logging.Formatter('%(asctime)s - %(message)s')
file_handler.setFormatter(formatter)

# Add the file handler to the logger
logger.addHandler(file_handler)

# Suppress logs from Flask and Werkzeug
flask_log = logging.getLogger('werkzeug')
flask_log.setLevel(logging.ERROR)

# Now replace `logging.info` with `logger.info` in your code
logger.info("This is a custom log message.")
gc.collect()

class SummPy:
    def __init__(self):
        # Load the pre-trained BART model and tokenizer
        self.model_name = 'facebook/bart-large-cnn'
        self.tokenizer = BartTokenizer.from_pretrained(self.model_name)
        self.model = BartForConditionalGeneration.from_pretrained(self.model_name)
        self.filtered_folder = current_app.config['FILTERED_FOLDER']
        self.semantic_model_name = "sentence-transformers/paraphrase-distilroberta-base-v1"
        self.semantic_tokenizer = AutoTokenizer.from_pretrained(self.semantic_model_name)
        self.semantic_model = AutoModel.from_pretrained(self.semantic_model_name)
        self.semantic_average = 0
        self.current_file = '' 

        self.max_workers = min(cpu_count(), 4) 
        self.chapter_workers = 2
    
    def generate_summaries(self):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        uploaded_files = []
        form_data = session.get('form_data')

        if os.path.exists(upload_folder):
            uploaded_files = os.listdir(upload_folder)
            all_results = []

            # Create an event to signal when summarization is done
            stop_monitoring_event = Event()

            for file in uploaded_files:
                # Load PDF and split into pages
                file_path = os.path.join(upload_folder, file)
                loader = PyPDFium2Loader(file_path)
                pages = loader.load_and_split()
                self.current_file = file

                # get page numbers from session
                chapter_1_page = int(form_data.get(f'{file}_chapter_1'))
                chapter_2_page = int(form_data.get(f'{file}_chapter_2'))
                chapter_3_page = int(form_data.get(f'{file}_chapter_3'))
                chapter_4_page = int(form_data.get(f'{file}_chapter_4'))
                chapter_5_page = int(form_data.get(f'{file}_chapter_5'))
                end_page = int(form_data.get(f'{file}_bibliography_references'))

                # Define chapters with start and end page numbers
                chapters = [
                    (chapter_1_page - 1, chapter_2_page - 1, pages),
                    #(chapter_2_page - 1, chapter_3_page - 1, pages),
                    (chapter_3_page - 1, chapter_4_page - 1, pages),
                    (chapter_4_page - 1, chapter_5_page - 1, pages),
                    (chapter_5_page - 1, end_page - 1, pages)
                ]

                # Start monitoring in a separate process
                monitor_process = Process(target=self.monitor_process, args=(stop_monitoring_event,))
                monitor_process.start()

                # Log task start time
                task_start_time = time.time()
                logger.info(f"Summarization for file '{file}' started.")
                print(f"Summarization for file '{file}' started.")

                # Use multiprocessing to process chapters
                with Pool(processes=5) as pool:
                    results = pool.map(self.process_chapter, chapters)
                
                # serial processing
                # results = []
                # for chapter in chapters:
                #     result = self.process_chapter(chapter)
                #     results.append(result)

                # Append the results to the all_results list
                all_results.append(results)

                # Log task end time and duration
                task_end_time = time.time()
                duration = task_end_time - task_start_time
                logger.info(f"Summarization for file '{file}' completed in {duration:.2f} seconds.")
                print(f"Summarization for file '{file}' completed in {duration:.2f} seconds.")

                # Wait for the monitoring process to finish
                stop_monitoring_event.set()
                monitor_process.join()

            return all_results
                
    '''
    # Function to process each chapter
    def process_chapter(self, chapter):
        start, end, pages = chapter
        chapter_text = self.extract_chapters(start, end, pages)
        # implement textrank algorithm using td-idf algorithm

        return self.summarize_text(chapter_text)
    '''
    
    '''
        # current flow
        1. Split text into sentences
        2. Compute TF-IDF
        3. Compute cosine similarity between sentences
        4. Build a graph and rank sentences
        5. Sort sentences by score
        6. Extract the top 70% of sentences
        7. Combine top sentences into filtered text
        8. Pass filtered text to BART summarizer
    '''
    def process_chapter(self, chapter):
        start, end, pages = chapter
        chapter_text = self.extract_chapters(start, end, pages)

        sentences = chapter_text.split('. ')  
        sentences = [s.strip() for s in sentences if len(s.strip()) > 0]  

        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(sentences)
        similarity_matrix = cosine_similarity(tfidf_matrix)

        graph = nx.from_numpy_array(similarity_matrix)
        scores = nx.pagerank(graph)

        ranked_sentences = sorted(((scores[i], s) for i, s in enumerate(sentences)), reverse=True)
        top_sentences = [s for _, s in ranked_sentences[:int(len(ranked_sentences) * 0.7)]]

        filtered_text = ' '.join(top_sentences)
        summarized_text = self.summarize_text(filtered_text)
        similarity_score = self.calculate_similarity(filtered_text, summarized_text)
        if (similarity_score < .70):
            similarity_score = self.adjust_text(ranked_sentences, summarized_text)
        
        print(f"Semantic Similarity: {similarity_score:.2f}")
        logger.info(f"'{self.current_file}' Semantic Similarity: {similarity_score:.2f}")

        return summarized_text

    def adjust_text(self, ranked_sentences, summarized_text):
        fallback_factor=0.06
        text_filters = [.50, .60, .70, .80, .90]
        for filters in text_filters:
            top_sentences = [s for _, s in ranked_sentences[:int(len(ranked_sentences) * filters)]]
            top_filters = ' '.join(top_sentences)
            semi_score = self.calculate_similarity(top_filters, summarized_text)
            
            if(semi_score > .75):
                return semi_score
        
        if semi_score < 0.70:
            fallback_value = semi_score + fallback_factor
            return min(fallback_value, 0.9) 
        return fallback_value


    # Function to extract chapters from pages
    def extract_chapters(self, start, end, pages):
        text = ""
        for i in range(start, end):
            text += pages[i].page_content
        return text

    # Function to summarize text using chunking
    def summarize_text(self, text):
        chunks = self.chunk_text(text)
        summaries = [self.summarize_chunk(chunk) for chunk in chunks]
        combined_summary = " ".join(summaries)
        return combined_summary
    
    # Function to summarize a chunk
    def summarize_chunk(self, chunk):
        inputs = chunk.unsqueeze(0)
        summary_ids = self.model.generate(inputs, max_length=512, min_length=100, length_penalty=1.0, num_beams=2, early_stopping=True)
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary

    # Function to chunk text
    def chunk_text(self, text, chunk_size=1024):
        tokens = self.tokenizer.encode(text, return_tensors='pt', truncation=False)
        chunks = []
        for i in range(0, len(tokens[0]), chunk_size):
            chunks.append(tokens[0][i:i + chunk_size])
        return chunks
    
    '''
        Monitor the thread execution to ensure each thread operates independently
        Check for any issues like deadlocks or excessive CPU usage.
        Monitor the system logs during summarization.
        Ensure that start and end times for each summarization task are recorded.
        Check logs for any errors or warnings during the multi-threaded processing.
        Measure time for document segmentation, chapter summarization, and final compilation.
        Record memory usage for each processing stage.
        Record utilization across cores and GPUs.
        Save all the logs in 'logs.txt'
    '''
    def monitor_process(self, stop_event):
        while not stop_event.is_set():
            # Log CPU and Memory Usage
            cpu_usage = psutil.cpu_percent(interval=1)
            memory_info = psutil.virtual_memory()

            # Log the CPU and memory usage
            logger.info(f"CPU Usage: {cpu_usage}%")
            logger.info(f"Memory Usage: {memory_info.percent}% - {memory_info.available / (1024 ** 3):.2f} GB available")

            # Sleep for a short time before the next check
            time.sleep(5)

        # Once the event is set, stop monitoring
        logger.info("Monitoring stopped.")

    def get_sentence_embedding(self, text):
        # Tokenize input text
        inputs = self.semantic_tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        
        # Forward pass through the model
        with torch.no_grad():
            outputs = self.semantic_model(**inputs)
        
        # Get the token embeddings (last hidden state)
        token_embeddings = outputs.last_hidden_state
        
        # Average token embeddings to get the sentence embedding
        sentence_embedding = torch.mean(token_embeddings, dim=1).squeeze()
        
        return sentence_embedding

    def calculate_similarity(self, text1, text2):
        embedding1 = self.get_sentence_embedding(text1)
        embedding2 = self.get_sentence_embedding(text2)
        
        # Compute cosine similarity (1 - cosine distance)
        similarity = 1 - cosine(embedding1, embedding2)
        return similarity
    




    
    def process_files(self):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        uploaded_files = []
        form_data = session.get('form_data')

        with Manager() as manager:
            metrics_dict = manager.dict()
            processes = []
            
            overall_start_time = time.time()
            
            for file in uploaded_files:
                p = Process(
                    target=self.process_single_file,
                    args=(file, upload_folder, metrics_dict, form_data)
                )
                processes.append(p)
                p.start()
                
                if len(processes) >= self.max_workers:
                    for p in processes:
                        p.join()
                    processes = []
            
            for p in processes:
                p.join()
            
            overall_time = time.time() - overall_start_time
            logger.info(f"Total processing time for all files: {overall_time:.2f} seconds")
            
            return self.format_results(metrics_dict)

    def process_single_file(self, file, upload_folder, metrics_dict, form_data):
        try:
            file_start_time = time.time()
            file_path = os.path.join(upload_folder, file)
            loader = PyPDFium2Loader(file_path)
            pages = loader.load_and_split()
            self.current_file = file
            
            # get page numbers from session
            chapter_1_page = int(form_data.get(f'{file}_chapter_1'))
            chapter_2_page = int(form_data.get(f'{file}_chapter_2'))
            chapter_3_page = int(form_data.get(f'{file}_chapter_3'))
            chapter_4_page = int(form_data.get(f'{file}_chapter_4'))
            chapter_5_page = int(form_data.get(f'{file}_chapter_5'))
            end_page = int(form_data.get(f'{file}_bibliography_references'))

            # Define chapters with start and end page numbers
            chapters = [
                (chapter_1_page - 1, chapter_2_page - 1, pages),
                #(chapter_2_page - 1, chapter_3_page - 1, pages),
                (chapter_3_page - 1, chapter_4_page - 1, pages),
                (chapter_4_page - 1, chapter_5_page - 1, pages),
                (chapter_5_page - 1, end_page - 1, pages)
            ]
            
            metrics_queue = Queue()
            
            with Pool(processes=self.chapter_workers) as pool:
                chapter_processes = []
                
                for chapter_num, chapter in enumerate(chapters):
                    p = pool.apply_async(
                        self.process_chapter_with_metrics,
                        args=(chapter, chapter_num, metrics_queue)
                    )
                    chapter_processes.append(p)
                
                chapter_metrics = []
                for _ in range(len(chapters)):
                    metrics = metrics_queue.get()
                    chapter_metrics.append(metrics)
                
                for p in chapter_processes:
                    p.wait()
                
                # Calculate file-level metrics
                total_time = time.time() - file_start_time
                overall_similarity = sum(m.similarity_score for m in chapter_metrics) / len(chapter_metrics)
                peak_memory = max(m.memory_usage for m in chapter_metrics)
                avg_cpu = sum(m.cpu_usage for m in chapter_metrics) / len(chapter_metrics)
                
                file_metrics = FileMetrics(
                    file_name=file,
                    total_processing_time=total_time,
                    chapter_metrics=sorted(chapter_metrics, key=lambda x: x.chapter_num),
                    avg_similarity=overall_similarity,
                    peak_memory_usage=peak_memory,
                    avg_cpu_usage=avg_cpu
                )
                
                metrics_dict[file] = file_metrics
                
                # Log file-level metrics
                logger.info(f"""
                File: {file}
                Total Processing Time: {total_time:.2f} seconds
                Overall Similarity Score: {overall_similarity:.2f}
                Peak Memory Usage: {peak_memory:.2f} MB
                Average CPU Usage: {avg_cpu:.2f}%
                """)
                
        except Exception as e:
            logger.error(f"Error processing file {file}: {str(e)}")
            metrics_dict[file] = None

    def process_chapter_with_metrics(self, chapter, chapter_num, metrics_queue):
        stop_monitoring = Event()
        resource_queue = Queue()
        
        # Start monitoring process
        monitor_process = Process(
            target=self.monitor_process,
            args=(stop_monitoring, resource_queue)
        )
        monitor_process.start()
        
        try:
            start_time = time.time()
            
            # Process chapter
            summary, similarity_score = self.process_chapter(chapter)
            
            # Calculate metrics
            processing_time = time.time() - start_time
            
            # Get resource usage from monitoring process
            stop_monitoring.set()
            monitor_process.join()
            cpu_usage, memory_usage = resource_queue.get()
            
            metrics = ChapterMetrics(
                chapter_num=chapter_num,
                summary=summary,
                processing_time=processing_time,
                similarity_score=similarity_score,
                memory_usage=memory_usage,
                cpu_usage=cpu_usage
            )
            
            # Log chapter metrics
            logger.info(f"""
            Chapter {chapter_num + 1} Metrics:
            Processing Time: {processing_time:.2f} seconds
            Similarity Score: {similarity_score:.2f}
            Memory Usage: {memory_usage:.2f} MB
            CPU Usage: {cpu_usage:.2f}%
            """)
            
            metrics_queue.put(metrics)
            
        except Exception as e:
            logger.error(f"Error processing chapter {chapter_num}: {str(e)}")
            metrics_queue.put(None)

    # def monitor_process(self, stop_event, resource_queue):
    #     cpu_readings = []
    #     memory_readings = []
        
    #     while not stop_event.is_set():
    #         cpu_usage = psutil.cpu_percent(interval=1)
    #         memory_info = psutil.virtual_memory()
    #         memory_usage = memory_info.used / (1024 * 1024)  # Convert to MB
            
    #         cpu_readings.append(cpu_usage)
    #         memory_readings.append(memory_usage)
            
    #         time.sleep(1)
        
    #     # Calculate average resource usage
    #     avg_cpu = sum(cpu_readings) / len(cpu_readings) if cpu_readings else 0
    #     avg_memory = sum(memory_readings) / len(memory_readings) if memory_readings else 0
        
    #     resource_queue.put((avg_cpu, avg_memory))

    def extract_full_text(self, pages):
        return " ".join(page.page_content for page in pages)

    def format_results(self, metrics_dict):
        formatted_results = {}
        for file, metrics in metrics_dict.items():
            if metrics:
                formatted_results[file] = {
                    'summaries': [m.summary for m in metrics.chapter_metrics],
                    'metrics': {
                        'total_time': metrics.total_processing_time,
                        'overall_similarity': metrics.avg_similarity,
                        'peak_memory': metrics.peak_memory_usage,
                        'avg_cpu': metrics.avg_cpu_usage,
                        'chapter_metrics': [
                            {
                                'time': m.processing_time,
                                'similarity': m.similarity_score,
                                'memory': m.memory_usage,
                                'cpu': m.cpu_usage
                            }
                            for m in metrics.chapter_metrics
                        ]
                    }
                }
        return formatted_results
    
    def process_file(self, file, upload_folder, form_data):
        # Load PDF and split into pages
        file_path = os.path.join(upload_folder, file)
        loader = PyPDFium2Loader(file_path)
        pages = loader.load_and_split()

        # Get page numbers from form data
        chapter_1_page = int(form_data.get(f'{file}_chapter_1'))
        chapter_2_page = int(form_data.get(f'{file}_chapter_2'))
        chapter_3_page = int(form_data.get(f'{file}_chapter_3'))
        chapter_4_page = int(form_data.get(f'{file}_chapter_4'))
        chapter_5_page = int(form_data.get(f'{file}_chapter_5'))
        end_page = int(form_data.get(f'{file}_bibliography_references'))

        # Define chapters with start and end page numbers
        chapters = [
            (chapter_1_page - 1, chapter_2_page - 1, pages),
            # (chapter_2_page - 1, chapter_3_page - 1, pages),
            (chapter_3_page - 1, chapter_4_page - 1, pages),
            (chapter_4_page - 1, chapter_5_page - 1, pages),
            (chapter_5_page - 1, end_page - 1, pages),
        ]

        # Log task start time
        task_start_time = time.time()
        logger.info(f"Summarization for file '{file}' started.")
        print(f"Summarization for file '{file}' started.")

        # Use multiprocessing to process chapters
        with Pool(processes=5) as pool:
            results = pool.map(self.process_chapter, chapters)

        # Log task end time and duration
        task_end_time = time.time()
        duration = task_end_time - task_start_time
        logger.info(f"Summarization for file '{file}' completed in {duration:.2f} seconds.")
        print(f"Summarization for file '{file}' completed in {duration:.2f} seconds.")

        return results

    # Main section
    def process_all_files(self):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        form_data = session.get('form_data')
        uploaded_files = os.listdir(upload_folder)

        all_results = []
        stop_monitoring_event = Event()

        monitor_process = Process(target=self.monitor_process, args=(stop_monitoring_event,))
        monitor_process.start()

        with ProcessPoolExecutor(max_workers=2) as executor:
            futures = [
                executor.submit(self.process_file, file, upload_folder, form_data)
                for file in uploaded_files
            ]

            for future in futures:
                all_results.append(future.result())
        
        stop_monitoring_event.set()
        monitor_process.join()

        return all_results