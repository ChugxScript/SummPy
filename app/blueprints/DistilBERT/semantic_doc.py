from transformers import AutoTokenizer, AutoModel
import torch
from scipy.spatial.distance import cosine

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

original_doc = "DistilBERT is a smaller version of BERT, optimized for speed and memory efficiency."
summarized_doc = "DistilBERT is a compact BERT model designed for faster performance making it good."

similarity_score = calculate_similarity(original_doc, summarized_doc)
print(f"Semantic Similarity: {similarity_score:.2f}")
