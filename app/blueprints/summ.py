from flask import Blueprint, render_template, session

summ = Blueprint('summ', __name__)

@summ.route("/summ")
def summ_page():
    return render_template('summ.html')