import {
    fdb,
    getDocs,
    doc,
    addDoc,
    collection,
    deleteDoc,
    updateDoc,
    setDoc,
} from "./firebase_config.js";

let currentSidebarMenuOption;
let dataFlag = "";

document.addEventListener("DOMContentLoaded", function() {
    // setOnclickOnCards();
    initializeAuthorForm();
    initializePanelForm();
    initializeFormFilter();
    initializeDashboard();

    currentSidebarMenuOption = document.getElementById("dashboard_tab");
    currentSidebarMenuOption.classList.add("selected-side-bar-option");
    sideBarMenuHandle();
});

// this code is reposible to handle the click event values 
// inside the admin_cos_library
function setOnclickOnCards(){
    const main_content_container = document.getElementById("main_content_container");
    const add_button_trigger = document.getElementById("add_button_trigger");
    const edit_form_content_container = document.getElementById("edit_form_content_container");
    const back_button_edit = document.getElementById("back_button_edit");
    const clear_study_document_container = document.getElementById("clear_study_document_container");
    const clear_moa_document_container = document.getElementById("clear_moa_document_container");
    const studyFileInput = document.getElementById("study_file");
    const moa_file = document.getElementById("moa_file");

    add_button_trigger.addEventListener('click', () => {
        main_content_container.style.display = "none";
        edit_form_content_container.style.display = "flex";
        dataFlag = "ADD";
        handleAddBookForm();
    });

    back_button_edit.addEventListener('click', () => {
        main_content_container.style.display = "flex";
        edit_form_content_container.style.display = "none";
        const form = document.getElementById("add_edit_book_form");
        const author_list_main_container = document.getElementById("author_list_main_container");
        const panel_list_main_container = document.getElementById("panel_list_main_container");
        form.reset();
        author_list_main_container.innerHTML = '';
        panel_list_main_container.innerHTML = '';
        initializeAuthorForm();
        initializePanelForm();
    });

    clear_study_document_container.addEventListener("click", () => {
        studyFileInput.value = ""; 
    });

    clear_moa_document_container.addEventListener("click", () => {
        moa_file.value = ""; 
    });
}

function setOnclickOnCards2(){
    const main_content_container = document.getElementById("main_content_container");
    const view_book_details_container = document.getElementById("view_book_details_container");
    const edit_form_content_container = document.getElementById("edit_form_content_container");

    const left_card_details = document.querySelectorAll(".left-card-details");
    const right_card_details = document.querySelectorAll(".right-card-details");
    const card_edit_button_container = document.querySelectorAll(".card-edit-button-contianer");
    const card_remove_button_container = document.querySelectorAll(".card-remove-button-container");

    const back_button_view = document.getElementById("back_button_view");
    const back_button_edit = document.getElementById("back_button_edit");

    left_card_details.forEach(cards => {
        cards.addEventListener('click', () => {
            main_content_container.style.display = "none";
            view_book_details_container.style.display = "flex";
            const data = JSON.parse(cards.getAttribute("data-content").replace(/&quot;/g, '"'));
            handleClickedBookDetails(data);
        });
    });

    right_card_details.forEach(cards => {
        cards.addEventListener('click', () => {
            main_content_container.style.display = "none";
            view_book_details_container.style.display = "flex";
        });
    });

    card_edit_button_container.forEach(cards => {
        cards.addEventListener('click', () => {
            main_content_container.style.display = "none";
            edit_form_content_container.style.display = "flex";
            const data = JSON.parse(cards.getAttribute("data-content").replace(/&quot;/g, '"'));
            const documentId = cards.getAttribute("data-id");
            dataFlag = "EDIT";
            handleEditBookForm(data, documentId);
        });
    });

    card_remove_button_container.forEach(cards => {
        cards.addEventListener('click', () => {
            Swal.fire({
                title: "Remove Book",
                text: "Do you want to remove this book?",
                icon: "question",
                showDenyButton: true,
                denyButtonText: 'CANCEL',
                confirmButtonText: 'CONFIRM',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const documentId = cards.getAttribute("data-id");
                    const collectionRef = currentSidebarMenuOption.textContent.trim().toLowerCase().replace(/ /g, "_")
                    const referenceRef = collection(fdb, collectionRef);
                    
                    try {
                        const docRef = doc(referenceRef, documentId);
                        await deleteDoc(docRef);
                        
                        Swal.fire({
                            title: 'Success!',
                            text: 'Book removed successfully.',
                            icon: 'success',
                            confirmButtonText: 'CONFIRM',
                        }).then(() => {
                            switch(collectionRef){
                                case "under_graduate": populateStudyContainer("under_graduate_tab"); break;
                                case "graduate": populateStudyContainer("graduate_tab"); break;
                                case "masteral": populateStudyContainer("masteral_tab"); break;
                                case "dissertation": populateStudyContainer("dissertation_tab"); break;
                                case "doctorate": populateStudyContainer("doctorate_tab"); break;
                                default: break;
                            }
                        });
    
                    } catch (error) {
                        console.error("Error deleting document: ", error);
                        Swal.fire({
                            title: 'Error!',
                            text: error,
                            icon: 'error',
                            confirmButtonText: 'OK',
                        });
                    }
                } 
            });
        });
    });

    back_button_view.addEventListener('click', () => {
        main_content_container.style.display = "flex";
        view_book_details_container.style.display = "none";
    });

    back_button_edit.addEventListener('click', () => {
        main_content_container.style.display = "flex";
        edit_form_content_container.style.display = "none";
    });
}

function initializeAuthorForm() {
    const author_list_main_container = document.getElementById("author_list_main_container");
    const add_author_container = document.getElementById("add_author_container");
    let authorCount = document.querySelectorAll(".author-list-container").length;

    // Function to add an author input container
    function addAuthorContainer(count) {
        // Create a new div element for the new author container
        const newAuthorDiv = document.createElement("div");
        newAuthorDiv.classList.add("author-list-container");
        newAuthorDiv.id = `author${count}`;
        
        // Set the inner HTML for the new author div
        newAuthorDiv.innerHTML = `
            <div class="author-name-container">
                <label for="authorFirstName${count}">First Name</label>
                <input type="text" id="authorFirstName${count}" name="authorFirstName${count}" placeholder="First Name" required>
            </div>
            <div class="author-name-container">
                <label for="authorMiddleName${count}">Middle Name</label>
                <input type="text" id="authorMiddleName${count}" name="authorMiddleName${count}" placeholder="Middle Name">
            </div>
            <div class="author-name-container">
                <label for="authorLastName${count}">Last Name</label>
                <input type="text" id="authorLastName${count}" name="authorLastName${count}" placeholder="Last Name" required>
            </div>
        `;

        if(count > 0){
            newAuthorDiv.innerHTML += `<img src="../../static/images/x.png" alt="x" class="remove-author-form" onclick="removeAuthorDiv('author${count}')">`
        }

        // Append the new div to the author list container
        author_list_main_container.appendChild(newAuthorDiv);
    }

    // Initial author container
    addAuthorContainer(authorCount);

    // Add event listener to add more authors without clearing previous inputs
    add_author_container.addEventListener('click', () => {
        authorCount = document.querySelectorAll(".author-list-container").length;
        addAuthorContainer(authorCount);
    });
}

function initializePanelForm() {
    const panel_list_main_container = document.getElementById("panel_list_main_container");
    const add_panel_container = document.getElementById("add_panel_container");
    let panelCount = document.querySelectorAll(".panel-list-container").length;

    function addPanelContainer(count) {
        const newPanelDiv = document.createElement("div");
        newPanelDiv.classList.add("panel-list-container");
        newPanelDiv.id = `panel${count}`;
        
        // Set the inner HTML for the new author div
        newPanelDiv.innerHTML = `
            <div class="panel-name-container">
                <label for="panelFirstName${count}">First Name</label>
                <input type="text" id="panelFirstName${count}" name="panelFirstName${count}" placeholder="First Name" required>
            </div>
            <div class="panel-name-container">
                <label for="panelMiddleName${count}">Middle Name</label>
                <input type="text" id="panelMiddleName${count}" name="panelMiddleName${count}" placeholder="Middle Name">
            </div>
            <div class="panel-name-container">
                <label for="panelLastName${count}">Last Name</label>
                <input type="text" id="panelLastName${count}" name="panelLastName${count}" placeholder="Last Name" required>
            </div>
        `;

        if(count > 0){
            newPanelDiv.innerHTML += `<img src="../../static/images/x.png" alt="x" id="remove_panel${count}" class="remove-panel-form" onclick="removeAuthorDiv('panel${count}')">`
        }

        panel_list_main_container.appendChild(newPanelDiv);
    }

    addPanelContainer(panelCount);

    // Add event listener to add more panels without clearing previous inputs
    add_panel_container.addEventListener('click', () => {
        panelCount = document.querySelectorAll(".panel-list-container").length;
        addPanelContainer(panelCount);
    });
}

function initializeFormFilter(){
    const dayInput = document.getElementById("day_input_value");
    const yearInput = document.getElementById("year_input_value");
    
    dayInput.addEventListener("input", function () {
        if (this.value.length > 2) {
            this.value = this.value.slice(0, 2);
        }
    });

    yearInput.addEventListener("input", function () {
        if (this.value.length > 4) {
            this.value = this.value.slice(0, 4);
        }
    });
}

// this shows the visualization of dashboard
// using charts base on our data
function initializeDashboard(){
    InitializeCSPublishedBooksPerYear();
    InitializeITPublishedBooksPerYear();
    InitializeISPublishedBooksPerYear();
    InitializeTotalPublishedBooksPerYear();
    InitializeCSPublishedBooksPerCategory();
    InitializeITPublishedBooksPerCategory();
    InitializeISPublishedBooksPerCategory();
}

function InitializeCSPublishedBooksPerYear(){
    // the flow here would be
    // retrieve the docs from the database
    // iterate through all the data then
    // collect these stuff and store them in 
    // array then place it inside the option
    // 'year' and the number of published book per year
    const options = {
        chart: {
            type: 'line',
            height: 300, // Custom height
            toolbar: {
                show: true // Hide toolbar if not needed
            }
        },
        series: [
            {
                name: 'IT',
                data: [10, 15, 18, 22, 28, 35, 42, 50, 60, 75, 85], 
            },
            {
                name: 'CS',
                data: [15, 10, 13, 29, 22, 34, 46, 57, 69, 72, 88] 
            },
            {
                name: 'IS',
                data: [8, 13, 16, 24, 21, 32, 43, 53, 67, 74, 83] 
            },
        ],
        xaxis: {
            categories: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'], // Example labels for each bar
            labels: {
                style: {
                    colors: '#ffffff', // X-axis text color
                    fontSize: '14px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#ffffff', // Y-axis text color
                    fontSize: '14px'
                }
            }
        },
        colors: ['#fbff00','#ffffff', '#A904FE'],  // Bar color
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#0084ff'] // Data label color
            }
        },
        grid: {
            borderColor: 'rgba(200, 200, 200, 0.3)', // Grid line color
            strokeDashArray: 4 // Dashed grid lines
        },
        tooltip: {
            theme: 'dark', // Sets the tooltip background to light
            style: {
                fontSize: '12px', // Customize font size
                color: '#333' // Tooltip text color
            },
            background: {
                backgroundColor: '#0084ff', // Customize tooltip background color
                borderRadius: 5, // Optional: Add rounded corners
                borderColor: '#888', // Optional: Add a border color
                borderWidth: 1
            }
        },
        stroke: {
          curve: 'smooth'
        },
        legend: {
            labels: {
                colors: '#FFFFFF' // Sets legend text color to white
            },
            markers: {
                fillColors: ['#FFFF00', '#1E90FF', '#A904FE'] // Optional: matching legend marker colors to series
            }
        },
        dataLabels: {
            enabled: false // Disable data labels to hide numbers
        },
    };

    // Create the chart
    const chart = new ApexCharts(document.querySelector("#cs_published_books_chart_container"), options);
    chart.render();
}

function InitializeITPublishedBooksPerYear(){
    const options = {
        chart: {
            type: 'line',
            height: 300, 
            toolbar: {
                show: true 
            }
        },
        series: [
            {
                name: 'IT',
                data: [10, 15, 18, 22, 28, 35, 42, 50, 60, 75, 85], 
            },
            {
                name: 'CS',
                data: [15, 10, 13, 29, 22, 34, 46, 57, 69, 72, 88] 
            },
            {
                name: 'IS',
                data: [8, 13, 16, 24, 21, 32, 43, 53, 67, 74, 83] 
            },
        ],
        xaxis: {
            categories: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'],
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '14px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '14px'
                }
            }
        },
        colors: ['#fbff00','#ffffff', '#A904FE'], 
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#0084ff'] 
            }
        },
        grid: {
            borderColor: 'rgba(200, 200, 200, 0.3)', 
            strokeDashArray: 4 
        },
        tooltip: {
            theme: 'dark', 
            style: {
                fontSize: '12px', 
                color: '#333' 
            },
            background: {
                backgroundColor: '#0084ff', 
                borderRadius: 5, 
                borderColor: '#888', 
                borderWidth: 1
            }
        },
        stroke: {
          curve: 'smooth'
        },
        legend: {
            labels: {
                colors: '#FFFFFF'
            },
            markers: {
                fillColors: ['#FFFF00', '#1E90FF', '#A904FE']
            }
        },
        dataLabels: {
            enabled: false 
        },
    };

    const chart = new ApexCharts(document.querySelector("#it_published_books_chart_container"), options);
    chart.render();
}

function InitializeISPublishedBooksPerYear(){
    const options = {
        chart: {
            type: 'line',
            height: 300, 
            toolbar: {
                show: true 
            }
        },
        series: [
            {
                name: 'IT',
                data: [10, 15, 18, 22, 28, 35, 42, 50, 60, 75, 85], 
            },
            {
                name: 'CS',
                data: [15, 10, 13, 29, 22, 34, 46, 57, 69, 72, 88] 
            },
            {
                name: 'IS',
                data: [8, 13, 16, 24, 21, 32, 43, 53, 67, 74, 83] 
            },
        ],
        xaxis: {
            categories: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'], 
            labels: {
                style: {
                    colors: '#ffffff', 
                    fontSize: '14px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#ffffff', 
                    fontSize: '14px'
                }
            }
        },
        colors: ['#fbff00','#ffffff', '#A904FE'], 
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#0084ff'] 
            }
        },
        grid: {
            borderColor: 'rgba(200, 200, 200, 0.3)', 
            strokeDashArray: 4 
        },
        tooltip: {
            theme: 'dark', 
            style: {
                fontSize: '12px', 
                color: '#333' 
            },
            background: {
                backgroundColor: '#0084ff', 
                borderRadius: 5, 
                borderColor: '#888', 
                borderWidth: 1
            }
        },
        stroke: {
          curve: 'smooth'
        },
        legend: {
            labels: {
                colors: '#FFFFFF'
            },
            markers: {
                fillColors: ['#FFFF00', '#1E90FF', '#A904FE']
            }
        },
        dataLabels: {
            enabled: false 
        },
    };

    const chart = new ApexCharts(document.querySelector("#is_published_books_chart_container"), options);
    chart.render();
}

function InitializeTotalPublishedBooksPerYear(){
    const options = {
        chart: {
            type: 'bar',
            height: 500, 
            toolbar: {
                show: true
            }
        },
        series: [
            {
                name: 'IT',
                data: [10, 15, 18, 22, 28, 35, 42, 50, 60, 75, 85], 
            },
            {
                name: 'CS',
                data: [15, 10, 13, 29, 22, 34, 46, 57, 69, 72, 88] 
            },
            {
                name: 'IS',
                data: [8, 13, 16, 24, 21, 32, 43, 53, 67, 74, 83] 
            },
        ],
        xaxis: {
            categories: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'],
            labels: {
                style: {
                    colors: '#ffffff', 
                    fontSize: '14px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#ffffff', 
                    fontSize: '14px'
                }
            }
        },
        colors: ['#fbff00','#ffffff', '#A904FE'], 
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#0084ff'] 
            }
        },
        grid: {
            borderColor: 'rgba(200, 200, 200, 0.3)', 
            strokeDashArray: 4 
        },
        tooltip: {
            theme: 'dark', 
            style: {
                fontSize: '12px', 
                color: '#333'
            },
            background: {
                backgroundColor: '#0084ff', 
                borderRadius: 5, 
                borderColor: '#888', 
                borderWidth: 1
            }
        },
        stroke: {
          curve: 'smooth'
        },
        legend: {
            labels: {
                colors: '#FFFFFF'
            },
            markers: {
                fillColors: ['#FFFF00', '#1E90FF', '#A904FE']
            }
        },
        dataLabels: {
            enabled: true 
        },
    };

    const chart = new ApexCharts(document.querySelector("#dashboard_all_total_published_books_chart"), options);
    chart.render();
}

function InitializeCSPublishedBooksPerCategory(){
    const options = {
        chart: {
            type: 'pie',
            height: 500, 
            toolbar: {
                show: true
            }
        },
        series: [ 40, 31, 23, 12, 7 ],
        labels: ['Under Graduate', 'Graduate', 'Masteral', 'Dissertation', 'Doctorate'],
        colors: ['#fbff00','#9b1462', '#A904FE', '#6750A4', '#a46b50'], 
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#0084ff'],
                fontSize: '12px'
            }
        },
        tooltip: {
            theme: 'dark', 
            style: {
                fontSize: '12px', 
                color: '#333'
            },
            background: {
                backgroundColor: '#0084ff', 
                borderRadius: 5, 
                borderColor: '#888', 
                borderWidth: 1
            }
        },
        legend: {
            labels: {
                colors: '#FFFFFF'
            },
            markers: {
                fillColors: ['#fbff00','#9b1462', '#A904FE', '#6750A4', '#a46b50']
            }
        },
        dataLabels: {
            enabled: true 
        },
    };

    const chart = new ApexCharts(document.querySelector("#cs_published_books_chart_per_category_container"), options);
    chart.render();
}

function InitializeITPublishedBooksPerCategory(){
    const options = {
        chart: {
            type: 'pie',
            height: 500, 
            toolbar: {
                show: true
            }
        },
        series: [ 40, 31, 23, 12, 7 ],
        labels: ['Under Graduate', 'Graduate', 'Masteral', 'Dissertation', 'Doctorate'],
        colors: ['#fbff00','#9b1462', '#A904FE', '#6750A4', '#a46b50'], 
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#0084ff'],
                fontSize: '12px'
            }
        },
        tooltip: {
            theme: 'dark', 
            style: {
                fontSize: '12px', 
                color: '#333'
            },
            background: {
                backgroundColor: '#0084ff', 
                borderRadius: 5, 
                borderColor: '#888', 
                borderWidth: 1
            }
        },
        legend: {
            labels: {
                colors: '#FFFFFF'
            },
            markers: {
                fillColors: ['#fbff00','#9b1462', '#A904FE', '#6750A4', '#a46b50']
            }
        },
        dataLabels: {
            enabled: true 
        },
    };

    const chart = new ApexCharts(document.querySelector("#it_published_books_chart_per_category_container"), options);
    chart.render();
}

function InitializeISPublishedBooksPerCategory(){
    const options = {
        chart: {
            type: 'pie',
            height: 500, 
            toolbar: {
                show: true
            }
        },
        series: [ 40, 31, 23, 12, 7 ],
        labels: ['Under Graduate', 'Graduate', 'Masteral', 'Dissertation', 'Doctorate'],
        colors: ['#fbff00','#9b1462', '#A904FE', '#6750A4', '#a46b50'], 
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#0084ff'],
                fontSize: '12px'
            }
        },
        tooltip: {
            theme: 'dark', 
            style: {
                fontSize: '12px', 
                color: '#333'
            },
            background: {
                backgroundColor: '#0084ff', 
                borderRadius: 5, 
                borderColor: '#888', 
                borderWidth: 1
            }
        },
        legend: {
            labels: {
                colors: '#FFFFFF'
            },
            markers: {
                fillColors: ['#fbff00','#9b1462', '#A904FE', '#6750A4', '#a46b50']
            }
        },
        dataLabels: {
            enabled: true 
        },
    };

    const chart = new ApexCharts(document.querySelector("#is_published_books_chart_per_category_container"), options);
    chart.render();
}

// handles the which menu sidebar option
// is being clicked and display the 
// content
function sideBarMenuHandle() {
    const tabs = [
        { id: "dashboard_tab", container: "dashboard_content_container" },
        { id: "under_graduate_tab", container: "main_content_container" },
        { id: "graduate_tab", container: "main_content_container" },
        { id: "masteral_tab", container: "main_content_container" },
        { id: "dissertation_tab", container: "main_content_container" },
        { id: "doctorate_tab", container: "main_content_container" }
    ];

    tabs.forEach(tab => {
        const tabElement = document.getElementById(tab.id);
        tabElement.addEventListener('click', () => handleTabClick(tab.id, tab.container));
    });
}

function handleTabClick(tabId, containerId) {
    if (currentSidebarMenuOption.id === tabId) {
        console.log(`${tabId} is clicked.`);
        populateStudyContainer(tabId);
        return;
    }

    // Hide all containers
    const allContainers = [
        "dashboard_content_container", 
        "main_content_container", 
        "view_book_details_container", 
        "edit_form_content_container", 
        "modal_content_container"
    ];
    allContainers.forEach(id => document.getElementById(id).style.display = "none");

    // Show the selected container
    document.getElementById(containerId).style.display = "flex";

    // Update selected tab styling
    currentSidebarMenuOption.classList.remove("selected-side-bar-option");
    currentSidebarMenuOption = document.getElementById(tabId);
    currentSidebarMenuOption.classList.add("selected-side-bar-option");

    // populate the 'study-card-container' base on
    // the 'tabId' being clicked
    populateStudyContainer(tabId);
}

function populateStudyContainer(tabId){
    switch(tabId){
        case "under_graduate_tab": populateUnderGradStudies(); break;
        case "graduate_tab": populateGradStudies(); break;
        case "masteral_tab": populateMasteralStudies(); break;
        case "dissertation_tab": populateDissertationStudies(); break;
        case "doctorate_tab": populateDoctorateStudies(); break;
        default: break;
    }
    setOnclickOnCards();
}

async function populateUnderGradStudies() {
    const study_card_container = document.getElementById("study_card_container");
    study_card_container.innerHTML = '';

    // Reference to the 'under_grad' collection in Firestore
    const underGradCollectionRef = collection(fdb, 'under_graduate');

    try {
        // Fetch all documents in the 'under_grad' collection
        const querySnapshot = await getDocs(underGradCollectionRef);

        // Check if the snapshot is empty
        if (querySnapshot.size === 1) {
            // Display message if there are no documents
            study_card_container.innerHTML = '<h1>No Data</h1>';
            return;  // Exit the function since there are no documents to display
        }
        
        // Iterate over each document in the collection
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
                // Extract data from the document
                const studyTitle = data.title || "No Title";
                const publicationDate = `${data.year_published.day} ${data.year_published.month} ${data.year_published.year}`;
                const authors = data.authors ? data.authors.map(author => `${author.firstName} ${author.lastName}`).join(", ") : "No Authors";
                const course = data.course || "No Course";
                let category = data.category || "No Category";
                const fieldStudy = data.field_of_study ? data.field_of_study.join(", ") : "No Fields";

                switch(category){
                    case "under_graduate": category = "UNDER GRADUATE"; break;
                    case "graduate": category = "GRADUATE"; break;
                    case "dissertation": category = "DISSERTATION"; break;
                    case "masteral": category = "MASTERAL"; break;
                    case "doctorate": category = "DOCTORATE"; break;
                    default: break;
                }

                // Append the study card with dynamic data
                const jsonData = JSON.stringify(data).replace(/"/g, '&quot;');

                study_card_container.innerHTML += `
                    <div class="study-card-details">
                        <div class="left-card-details" data-content="${jsonData}">
                            <p class="card-study-title">${studyTitle}</p>
                            <p class="card-publication-date">${publicationDate}</p>
                            <p class="card-authors">Authors: ${authors}</p>
                            <p class="card-course">Course: ${course}</p>
                        </div>
                        <div class="right-card-details" data-content="${jsonData}">
                            <p class="card-category">${category}</p>
                            <p class="card-field-study">Fields: ${fieldStudy}</p>
                        </div>
                        <div class="right-card-details-options">
                            <div class="card-edit-button-contianer" data-content="${jsonData}" data-id="${doc.id}">
                                <img src="../../static/images/edit_icon1.png" alt="">
                                <p>Edit</p>
                            </div>
                            <div class="card-remove-button-container" data-id="${doc.id}">
                                <img src="../../static/images/delete_icon1.png" alt="">
                                <p>Remove</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
    setOnclickOnCards2();
}

async function populateGradStudies(){
    const study_card_container = document.getElementById("study_card_container");
    study_card_container.innerHTML = '';

    // Reference to the 'under_grad' collection in Firestore
    const underGradCollectionRef = collection(fdb, 'graduate');

    try {
        // Fetch all documents in the 'under_grad' collection
        const querySnapshot = await getDocs(underGradCollectionRef);

        // Check if the snapshot is empty
        if (querySnapshot.size === 1) {
            // Display message if there are no documents
            study_card_container.innerHTML = '<h1>No Data</h1>';
            return;  // Exit the function since there are no documents to display
        }
        
        // Iterate over each document in the collection
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
                // Extract data from the document
                const studyTitle = data.title || "No Title";
                const publicationDate = `${data.year_published.day} ${data.year_published.month} ${data.year_published.year}`;
                const authors = data.authors ? data.authors.map(author => `${author.firstName} ${author.lastName}`).join(", ") : "No Authors";
                const course = data.course || "No Course";
                let category = data.category || "No Category";
                const fieldStudy = data.field_of_study ? data.field_of_study.join(", ") : "No Fields";

                switch(category){
                    case "under_graduate": category = "UNDER GRADUATE"; break;
                    case "graduate": category = "GRADUATE"; break;
                    case "dissertation": category = "DISSERTATION"; break;
                    case "masteral": category = "MASTERAL"; break;
                    case "doctorate": category = "DOCTORATE"; break;
                    default: break;
                }

                // Append the study card with dynamic data
                const jsonData = JSON.stringify(data).replace(/"/g, '&quot;');

                study_card_container.innerHTML += `
                    <div class="study-card-details">
                        <div class="left-card-details" data-content="${jsonData}">
                            <p class="card-study-title">${studyTitle}</p>
                            <p class="card-publication-date">${publicationDate}</p>
                            <p class="card-authors">Authors: ${authors}</p>
                            <p class="card-course">Course: ${course}</p>
                        </div>
                        <div class="right-card-details" data-content="${jsonData}">
                            <p class="card-category">${category}</p>
                            <p class="card-field-study">Fields: ${fieldStudy}</p>
                        </div>
                        <div class="right-card-details-options">
                            <div class="card-edit-button-contianer" data-content="${jsonData}" data-id="${doc.id}">
                                <img src="../../static/images/edit_icon1.png" alt="">
                                <p>Edit</p>
                            </div>
                            <div class="card-remove-button-container" data-id="${doc.id}">
                                <img src="../../static/images/delete_icon1.png" alt="">
                                <p>Remove</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
    setOnclickOnCards2();
}

function populateMasteralStudies(){
    const study_card_container = document.getElementById("study_card_container");
    study_card_container.innerHTML = '';
    for(let i = 0; i < 5; i++){
        study_card_container.innerHTML += `
        <div class="study-card-details">
            <div class="left-card-details">
                <p class="card-study-title">STUDY TITLE: MASTERAL ${i}</p>
                <p class="card-publication-date">Publication date</p>
                <p class="card-authors">Authors</p>
                <p class="card-course">Course</p>
            </div>
            <div class="right-card-details">
                <p class="card-category">Category</p>
                <p class="card-field-study">Field of the Study</p>
            </div>
            <div class="right-card-details-options">
                <div class="card-edit-button-contianer">
                    <img src="../../static/images/edit_icon1.png" alt="">
                    <p>Edit</p>
                </div>
                <div class="card-remove-button-container">
                    <img src="../../static/images/delete_icon1.png" alt="">
                    <p>Remove</p>
                </div>
            </div>
        </div>
        `;
    }
}

function populateDissertationStudies(){
    const study_card_container = document.getElementById("study_card_container");
    study_card_container.innerHTML = '';
    for(let i = 0; i < 5; i++){
        study_card_container.innerHTML += `
        <div class="study-card-details">
            <div class="left-card-details">
                <p class="card-study-title">STUDY TITLE: DISSERTATION ${i}</p>
                <p class="card-publication-date">Publication date</p>
                <p class="card-authors">Authors</p>
                <p class="card-course">Course</p>
            </div>
            <div class="right-card-details">
                <p class="card-category">Category</p>
                <p class="card-field-study">Field of the Study</p>
            </div>
            <div class="right-card-details-options">
                <div class="card-edit-button-contianer">
                    <img src="../../static/images/edit_icon1.png" alt="">
                    <p>Edit</p>
                </div>
                <div class="card-remove-button-container">
                    <img src="../../static/images/delete_icon1.png" alt="">
                    <p>Remove</p>
                </div>
            </div>
        </div>
        `;
    }
}

function populateDoctorateStudies(){
    const study_card_container = document.getElementById("study_card_container");
    study_card_container.innerHTML = '';
    for(let i = 0; i < 5; i++){
        study_card_container.innerHTML += `
        <div class="study-card-details">
            <div class="left-card-details">
                <p class="card-study-title">STUDY TITLE: DOCTORATE ${i}</p>
                <p class="card-publication-date">Publication date</p>
                <p class="card-authors">Authors</p>
                <p class="card-course">Course</p>
            </div>
            <div class="right-card-details">
                <p class="card-category">Category</p>
                <p class="card-field-study">Field of the Study</p>
            </div>
            <div class="right-card-details-options">
                <div class="card-edit-button-contianer">
                    <img src="../../static/images/edit_icon1.png" alt="">
                    <p>Edit</p>
                </div>
                <div class="card-remove-button-container">
                    <img src="../../static/images/delete_icon1.png" alt="">
                    <p>Remove</p>
                </div>
            </div>
        </div>
        `;
    }
}

function handleClickedBookDetails(data){
    const margin_container = document.getElementById("margin_container");

    const studyTitle = data.title || "No Title";
    const publicationDate = `${data.year_published.day} ${data.year_published.month} ${data.year_published.year}`;
    const course = data.course || "No Course";
    let category = data.category || "No Category";
    const fieldStudy = data.field_of_study ? data.field_of_study.join(", ") : "No Fields";

    switch(category){
        case "under_graduate": category = "UNDER GRADUATE"; break;
        case "graduate": category = "GRADUATE"; break;
        case "dissertation": category = "DISSERTATION"; break;
        case "masteral": category = "MASTERAL"; break;
        case "doctorate": category = "DOCTORATE"; break;
        default: break;
    }

    const authorsContent = data.authors
        ? data.authors.map(author => `<li>${author.firstName} ${author.lastName}</li>`).join("")
        : "<p>No Authors</p>";

    const panelsContent = data.panels
        ? data.panels.map(panel => `<li>${panel.firstName} ${panel.lastName}</li>`).join("")
        : "<p>No Panels</p>";

    margin_container.innerHTML = `
        <p id="study_title">${studyTitle}</p>
        <p id="publication_date">${publicationDate}</p>

        <div class="course-category-container">
            <div class="details-course-container">
                <p class="details-course-title">Course:</p>
                <p id="details_course_value">${course}</p>
            </div>
            <div class="details-category-container">
                <p class="details-category-title">Category:</p>
                <p id="details_category_value">${category}</p>
            </div>
        </div>

        <div class="authors-panels-container">
            <div class="details-authors-container">
                <p class="details-authors-title">Authors:</p>
                ${authorsContent}
            </div>
            <div class="details-panels-container">
                <p class="details-panels-title">Panels:</p>
                ${panelsContent} 
            </div>
        </div>

        <div class="original-summarized-container">
            <div class="details-original-container">
                <p class="details-original-title">Original</p>
                <embed src="../static/test/se_pdf.pdf" type="application/pdf">
            </div>
            <div class="details-summarized-container">
                <p class="details-summarized-title">Summarized Result</p>
                <embed src="../static/test/se_pdf.pdf" type="application/pdf">
            </div>
        </div>
    `;

    if(data.memorandum_of_agreement){
        margin_container.innerHTML += `
        <div id="MOA_container">
            <img src="../static/images/redirect_icon1.png" alt="">
            <p class="MOA-title">Memorandum of Agreement</p>
        </div>
        `;
    }
}

function handleAddBookForm() {
    const form = document.getElementById("add_edit_book_form");

    async function handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        // Get values from each field
        const studyTitle = document.getElementById("studyTitle").value;
        const dayInputValue = document.getElementById("day_input_value").value;
        const monthInputValue = document.getElementById("month_input_value").value;
        const yearInputValue = document.getElementById("year_input_value").value;
        const selectedCategory = document.getElementById("selected_category").value;
        const selectedCourse = document.getElementById("selected_course").value;
        const fieldOfTheStudy = document.getElementById("field_of_the_study").value;
        const studyFile = document.getElementById("study_file").files[0];
        const moaFile = document.getElementById("moa_file").files[0];

        // Format the date based on the database schema 
        let formattedPublishedDate = {
            day: dayInputValue,
            month: monthInputValue,
            year: yearInputValue,
        };

        // Split the input based on ',' and assign directly to fieldStudy
        let fieldStudy = [];
        fieldStudy.push(...fieldOfTheStudy.split(","));
    
        // Retrieve the list of authors based on .author-list-container elements
        const authors = [];
        const authorContainers = document.querySelectorAll(".author-list-container");

        authorContainers.forEach((container, index) => {
            const firstName = container.querySelector(`input[name="authorFirstName${index}"]`);
            const middleName = container.querySelector(`input[name="authorMiddleName${index}"]`);
            const lastName = container.querySelector(`input[name="authorLastName${index}"]`);

            authors.push({
                firstName: firstName ? firstName.value : '',
                middleName: middleName ? middleName.value : '',
                lastName: lastName ? lastName.value : ''
            });
        });

        // Retrieve the list of panels based on .panel-list-container elements
        const panels = [];
        const panelContainers = document.querySelectorAll(".panel-list-container");

        panelContainers.forEach((container, index) => {
            const firstName = container.querySelector(`input[name="panelFirstName${index}"]`);
            const middleName = container.querySelector(`input[name="panelMiddleName${index}"]`);
            const lastName = container.querySelector(`input[name="panelLastName${index}"]`);

            panels.push({
                firstName: firstName ? firstName.value : '',
                middleName: middleName ? middleName.value : '',
                lastName: lastName ? lastName.value : ''
            });
        });
    
        // Create the data object to be saved in Firestore
        const data = {
            authors: authors,
            category: selectedCategory,
            course: selectedCourse,
            field_of_study: fieldStudy,
            memorandum_of_agreement: moaFile ? moaFile.name : "No file selected",
            study_document: studyFile ? studyFile.name : "No file selected",
            panels: panels,
            title: studyTitle,
            year_published: formattedPublishedDate
        };

        if(dataFlag === "ADD"){
            try {
                // Save data to the 'under_grad' collection in Firestore
                const docRef = await addDoc(collection(fdb, selectedCategory), data);
                console.log("Document written with ID: ", docRef.id);
                Swal.fire({
                    title: "Book Added!",
                    text: "Book added successfully.",
                    icon: "success",
                }).then(() => {
                    const author_list_main_container = document.getElementById("author_list_main_container");
                    const panel_list_main_container = document.getElementById("panel_list_main_container");
                    form.reset();
                    author_list_main_container.innerHTML = '';
                    panel_list_main_container.innerHTML = '';
                    main_content_container.style.display = "flex";
                    edit_form_content_container.style.display = "none";
                    initializeAuthorForm();
                    initializePanelForm();
                    
                    switch(selectedCategory) {
                        case "under_graduate": populateStudyContainer("under_graduate_tab"); break;
                        case "graduate": populateStudyContainer("graduate_tab"); break;
                        case "masteral": populateStudyContainer("masteral_tab"); break;
                        case "dissertation": populateStudyContainer("dissertation_tab"); break;
                        case "doctorate": populateStudyContainer("doctorate_tab"); break;
                        default: break;
                    }
                });
    
            } catch (error) {
                console.error("Error adding document: ", error);
                Swal.fire({
                    title: "Error!",
                    text: "Error: " + error,
                    icon: "error",
                });
            }
        }
        
        // Remove the event listener after the first submission
        form.removeEventListener("submit", handleSubmit);
    }

    // Attach the submit event listener to the form
    form.addEventListener("submit", handleSubmit);
}

function handleEditBookForm(data, documentId){
    // display the initial value of the book clicked
    document.getElementById("studyTitle").value = data.title;
    document.getElementById("day_input_value").value = data.year_published.day;
    document.getElementById("month_input_value").value = data.year_published.month;
    document.getElementById("year_input_value").value = data.year_published.year;
    document.getElementById("selected_category").value = data.category;
    document.getElementById("selected_course").value = data.course;
    document.getElementById("field_of_the_study").value = data.field_of_study ? data.field_of_study.join(", ") : "No Fields";
    document.getElementById("uploaded_study_file").textContent = data.study_document ? `Uploaded file: ${data.study_document}` : "No file uploaded";
    document.getElementById("uploaded_moa_file").textContent = data.memorandum_of_agreement ? `Uploaded file: ${data.memorandum_of_agreement}` : "No file uploaded";

    const previousCategory = data.category;
    const previousStudyFile = data.study_document;
    const previousMOA = data.memorandum_of_agreement;

    const studyFileInput = document.getElementById("study_file");
    if (data.study_document) {
        // Remove the 'required' attribute if a file exists
        studyFileInput.removeAttribute("required");
    } else {
        // Ensure the 'required' attribute is set if no file is present
        studyFileInput.setAttribute("required", "required");
    }

    // populate authors
    const author_list_main_container = document.getElementById("author_list_main_container");
    let authorCount = document.querySelectorAll(".author-list-container").length;
    author_list_main_container.innerHTML = '';

    // Function to add an author input container
    function addAuthorContainer(count, author) {
        // Create a new div element for the new author container
        const newAuthorDiv = document.createElement("div");
        newAuthorDiv.classList.add("author-list-container");
        newAuthorDiv.id = `author${count}`;
        
        // Set the inner HTML for the new author div
        newAuthorDiv.innerHTML = `
            <div class="author-name-container">
                <label for="authorFirstName${count}">First Name</label>
                <input type="text" id="authorFirstName${count}" name="authorFirstName${count}" placeholder="First Name" required value="${author.firstName}">
            </div>
            <div class="author-name-container">
                <label for="authorMiddleName${count}">Middle Name</label>
                <input type="text" id="authorMiddleName${count}" name="authorMiddleName${count}" placeholder="Middle Name" value="${author.middleName}">
            </div>
            <div class="author-name-container">
                <label for="authorLastName${count}">Last Name</label>
                <input type="text" id="authorLastName${count}" name="authorLastName${count}" placeholder="Last Name" required value="${author.lastName}">
            </div>
        `;

        if(count > 0){
            newAuthorDiv.innerHTML += `<img src="../../static/images/x.png" alt="x" class="remove-author-form" onclick="removeAuthorDiv('author${count}')">`
        }

        // Append the new div to the author list container
        author_list_main_container.appendChild(newAuthorDiv);
    }
    data.authors.forEach((author, index) => {
        authorCount = document.querySelectorAll(".author-list-container").length;
        addAuthorContainer(authorCount, author);
    });

    // populate panels
    const panel_list_main_container = document.getElementById("panel_list_main_container");
    let panelCount = document.querySelectorAll(".panel-list-container").length;
    panel_list_main_container.innerHTML = '';

    function addPanelContainer(count, panel) {
        const newPanelDiv = document.createElement("div");
        newPanelDiv.classList.add("panel-list-container");
        newPanelDiv.id = `panel${count}`;
        
        // Set the inner HTML for the new author div
        newPanelDiv.innerHTML = `
            <div class="panel-name-container">
                <label for="panelFirstName${count}">First Name</label>
                <input type="text" id="panelFirstName${count}" name="panelFirstName${count}" placeholder="First Name" required value="${panel.lastName}">
            </div>
            <div class="panel-name-container">
                <label for="panelMiddleName${count}">Middle Name</label>
                <input type="text" id="panelMiddleName${count}" name="panelMiddleName${count}" placeholder="Middle Name" value="${panel.lastName}">
            </div>
            <div class="panel-name-container">
                <label for="panelLastName${count}">Last Name</label>
                <input type="text" id="panelLastName${count}" name="panelLastName${count}" placeholder="Last Name" required value="${panel.lastName}">
            </div>
        `;

        if(count > 0){
            newPanelDiv.innerHTML += `<img src="../../static/images/x.png" alt="x" id="remove_panel${count}" class="remove-panel-form" onclick="removeAuthorDiv('panel${count}')">`
        }

        panel_list_main_container.appendChild(newPanelDiv);
    }
    data.panels.forEach((panel, index) => {
        panelCount = document.querySelectorAll(".panel-list-container").length;
        addPanelContainer(panelCount, panel);
    });

   // Attach a one-time event listener to handle form submission
   const form = document.getElementById("add_edit_book_form");

    async function handleSubmit(event) {
        event.preventDefault();
       
        // Retrieve updated values from the form
        const updatedData = {
            title: document.getElementById("studyTitle").value,
            year_published: {
                day: document.getElementById("day_input_value").value,
                month: document.getElementById("month_input_value").value,
                year: document.getElementById("year_input_value").value
            },
            category: document.getElementById("selected_category").value,
            course: document.getElementById("selected_course").value,
            field_of_study: document.getElementById("field_of_the_study").value.split(", "),
            study_document: document.getElementById("study_file").value ? document.getElementById("study_file").value : previousStudyFile,
            memorandum_of_agreement: document.getElementById("moa_file").value ? document.getElementById("moa_file").value : previousMOA,
            authors: Array.from(author_list_main_container.querySelectorAll(".author-list-container")).map((container, index) => ({
                firstName: container.querySelector(`#authorFirstName${index}`).value,
                middleName: container.querySelector(`#authorMiddleName${index}`).value,
                lastName: container.querySelector(`#authorLastName${index}`).value
            })),
            panels: Array.from(panel_list_main_container.querySelectorAll(".panel-list-container")).map((container, index) => ({
                firstName: container.querySelector(`#panelFirstName${index}`).value,
                middleName: container.querySelector(`#panelMiddleName${index}`).value,
                lastName: container.querySelector(`#panelLastName${index}`).value
            }))
        };

        if(dataFlag === "EDIT"){
            try {
                console.log("previousCategory: ", previousCategory);
                console.log("updatedData.category: ", updatedData.category);
                if(previousCategory === updatedData.category){
                    // If the category hasn’t changed, simply update the document
                    await updateDoc(doc(fdb, updatedData.category, documentId), updatedData);
                    Swal.fire("Success", "Document updated successfully!", "success");
                } else {
                    // If the category has changed, save the document in the new category and delete the old one
                    // Step 1: Add the updated document to the new category
                    await addDoc(collection(fdb, updatedData.category), updatedData);
                    Swal.fire("Success", "Document updated and moved to new category!", "success");
    
                    // Step 2: Delete the document from the previous category
                    await deleteDoc(doc(fdb, previousCategory, documentId));
                    console.log("Document deleted from previous category: ", previousCategory);
                }
    
                form.reset();
                author_list_main_container.innerHTML = '';
                panel_list_main_container.innerHTML = '';
                initializeAuthorForm();
                initializePanelForm();
                main_content_container.style.display = "flex";
                edit_form_content_container.style.display = "none";
                
                switch(data.category) {
                    case "under_graduate": populateStudyContainer("under_graduate_tab"); break;
                    case "graduate": populateStudyContainer("graduate_tab"); break;
                    case "masteral": populateStudyContainer("masteral_tab"); break;
                    case "dissertation": populateStudyContainer("dissertation_tab"); break;
                    case "doctorate": populateStudyContainer("doctorate_tab"); break;
                    default: break;
                }
    
            } catch (error) {
                console.error("Error updating document: ", error);
                Swal.fire("Error", `Failed to update document: ${error}`, "error");
            }
        }

        // Remove the event listener after the first submission
        form.removeEventListener("submit", handleSubmit);
    }

    form.addEventListener("submit", handleSubmit);
}