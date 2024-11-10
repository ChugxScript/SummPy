from flask import Blueprint, render_template, session

admin_add_edit = Blueprint('admin_add_edit', __name__)

@admin_add_edit.route("/admin_add_edit")
def admin_add_edit_page():
    return render_template('admin/admin_add_edit.html')