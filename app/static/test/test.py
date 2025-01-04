import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx

# Sample class structure to demonstrate the process
class TextSummarizer:
    
    def __init__(self):
        self.current_file = "example.pdf"
    
    def process_chapter(self, chapter_text):
        # Step 1: Split the chapter text into sentences
        sentences = chapter_text.split('. ')  
        sentences = [s.strip() for s in sentences if len(s.strip()) > 0]  

        # Step 2: Generate TF-IDF and similarity matrix
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(sentences)
        similarity_matrix = cosine_similarity(tfidf_matrix)

        # Step 3: Rank sentences based on cosine similarity (PageRank model)
        graph = nx.from_numpy_array(similarity_matrix)
        scores = nx.pagerank(graph)

        # Rank sentences based on PageRank scores
        ranked_sentences = sorted(((scores[i], s) for i, s in enumerate(sentences)), reverse=True)

        # Select top 70% of sentences initially
        top_sentences = [s for _, s in ranked_sentences[:int(len(ranked_sentences) * 0.7)]]
        filtered_text = ' '.join(top_sentences)

        # Step 4: Summarize the filtered text and calculate similarity
        summarized_text = self.summarize_text(filtered_text)
        similarity_score = self.calculate_similarity(filtered_text, summarized_text)

        # Step 5: If the similarity score is less than 0.70, adjust the sentence selection
        if similarity_score < 0.70:
            print(f"Initial similarity score: {similarity_score:.2f} (below 0.70). Adjusting selection...")
            # Adjust the sentence selection to improve the similarity score
            adjusted_sentences = self.adjust_sentence_selection(ranked_sentences, similarity_score)
            filtered_text = ' '.join(adjusted_sentences)
            summarized_text = self.summarize_text(filtered_text)
            similarity_score = self.calculate_similarity(filtered_text, summarized_text)

        print(f"Final similarity score: {similarity_score:.2f}")
        return summarized_text

    def summarize_text(self, text):
        # Simulate the summarization (here, just returning the first 3 sentences as a mock summary)
        sentences = text.split('. ')
        return '. '.join(sentences[:3])  # Just as an example of "summarization"
    
    def calculate_similarity(self, text1, text2):
        # Simulate similarity calculation using cosine similarity of sentence embeddings
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        return similarity[0][0]
    
    def adjust_sentence_selection(self, ranked_sentences, similarity_score):
        """
        Adjust the sentence selection to improve similarity score without re-running full summary.
        This can include strategies like reweighting sentences or fine-tuning top selection.
        """
        adjusted_sentences = []
        
        if similarity_score < 0.70:
            # Boost sentences based on their rank or adjust to focus on high-scoring sentences
            for score, sentence in ranked_sentences:
                if score > 0.1:  # Example threshold to boost relevant sentences
                    adjusted_sentences.append(sentence)
                if len(adjusted_sentences) > int(len(ranked_sentences) * 0.8):  # Stop at top 80% sentences
                    break

        return adjusted_sentences


# Simulate a chapter of text
chapter_text = """
Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. Colloquially, the term "artificial intelligence" is often used to describe machines (or computers) that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem-solving".
AI research has been divided into subfields that often fail to communicate with each other. These include "robotics", which deals with the design of physical robots, "machine learning", which emphasizes the use of algorithms to parse data and learn from it, and "natural language processing", which focuses on programming computers to fruitfully process large natural language data sets. The different subfields of AI research are based on assumptions about the nature of intelligence and the best way to model it.
"""

# Instantiate and process chapter
summarizer = TextSummarizer()
summarized_text = summarizer.process_chapter(chapter_text)
print("Summarized Text:", summarized_text)
