from flask import Blueprint, render_template, request

now = Blueprint('now', __name__)

@now.route('/now')
def now_page():
    return render_template('now.html')