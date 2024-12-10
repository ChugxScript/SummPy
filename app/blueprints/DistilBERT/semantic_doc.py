from transformers import AutoTokenizer, AutoModel
import torch
from scipy.spatial.distance import cosine
import os
from PyPDF2 import PdfReader

# Load model and tokenizer
model_name = "sentence-transformers/paraphrase-distilroberta-base-v1"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

def get_sentence_embedding(text):
    # Tokenize input text
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    
    # Forward pass through the model
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get the token embeddings (last hidden state)
    token_embeddings = outputs.last_hidden_state
    
    # Average token embeddings to get the sentence embedding
    sentence_embedding = torch.mean(token_embeddings, dim=1).squeeze()
    
    return sentence_embedding

def calculate_similarity(text1, text2):
    embedding1 = get_sentence_embedding(text1)
    embedding2 = get_sentence_embedding(text2)
    
    # Compute cosine similarity (1 - cosine distance)
    similarity = 1 - cosine(embedding1, embedding2)
    return similarity

def extract_text_from_pdf(file_path, mode):
    # fpages = [5, 10, 29, 38, 46, 49]
    chapters = [
        (5 - 1, 10 - 1),
        #(chapter_2_page - 1, chapter_3_page - 1, pages),
        (29 - 1, 38 - 1),
        (38 - 1, 46 - 1),
        (46 - 1, 49 - 1)
    ]
    text = ""
    try:
        with open(file_path, 'rb') as file:
            reader = PdfReader(file)
            for i, page in enumerate(reader.pages):
                if mode == 1:
                    # Mode 1: Only extract text from specific pages
                    for start, end in chapters:
                        if start <= i <= end:  # Check if the page is within the chapter range
                            page_text = page.extract_text()
                            if page_text:  # Check if text was extracted
                                text += page_text
                            break
                else:
                    # Mode 2: Extract text from all pages
                    page_text = page.extract_text()
                    if page_text:  # Check if text was extracted
                        text += page_text
            if mode == 1:
                print(f"\n===original_doc===\n{text}")
            else:
                print(f"\n===summarized_doc===\n{text}")
    except Exception as e:
        print(f"Error reading PDF file {file_path}: {e}")
    return text

# Define file paths
origFilePath = os.path.join("app", "static", "test", "se_pdf.pdf")
summFilePath = os.path.join("app", "static", "test", "summary_se_pdf.pdf")

# Extract text from the original and summarized PDF files
original_doc = extract_text_from_pdf(origFilePath, 1)
summarized_doc = extract_text_from_pdf(summFilePath, 2)

# Ensure text was extracted successfully
if not original_doc or not summarized_doc:
    print("Failed to extract text from one or both files.")
else:
    # Compute semantic similarity
    similarity_score = calculate_similarity(original_doc, summarized_doc)
    print(f"Semantic Similarity: {similarity_score:.2f}")
