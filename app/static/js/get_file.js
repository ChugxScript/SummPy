document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const submitButton = document.getElementById('summ-btn');

    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            submitButton.style.backgroundColor = 'blue';
            submitButton.disabled = false;
            // Auto-submit the form
            this.form.submit();
        } else {
            submitButton.style.backgroundColor = 'red';
            submitButton.disabled = true;
        }
    });

    if (window.uploadedFileUrl) {
        console.log("Uploaded file URL:", window.uploadedFileUrl);
        // Additional JavaScript code to handle the uploaded file
    }
});