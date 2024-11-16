from flask import Blueprint, render_template, session

admin_cos_library = Blueprint('admin_cos_library', __name__)

@admin_cos_library.route("/cos_library_admin")
def admin_cos_library_page():
    return render_template('admin/admin_cos_library.html')