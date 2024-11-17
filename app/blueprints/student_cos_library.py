from flask import Blueprint, render_template, session

student_cos_library = Blueprint('student_cos_library', __name__)

@student_cos_library.route("/cos_library_student")
def student_cos_library_page():
    return render_template('student_cos_library.html')