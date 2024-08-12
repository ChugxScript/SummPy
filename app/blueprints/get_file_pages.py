from flask import Blueprint, render_template, request

get_file_pages = Blueprint('get_file_pages', __name__)

@get_file_pages.route('/get_file_pages')
def get_file_pages_page():
    return render_template('get_file_pages.html')



