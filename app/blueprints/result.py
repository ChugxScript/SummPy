from flask import Blueprint, render_template, request

result = Blueprint('result', __name__)

@result.route('/result')
def result_page():  
      return render_template('result.html')


