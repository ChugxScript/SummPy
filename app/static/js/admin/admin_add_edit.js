let authorCount = 1;
let panelCount = 1;

document.addEventListener("DOMContentLoaded", function() {
    initializeAuthorForm();
    initializePanelForm();
});

function initializeAuthorForm(){
    const author_list_main_container = document.getElementById("author_list_main_container");
    const add_author_container = document.getElementById("add_author_container");

    author_list_main_container.innerHTML += `
        <div class="author-list-container" id="author${authorCount}">
            <div class="author-name-container">
                <label for="authorFirstName${authorCount}">First Name</label>
                <input type="text" id="authorFirstName${authorCount}" name="authorFirstName${authorCount}" placeholder="First Name" required>
            </div>
            <div class="author-name-container">
                <label for="authorMiddleName${authorCount}">Middle Name</label>
                <input type="text" id="authorMiddleName${authorCount}" name="authorMiddleName${authorCount}" placeholder="Middle Name">
            </div>
            <div class="author-name-container">
                <label for="authorLastName${authorCount}">Last Name</label>
                <input type="text" id="authorLastName${authorCount}" name="authorLastName${authorCount}" placeholder="Last Name" required>
            </div>
        </div>
    `;

    add_author_container.addEventListener('click', () => {
        authorCount += 1;

        author_list_main_container.innerHTML += `
            <div class="author-list-container" id="author${authorCount}">
                <div class="author-name-container">
                    <label for="authorFirstName${authorCount}">First Name</label>
                    <input type="text" id="authorFirstName${authorCount}" name="authorFirstName${authorCount}" placeholder="First Name" required>
                </div>
                <div class="author-name-container">
                    <label for="authorMiddleName${authorCount}">Middle Name</label>
                    <input type="text" id="authorMiddleName${authorCount}" name="authorMiddleName${authorCount}" placeholder="Middle Name">
                </div>
                <div class="author-name-container">
                    <label for="authorLastName${authorCount}">Last Name</label>
                    <input type="text" id="authorLastName${authorCount}" name="authorLastName${authorCount}" placeholder="Last Name" required>
                </div>
                <img src="../../static/images/x.png" alt="x" id="remove_author${authorCount}" class="remove-author-form" onclick="removeAuthorDiv('author${authorCount}')">
            </div>
        `;
    });
}

function initializePanelForm(){
    const panel_list_main_container = document.getElementById("panel_list_main_container");
    const add_panel_container = document.getElementById("add_panel_container");

    panel_list_main_container.innerHTML += `
        <div class="panel-list-container" id="panel${panelCount}">
            <div class="panel-name-container">
                <label for="panelFirstName${panelCount}">First Name</label>
                <input type="text" id="panelFirstName${panelCount}" name="panelFirstName${panelCount}" placeholder="First Name" required>
            </div>
            <div class="panel-name-container">
                <label for="panelMiddleName${panelCount}">Middle Name</label>
                <input type="text" id="panelMiddleName${panelCount}" name="panelMiddleName${panelCount}" placeholder="Middle Name">
            </div>
            <div class="panel-name-container">
                <label for="panelLastName${panelCount}">Last Name</label>
                <input type="text" id="panelLastName${panelCount}" name="panelLastName${panelCount}" placeholder="Last Name" required>
            </div>
        </div>
    `;

    add_panel_container.addEventListener('click', () => {
        panelCount += 1;

        panel_list_main_container.innerHTML += `
            <div class="panel-list-container" id="panel${panelCount}">
                <div class="panel-name-container">
                    <label for="panelFirstName${panelCount}">First Name</label>
                    <input type="text" id="panelFirstName${panelCount}" name="panelFirstName${panelCount}" placeholder="First Name" required>
                </div>
                <div class="panel-name-container">
                    <label for="panelMiddleName${panelCount}">Middle Name</label>
                    <input type="text" id="panelMiddleName${panelCount}" name="panelMiddleName${panelCount}" placeholder="Middle Name">
                </div>
                <div class="panel-name-container">
                    <label for="panelLastName${panelCount}">Last Name</label>
                    <input type="text" id="panelLastName${panelCount}" name="panelLastName${panelCount}" placeholder="Last Name" required>
                </div>
                <img src="../../static/images/x.png" alt="x" id="remove_panel${panelCount}" class="remove-panel-form" onclick="removeAuthorDiv('panel${panelCount}')">
            </div>
        `;
    });
}