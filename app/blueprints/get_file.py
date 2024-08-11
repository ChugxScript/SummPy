from flask import Blueprint, render_template, request, redirect, url_for, flash
import os

get_file = Blueprint('get_file', __name__)

@get_file.route("/get_file", methods=['GET', 'POST'])
def get_file_page():
    if request.method == 'POST':
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
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('get_file_pages.get_file_pages_page'))  # Redirect after successful upload
        
    return render_template('get_file.html')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'pdf', 'doc', 'docx'}