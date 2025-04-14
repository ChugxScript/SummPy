let clickedDocument = null; 

document.addEventListener("DOMContentLoaded", function() {
    initializeSidebarOptions();
});

function initializeSidebarOptions() {
    const uploadedFilesElement = document.getElementById('uploaded_files');
    const uploadedFilesData = uploadedFilesElement.dataset.uploadedFiles;
    const uploadedFiles = JSON.parse(uploadedFilesData);
    console.log("Uploaded files:", uploadedFiles);

    uploadedFiles.forEach(file => {
        const li = document.createElement('li');
        li.classList.add("uploaded-file-names");
        li.textContent = file;
        uploadedFilesElement.appendChild(li);

        li.addEventListener("click", () => {
            handleDocumentClicked(file, li);
        });
    });
}

function handleDocumentClicked(filename, li){
    console.log(filename + " is clicked.")
    
    if(clickedDocument === null){
        clickedDocument = li;
        clickedDocument.classList.add("active-document-clicked");
    } else if (clickedDocument === li){
        console.log("do something");
    } else {
        clickedDocument.classList.remove("active-document-clicked");
        clickedDocument = li;
        clickedDocument.classList.add("active-document-clicked");
    }

    const current_clicked_result_content = document.getElementById("current_clicked_result_content");
    const baseName = filename.replace('.pdf', '');
    const jsonUrl = `/static/acre_data/minmax/${baseName}_minmax.json`;

    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            current_clicked_result_content.innerHTML = `
                <p>${filename}</p>
                <div class="result-summary-container">
                    <div class="details-category-container">
                        <p><strong>Original Word Count</strong></p>
                        <p id="details_category_value">Min = ${data.min_original}, Max = ${data.max_original}</p>
                    </div>
                    <div class="details-category-container">
                        <p><strong>Summary Word Count:</strong></p>
                        <p id="details_category_value">Min = ${data.min_summary}, Max = ${data.max_summary}</p>
                    </div>
                    <div class="details-category-container">
                        <p><strong>Semantic Score</strong></p>
                        <p id="details_category_value">${data.average_similarity}</p>
                    </div>
                </div>
                <div class="imrad-summary-result-content-container">
                    <div class="original-pdf-container">
                        <embed src="/static/uploads/${filename}" type="application/pdf">
                    </div>
                    <div class="summarized-pdf-container">
                        <embed src="/static/summarized_doc/summary_${filename}" type="application/pdf">
                        <a href="/static/summarized_doc/summary_${filename.replace('.pdf', '.docx')}" download>Download as docx</a>
                    </div>
                </div>
            `
        })
        .catch(error => {
            console.error('Error loading minmax:', error);
            current_clicked_result_content.innerHTML = `
                <p>${filename}</p>
                <p style="color:red;">Failed to load word count data.</p>
            `;
        });
}
