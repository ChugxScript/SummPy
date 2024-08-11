from flask import Blueprint, render_template, request

summary_result = Blueprint('summary_result', __name__)

@summary_result.route('/summary_result')
def summary_result_page():  
      return render_template('summary_result.html')


