from flask import Blueprint, render_template, request, session, current_app, flash, redirect, url_for
import os 
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

def generate_pdf(summary_list, filename):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    for summary in summary_list:
        encoded_summary = summary.encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 10, encoded_summary)
        pdf.ln(10)  # Add two new lines after each chapter summary

    summarized_folder = current_app.config['SUMMARIZED_FOLDER']
    pdf_path = os.path.join(summarized_folder, filename)
    pdf.output(pdf_path)

@summary_result.route('/summary_result', methods=['GET'])
def summary_result_page():
    uploaded_files = get_uploaded_files()

    # get the IMRAD summary
    summarizer = SummPy()
    results = summarizer.generate_summaries()

    # make pdfs
    for i, result in enumerate(results):
        pdf_filename = f"summary_{uploaded_files[i]}"
        generate_pdf(result, pdf_filename)

    summarized_folder = get_summarized_files()

    return render_template('summary_result.html', summarized_folder=summarized_folder, uploaded_files=uploaded_files)