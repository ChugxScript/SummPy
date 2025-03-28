from app import create_app

app = create_app()

if __name__ == '__main__':
    host = '127.0.0.1'
    port = 5000
    print(f"Server running at http://{host}:{port}")
    app.run(debug=True, host=host, port=port)

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
    │   │   ├── uploads
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

'''
    page nums
        se - 5 10 29 38 46 49
        buzz match - 10 19 44 52 63 65
        ns4a essay checker - 12 18 84 109 131 138
        automating - 10 20 32 41 50 52
        automated assay - 12 18 84 109 131 138
        adversity - 2 15 43 52 59 63
'''