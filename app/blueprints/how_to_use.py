from flask import Blueprint, render_template, request

how_to_use = Blueprint('how_to_use', __name__)

@how_to_use.route('/how_to_use')
def how_to_use_page():
    return render_template('how_to_use.html')