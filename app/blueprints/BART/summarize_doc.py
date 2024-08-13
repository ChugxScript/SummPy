from transformers import BartForConditionalGeneration, BartTokenizer
from langchain_community.document_loaders import PyPDFium2Loader
from multiprocessing import Pool
from flask import Blueprint, render_template, request, session, current_app, flash, redirect, url_for
import os 

class SummPy:
    def __init__(self):
        # Load the pre-trained BART model and tokenizer
        self.model_name = 'facebook/bart-large-cnn'
        self.tokenizer = BartTokenizer.from_pretrained(self.model_name)
        self.model = BartForConditionalGeneration.from_pretrained(self.model_name)
    
    def generate_summaries(self):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        uploaded_files = []
        form_data = session.get('form_data')

        if os.path.exists(upload_folder):
            uploaded_files = os.listdir(upload_folder)
            all_results = []

            for file in uploaded_files:
                # Load PDF and split into pages
                file_path = os.path.join(upload_folder, file)
                loader = PyPDFium2Loader(file_path)
                pages = loader.load_and_split()

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
                    (chapter_2_page - 1, chapter_3_page - 1, pages),
                    (chapter_3_page - 1, chapter_4_page - 1, pages),
                    (chapter_4_page - 1, chapter_5_page - 1, pages),
                    (chapter_5_page - 1, end_page - 1, pages)
                ]

                # Use multiprocessing to process chapters
                with Pool(processes=5) as pool:
                    results = pool.map(self.process_chapter, chapters)

                # Append the results to the all_results list
                all_results.append(results)

            return all_results
                
    # Function to process each chapter
    def process_chapter(self, chapter):
        start, end, pages = chapter
        chapter_text = self.extract_chapters(start, end, pages)
        return self.summarize_text(chapter_text)

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