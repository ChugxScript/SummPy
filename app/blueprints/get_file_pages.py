from flask import Blueprint, render_template, request, current_app, flash, redirect, url_for, session
import os

get_file_pages = Blueprint('get_file_pages', __name__)

@get_file_pages.route('/get_file_pages', methods=['GET', 'POST'])
def get_file_pages_page():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    uploaded_files = []
    form_data = {}

    if request.method == 'GET':
        if os.path.exists(upload_folder):
            uploaded_files = os.listdir(upload_folder)

    if request.method == 'POST':
        form_data = request.form

        if os.path.exists(upload_folder):
            uploaded_files = os.listdir(upload_folder)

            for file in uploaded_files:
                chapter_1 = int(form_data.get(f'{file}_chapter_1'))
                chapter_2 = int(form_data.get(f'{file}_chapter_2'))
                chapter_3 = int(form_data.get(f'{file}_chapter_3'))
                chapter_4 = int(form_data.get(f'{file}_chapter_4'))
                chapter_5 = int(form_data.get(f'{file}_chapter_5'))
                chapter_end = int(form_data.get(f'{file}_bibliography_references'))

                # Validate the order of the chapters
                if not (chapter_1 < chapter_2 < chapter_3 < chapter_4 < chapter_5 < chapter_end):
                    flash(f'Error in file {file}: Chapters must be in increasing order.')
                    return redirect(url_for('get_file_pages.get_file_pages_page'))
        
        # Store form_data in session
        session['form_data'] = form_data
        return redirect(url_for('summary_result.summary_result_page'))
    
    return render_template('get_file_pages.html', uploaded_files=uploaded_files, form_data=form_data)