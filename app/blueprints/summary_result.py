from flask import Blueprint, render_template, request, session, current_app, flash, redirect, url_for
import os 
import re
from fpdf import FPDF
import pdfplumber
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

def format_text(text):
    text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)  
    text = re.sub(r"([A-Za-z])([0-9])", r"\1 \2", text)  
    text = re.sub(r"([A-Za-z]),([A-Za-z])", r"\1, \2", text)  
    text = re.sub(r"([A-Za-z])\.([A-Za-z])", r"\1. \2", text) 
    return text

def add_centered_text(pdf, text, font="Times", size=12, spacing=10):
    pdf.set_font(font, size=size)
    pdf.cell(0, spacing, text, ln=True, align='C')

def generate_pdf_with_first_page(summary_list, filename, original_file_path):
    pdf = FPDF()

    with pdfplumber.open(original_file_path) as pdf_file:
        first_page = pdf_file.pages[0]
        text = first_page.extract_text()

    formatted_text = format_text(text)

    lines = formatted_text.split("\n")

    pdf.add_page()
    pdf.set_font("Times", size=12)

    for i, line in enumerate(lines):
        cleaned_line = line.strip()
        if cleaned_line:
            if "SCIENCE" in cleaned_line:
                add_centered_text(pdf, cleaned_line, font="Times", size=12, spacing=8)
                pdf.ln(10)  
            elif "Prepared by:" in cleaned_line:
                pdf.ln(10)  
                add_centered_text(pdf, cleaned_line, font="Times", size=12, spacing=8)
            elif "Leader:" in cleaned_line or "Members:" in cleaned_line or "Adviser:" in cleaned_line:
                pdf.ln(10) 
                add_centered_text(pdf, cleaned_line, font="Times", size=12, spacing=8)
            else:
                add_centered_text(pdf, cleaned_line, font="Times", size=12, spacing=8)

    section_titles = ["INTRODUCTION", "METHOD", "RESULTS", "DISCUSSION"]

    for i, summary in enumerate(summary_list):
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

    summarizer = SummPy()
    results = summarizer.generate_summaries()

    for i, result in enumerate(results):
        original_file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], uploaded_files[i])
        pdf_filename = f"summary_{uploaded_files[i]}"
        generate_pdf_with_first_page(result, pdf_filename, original_file_path)

    summarized_folder = get_summarized_files()

    return render_template('summary_result.html', summarized_folder=summarized_folder, uploaded_files=uploaded_files)
