from flask import Blueprint, render_template, session

student_library_books = Blueprint('student_library_books', __name__)

@student_library_books.route("/cos_library_student")
def student_library_books_page():
    return render_template('student/cos_library_books.html')