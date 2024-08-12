from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from werkzeug.utils import secure_filename
import os

get_file = Blueprint('get_file', __name__)

# Define the maximum allowed size (100 MB)
MAX_UPLOAD_SIZE_MB = 100
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024 

# for 'GET' request 
# check 'uploads' folder if there are files uploaded
# if true then let  uploaded_files = list of files insdide that folder
def get_uploaded_files():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if os.path.exists(upload_folder):
        return os.listdir(upload_folder)
    return []

# for 'POST' request
# check if filename is valid
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'pdf', 'doc', 'docx'}

def get_folder_size(folder_path):
    total_size = 0
    for dirpath, _, filenames in os.walk(folder_path):
        for file in filenames:
            file_path = os.path.join(dirpath, file)
            total_size += os.path.getsize(file_path)
    return total_size

# main route function
@get_file.route("/get_file", methods=['GET', 'POST'])
def get_file_page():
    uploaded_files = []

    if request.method == 'GET':
        # Get the list of files in the uploads directory
        uploaded_files = get_uploaded_files()
    
    if request.method == 'POST':
        upload_folder = current_app.config['UPLOAD_FOLDER']
        
        # Check the current folder size
        folder_size = get_folder_size(upload_folder)
        
        if folder_size >= MAX_UPLOAD_SIZE_BYTES:
            flash('Upload limit reached. Please free up space before uploading new files.')
            return redirect(request.url)
    
        # Check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        
        file = request.files['file']
        
        # If the user does not select a file, the browser may submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        
        # If a valid file is uploaded, you can save it and proceed
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            uploaded_files = get_uploaded_files()
            
        else:
            flash('File not supported')
            return redirect(request.url)
        
    return render_template('get_file.html', uploaded_files=uploaded_files)
