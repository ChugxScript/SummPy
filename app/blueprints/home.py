from flask import Blueprint, render_template, current_app
import os

home = Blueprint('home', __name__)

@home.route('/')
def home_page():  
      # Path to the uploads folder
      uploads_folder = os.path.join(current_app.config['UPLOAD_FOLDER'])

      # Check if the folder exists
      if os.path.exists(uploads_folder):
            # Loop through the files in the folder and delete them
            for filename in os.listdir(uploads_folder):
                  file_path = os.path.join(uploads_folder, filename)
                  try:
                        if os.path.isfile(file_path):
                              os.remove(file_path)
                  except Exception as e:
                        print(f"Error deleting file {file_path}: {e}")

      return render_template('home.html')
