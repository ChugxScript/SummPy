from flask import Blueprint, render_template, session, request, redirect, url_for, flash, current_app
from werkzeug.utils import secure_filename
import os

admin_cos_library = Blueprint('admin_cos_library', __name__)

@admin_cos_library.route("/cos_library_admin")
def admin_cos_library_page():                    
    return render_template('admin_cos_library.html')

def get_uploaded_files():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if os.path.exists(upload_folder):
        return os.listdir(upload_folder)
    return []

# for 'POST' request
# check if filename is valid
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'pdf', 'doc', 'docx'}

@admin_cos_library.route("/cos_library_admin_upload_study", methods=['POST'])
def upload_study():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    summarized_folder = os.path.join(current_app.config['SUMMARIZED_FOLDER'])

    # Check if the folder exists
    if os.path.exists(upload_folder):
        # Loop through the files in the folder and delete them
        for filename in os.listdir(upload_folder):
            file_path = os.path.join(upload_folder, filename)
            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")
        
    if os.path.exists(summarized_folder):
        # Loop through the files in the folder and delete them
        for filename in os.listdir(summarized_folder):
            file_path = os.path.join(summarized_folder, filename)
            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")

    # Check if the post request has the file part
    if 'study_file' not in request.files:
        flash('No file part')
        print("No file part")
        return redirect(url_for('admin_cos_library.admin_cos_library_page'))
    
    study_file = request.files['study_file']
    
    # Save study file if valid
    if study_file and allowed_file(study_file.filename):
        study_filename = secure_filename(study_file.filename)
        study_file_path = os.path.join(upload_folder, study_filename)
        study_file.save(study_file_path)

    else:
        flash('Invalid or missing study document file.')
        return redirect(url_for('admin_cos_library.admin_cos_library_page'))
        
    return redirect(url_for('admin_cos_library.admin_cos_library_page'))

@admin_cos_library.route("/cos_library_admin_upload_moa", methods=['POST'])
def upload_moa():
    moa_folder = current_app.config['MOA_FOLDER']

    # Check if the post request has the file part
    if 'moa_file' not in request.files:
        flash('No file part')
        print("No file part")
        return redirect(url_for('admin_cos_library.admin_cos_library_page'))
    
    moa_file = request.files['moa_file']
    
    # Save study file if valid
    if moa_file:
        moa_filename = secure_filename(moa_file.filename)
        moa_file_path = os.path.join(moa_folder, moa_filename)
        moa_file.save(moa_file_path)
    else:
        flash('Invalid or missing study document file.')
        return redirect(url_for('admin_cos_library.admin_cos_library_page'))
        
    return redirect(url_for('admin_cos_library.admin_cos_library_page'))

@admin_cos_library.route('/admin_remove_file', methods=['POST'])
def remove_file():
    if 'study' in request.files:
        f_file = request.files['study']
        file_filename = secure_filename(f_file.filename)
        upload_folder = current_app.config['UPLOAD_FOLDER']

        # Remove the image from the upload folder if it exists
        file_path = os.path.join(upload_folder, file_filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    else:
        f_file = request.files['moa']
        file_filename = secure_filename(f_file.filename)
        upload_folder = current_app.config['MOA_FOLDER']

        # Remove the image from the upload folder if it exists
        file_path = os.path.join(upload_folder, file_filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    

    return redirect(url_for('get_file.get_file_page'))