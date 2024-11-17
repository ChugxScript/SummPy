from flask import Blueprint, render_template, request, session, current_app, flash, redirect, url_for
import os 
from fpdf import FPDF
from .BART.summarize_doc import SummPy
from PyPDF2 import PdfReader


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
    
    # Add the first page of the original PDF
    reader = PdfReader(original_file_path)
    first_page = reader.pages[0]
    pdf.add_page()
    pdf.set_font("Times", size=12)
    pdf.multi_cell(0, 7, first_page.extract_text(), align='C')
    
    # Add section titles and summaries
    section_titles = ["INTRODUCTION", "METHOD", "RESULTS", "DISCUSSION"]
    
    for i, summary in enumerate(summary_list):
        # Add a new page for each section title and summary
        if i > 0:  # Skip adding a new page before the first section
            pdf.add_page()
        
        pdf.set_font("Arial", style='B', size=12)
        pdf.cell(0, 10, section_titles[i], ln=True, align='C')
        pdf.set_font("Arial", size=12)
        
        encoded_summary = summary.encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 10, encoded_summary)
        pdf.ln(10)

    summarized_folder = current_app.config['SUMMARIZED_FOLDER']
    pdf_path = os.path.join(summarized_folder, filename)
    pdf.output(pdf_path)

@summary_result.route('/summary_result', methods=['GET'])
def summary_result_page():
    uploaded_files = get_uploaded_files()

    # # get the IMRAD summary
    # summarizer = SummPy()
    # results = summarizer.generate_summaries()

    # # make pdfs with the first page of the original PDF
    # for i, result in enumerate(results):
    #     original_file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], uploaded_files[i])
    #     pdf_filename = f"summary_{uploaded_files[i]}"
    #     generate_pdf_with_first_page(result, pdf_filename, original_file_path)

    summarized_folder = get_summarized_files()

    return render_template('summary_result.html', summarized_folder=summarized_folder, uploaded_files=uploaded_files)
