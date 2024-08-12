from flask import Blueprint, render_template, request, current_app
import os

get_file_pages = Blueprint('get_file_pages', __name__)

@get_file_pages.route('/get_file_pages', methods=['GET', 'POST'])
def get_file_pages_page():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    uploaded_files = []

    if request.method == 'GET':
        if os.path.exists(upload_folder):
            uploaded_files = os.listdir(upload_folder)
    
    return render_template('get_file_pages.html', uploaded_files=uploaded_files)