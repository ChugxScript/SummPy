from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)

'''
    File structure
    SummPy
    ├── app
    │   ├── blueprints
    │   │   ├── BART
    │   │   │   ├── summarize_doc.py
    │   │   ├── about.py
    │   │   ├── donate.py
    │   │   ├── get_file_page.py
    │   │   ├── get_file.py
    │   │   ├── get_started.py
    │   │   ├── home.py
    │   │   ├── result.py
    │   ├── static
    │   │   ├── css
    │   │   ├── images
    │   │   ├── js
    │   │   │   ├── get_file.js
    │   ├── templates
    │   │   ├── about.html
    │   │   ├── donate.html
    │   │   ├── get_file_page.html
    │   │   ├── get_file.html
    │   │   ├── get_started.html
    │   │   ├── home.html
    │   │   ├── result.html
    │   ├── testing data
    │   ├── __init__.py -> initialize flask app
    ├── venv
    ├── .gitignore
    ├── app.py
    ├── LICENSE
    ├── README.md
    ├── requirements.txt
'''