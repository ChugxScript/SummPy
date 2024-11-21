from flask import Blueprint, render_template, request, session, current_app, flash, redirect, url_for
import os 
import fitz
from fpdf import FPDF
from .BART.summarize_doc import SummPy

summary_result = Blueprint('summary_result', __name__)

def get_summarized_files():
    summarized_folder = current_app.config['SUMMARIZED_FOLDER']
    if os.path.exists(summarized_folder):
        return os.listdir(summarized_folder)
    return []

def get_uploaded_files():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if os.path.exists(upload_folder):
        return os.listdir(upload_folder)
    return []

def generate_pdf_with_first_page(summary_list, filename, original_file_path): 
    pdf = FPDF()
    
    doc = fitz.open(original_file_path)
    first_page = doc[0]
    blocks = first_page.get_text("dict")["blocks"] 

    formatted_lines = []
    previous_bottom = 0  
    
    for block in blocks:
        if "lines" not in block:
            continue
        
        for line in block["lines"]:
            for span in line["spans"]:
                current_top = span["bbox"][1]  
                font_size = span["size"]     
                
                if current_top - previous_bottom > font_size * 0.8:
                    formatted_lines.append(" ")  
              
                formatted_lines.append(span["text"])
                previous_bottom = span["bbox"][3]  


    formatted_text = "\n".join(formatted_lines)

    pdf.add_page()
    pdf.set_font("Times", size=12)
    
    for line in formatted_lines:
        if line.strip() == "":
            pdf.ln(6)  
        else:
            pdf.multi_cell(0, 7, line, align='C')
    
    section_titles = ["INTRODUCTION", "METHOD", "RESULTS", "DISCUSSION"]

    for i, summary in enumerate(summary_list):
        # Add a new page before each section (including the first one)
        pdf.add_page()

        # Set the title dynamically based on the section
        pdf.set_font("Arial", style='B', size=12)
        pdf.cell(0, 10, section_titles[i], ln=True, align='C')

        # Add the summary for the current section
        pdf.set_font("Arial", size=12)
        encoded_summary = summary.encode('latin-1', 'replace').decode('latin-1')

        # Add multi_cell for summary text to ensure newlines are preserved
        pdf.multi_cell(0, 10, encoded_summary)
        pdf.ln(10)  # Add line break after the summary

    # Ensure the folder exists before saving
    summarized_folder = current_app.config['SUMMARIZED_FOLDER']
    if summarized_folder and not os.path.exists(summarized_folder):
        os.makedirs(summarized_folder)

    pdf_path = os.path.join(summarized_folder, filename)
    pdf.output(pdf_path)



@summary_result.route('/summary_result', methods=['GET'])
def summary_result_page():
    uploaded_files = get_uploaded_files()

     # get the IMRAD summary
    summarizer = SummPy()
    results = summarizer.generate_summaries()

    # make pdfs with the first page of the original PDF
    for i, result in enumerate(results):
        original_file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], uploaded_files[i])
        pdf_filename = f"summary_{uploaded_files[i]}"
        generate_pdf_with_first_page(result, pdf_filename, original_file_path)

    summarized_folder = get_summarized_files()

    return render_template('summary_result.html', summarized_folder=summarized_folder, uploaded_files=uploaded_files)
