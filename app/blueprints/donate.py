from flask import Blueprint, render_template, session

donate = Blueprint('donate', __name__)

@donate.route("/donate")
def donate_page():
    return render_template('donate.html')