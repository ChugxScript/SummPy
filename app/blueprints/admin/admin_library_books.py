from flask import Blueprint, render_template, session

admin_library_books = Blueprint('admin_library_books', __name__)

@admin_library_books.route("/cos_library_admin")
def admin_library_books_page():
    return render_template('admin/admin_library_books.html')