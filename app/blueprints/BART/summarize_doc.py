from transformers import BartForConditionalGeneration, BartTokenizer
from langchain_community.document_loaders import PyPDFium2Loader
from multiprocessing import Pool, Process, Event, Semaphore, Manager, cpu_count, Lock
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

                # Use multiprocessing to process chapters
                with Pool(processes=5) as pool:
                    results = pool.map(self.process_chapter, chapters)

                # Append the results to the all_results list
                all_results.append(results)

                # Log task end time and duration
                task_end_time = time.time()
                duration = task_end_time - task_start_time
                logger.info(f"Summarization for file '{file}' completed in {duration:.2f} seconds.")

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
        print("filtered_text: ", filtered_text)
        summarized_text = self.summarize_text(filtered_text)
        similarity_score = self.calculate_similarity(filtered_text, summarized_text)
        print(f"Semantic Similarity: {similarity_score:.2f}")
        logger.info(f"'{self.current_file}' Semantic Similarity: {similarity_score:.2f}")

        return summarized_text

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
        print("filtered_text: ", filtered_text)
        summarized_text = self.summarize_text(filtered_text)
        similarity_score = self.calculate_similarity(filtered_text, summarized_text)
        print(f"Semantic Similarity: {similarity_score:.2f}")
        logger.info(f"'{self.current_file}' Semantic Similarity: {similarity_score:.2f}")

        return summarized_text

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