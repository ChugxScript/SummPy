import os
from flask import Flask
from .blueprints.home import home
from .blueprints.how_to_use import how_to_use
from .blueprints.about_us import about_us
from .blueprints.donate import donate

from .blueprints.get_file import get_file
from .blueprints.get_file_pages import get_file_pages
from .blueprints.summary_result import summary_result

from .blueprints.admin_cos_library import admin_cos_library
from .blueprints.student_cos_library import student_cos_library

def create_app():
    app = Flask(__name__)
    app.secret_key = 'secret-key'
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'app/static/uploads')
    app.config['SUMMARIZED_FOLDER'] = os.path.join(os.getcwd(), 'app/static/summarized_doc')
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100 MB limit

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['SUMMARIZED_FOLDER'], exist_ok=True)

    app.register_blueprint(home)
    app.register_blueprint(how_to_use)
    app.register_blueprint(about_us)
    app.register_blueprint(donate)
    app.register_blueprint(get_file)
    app.register_blueprint(get_file_pages)
    app.register_blueprint(summary_result)

    app.register_blueprint(admin_cos_library)
    app.register_blueprint(student_cos_library)

    return app


'''
    flow and definitions
    1. home - display the homepage
    2. about - display the about page
    3. get_started - display the basics or what is this
        website all about
    4. donate - donate page
    5. get_file - get pdf file from the user
    6. get_file_pages - get pages per chapter
        this is user input
    7. summary_result - display the result of the summary
        will display the RAG feature where user can 
        talk to llama3 about the file uploaded
'''