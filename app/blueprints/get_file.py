from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from werkzeug.utils import secure_filename
import os

get_file = Blueprint('get_file', __name__)

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

# main route function
@get_file.route("/get_file", methods=['GET'])
def get_file_page():
    uploaded_files = get_uploaded_files()
    return render_template('get_file.html', uploaded_files=uploaded_files)

@get_file.route("/upload_files", methods=['POST'])
def upload_files():
    upload_folder = current_app.config['UPLOAD_FOLDER']

    # Check if the post request has the file part
    if 'file' not in request.files:
        flash('No file part')
        return redirect(url_for('get_file.get_file_page'))
    
    files = request.files.getlist('file')
    saved_files = [f for f in os.listdir(upload_folder) if allowed_file(f)]
    
    for file in files:
        if file.filename == '':
            flash('No selected file')
            return redirect(url_for('get_file.get_file_page'))
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)

            if filename not in saved_files:
                file.save(os.path.join(upload_folder, filename))
        
        else:
            flash('File not supported')
            return redirect(url_for('get_file.get_file_page'))
        
    return redirect(url_for('get_file.get_file_page'))

@get_file.route('/remove_file')
def remove_file():
    file_name = request.args.get('file')
    upload_folder = current_app.config['UPLOAD_FOLDER']

    # Remove the image from the upload folder if it exists
    file_path = os.path.join(upload_folder, file_name)
    if os.path.exists(file_path):
        os.remove(file_path)

    return redirect(url_for('get_file.get_file_page'))