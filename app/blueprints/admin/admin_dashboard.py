from flask import Blueprint, render_template, session

admin_dashboard = Blueprint('admin_dashboard', __name__)

@admin_dashboard.route("/admin_dashboard")
def admin_dashboard_page():
    return render_template('admin/COS Library - Admin (dashboard).html')