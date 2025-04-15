import {
    fdb,
    getDocs,
    doc,
    collection,
} from "./firebase_config.js";

let currentSnapshot = null;
let currentSidebarMenuOption;

const departmentCourses = {
    "COMPUTER_STUDIES": [
        { value: "BS_COMPUTER_SCIENCE", text: "BS Computer Science" },
        { value: "BS_INFORMATION_TECHNOLOGY", text: "BS Information Technology" },
        { value: "BS_INFORMATION_SYSTEM", text: "BS Information System" }
    ],
    "ENGINEERING": [
        { value: "BS_ELECTRICAL_ENGINEERING", text: "BS Electrical Engineering" },
        { value: "BS_MECHANICAL_ENGINEERING", text: "BS Mechanical Engineering" },
        { value: "BS_CIVIL_ENGINEERING", text: "BS Civil Engineering" }
    ],
    "BUSINESS": [
        { value: "BS_BUSINESS_ADMINISTRATION", text: "BS Business Administration" },
        { value: "BS_ACCOUNTANCY", text: "BS Accountancy" },
        { value: "BS_MARKETING", text: "BS Marketing" }
    ]
};

document.addEventListener("DOMContentLoaded", function() {
    setOnclickOnCards();
    initializeDashboard();
    initializeListenToFilter();

    currentSidebarMenuOption = document.getElementById("dashboard_tab");
    currentSidebarMenuOption.classList.add("selected-side-bar-option");
    sideBarMenuHandle();
});

// this code is reposible to handle the click event values 
// inside the admin_cos_library
function setOnclickOnCards(){
    const main_content_container = document.getElementById("main_content_container");
    const left_card_details = document.querySelectorAll(".left-card-details");
    const view_book_details_container = document.getElementById("view_book_details_container");
    const back_button_view = document.getElementById("back_button_view");

    left_card_details.forEach(cards => {
        cards.addEventListener('click', () => {
            main_content_container.style.display = "none";
            view_book_details_container.style.display = "flex";
            const data = JSON.parse(cards.getAttribute("data-content").replace(/&quot;/g, '"'));
            handleClickedBookDetails(data);
        });
    });

    back_button_view.addEventListener('click', () => {
        main_content_container.style.display = "flex";
        view_book_details_container.style.display = "none";
    });
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
        return;
    }

    // Hide all containers
    const allContainers = [
        "dashboard_content_container", 
        "main_content_container", 
        "view_book_details_container"
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
        case "under_graduate_tab":
            populateUnderGradStudies();
            break;
        case "graduate_tab":
            populateGradStudies();
            break;
        case "masteral_tab":
            populateMasteralStudies();
            break;
        case "dissertation_tab":
            populateDissertationStudies();
            break;
        case "doctorate_tab":
            populateDoctorateStudies();
            break;
        default:
            break;
    }
    setOnclickOnCards();
}

async function populateUnderGradStudies() {
    const study_card_container = document.getElementById("study_card_container");
    const yearSelect = document.getElementById("year_published");
    const courseSelect = document.getElementById("course_option");
    const fieldSelect = document.getElementById("field_study_option");

    study_card_container.innerHTML = '';

    // Reference to the 'under_grad' collection in Firestore
    const underGradCollectionRef = collection(fdb, 'under_graduate');

    try {
        // Fetch all documents in the 'under_grad' collection
        const querySnapshot = await getDocs(underGradCollectionRef);
        const years = new Set();
        const courses = new Set();
        const fields = new Set();

        // Check if the snapshot is empty
        if (querySnapshot.size === 1) {
            // Display message if there are no documents
            study_card_container.innerHTML = '<h1>No Data</h1>';
            return;  // Exit the function since there are no documents to display
        }
        
        // Iterate over each document in the collection
        currentSnapshot = querySnapshot;
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
                            <p class="card-department">Department: ${data.department || "No Department"}</p>
                            <p class="card-course">Course: ${course}</p>
                        </div>
                        <div class="right-card-details" data-content="${jsonData}">
                            <p class="card-category">${category}</p>
                            <p class="card-field-study">Fields: ${fieldStudy}</p>
                        </div>
                    </div>
                `;

                if (data.year_published && data.year_published.year) {
                    years.add(data.year_published.year);
                }
                if (data.course) {
                    courses.add(data.course);
                }
                if (data.field_of_study) {
                    data.field_of_study.forEach(field => fields.add(field));
                }
            }
        });

        // Populate the dropdowns
        populateDropdown(yearSelect, Array.from(years));
        populateDropdown(courseSelect, Array.from(courses));
        populateDropdown(fieldSelect, Array.from(fields));
    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
    setOnclickOnCards();
}

async function populateGradStudies(){
    const study_card_container = document.getElementById("study_card_container");
    const yearSelect = document.getElementById("year_published");
    const courseSelect = document.getElementById("course_option");
    const fieldSelect = document.getElementById("field_study_option");
    study_card_container.innerHTML = '';

    // Reference to the 'under_grad' collection in Firestore
    const underGradCollectionRef = collection(fdb, 'graduate');

    try {
        // Fetch all documents in the 'under_grad' collection
        const querySnapshot = await getDocs(underGradCollectionRef);
        const years = new Set();
        const courses = new Set();
        const fields = new Set();

        // Check if the snapshot is empty
        if (querySnapshot.size === 1) {
            // Display message if there are no documents
            study_card_container.innerHTML = '<h1>No Data</h1>';
            return;  // Exit the function since there are no documents to display
        }
        
        // Iterate over each document in the collection
        currentSnapshot = querySnapshot;
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
                            <p class="card-department">Department: ${data.department || "No Department"}</p>
                            <p class="card-course">Course: ${course}</p>
                        </div>
                        <div class="right-card-details" data-content="${jsonData}">
                            <p class="card-category">${category}</p>
                            <p class="card-field-study">Fields: ${fieldStudy}</p>
                        </div>
                    </div>
                `;

                if (data.year_published && data.year_published.year) {
                    years.add(data.year_published.year);
                }
                if (data.course) {
                    courses.add(data.course);
                }
                if (data.field_of_study) {
                    data.field_of_study.forEach(field => fields.add(field));
                }
            }
        });

        // Populate the dropdowns
        populateDropdown(yearSelect, Array.from(years));
        populateDropdown(courseSelect, Array.from(courses));
        populateDropdown(fieldSelect, Array.from(fields));
    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
    setOnclickOnCards();
}

async function populateMasteralStudies(){
    const study_card_container = document.getElementById("study_card_container");
    const yearSelect = document.getElementById("year_published");
    const courseSelect = document.getElementById("course_option");
    const fieldSelect = document.getElementById("field_study_option");
    study_card_container.innerHTML = '';

    const underGradCollectionRef = collection(fdb, 'masteral');

    try {
        const querySnapshot = await getDocs(underGradCollectionRef);
        const years = new Set();
        const courses = new Set();
        const fields = new Set();

        if (querySnapshot.size === 1) {
            study_card_container.innerHTML = '<h1>No Data</h1>';
            return; 
        }
        
        currentSnapshot = querySnapshot;
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
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

                const jsonData = JSON.stringify(data).replace(/"/g, '&quot;');

                study_card_container.innerHTML += `
                    <div class="study-card-details">
                        <div class="left-card-details" data-content="${jsonData}">
                            <p class="card-study-title">${studyTitle}</p>
                            <p class="card-publication-date">${publicationDate}</p>
                            <p class="card-authors">Authors: ${authors}</p>
                            <p class="card-department">Department: ${data.department || "No Department"}</p>
                            <p class="card-course">Course: ${course}</p>
                        </div>
                        <div class="right-card-details" data-content="${jsonData}">
                            <p class="card-category">${category}</p>
                            <p class="card-field-study">Fields: ${fieldStudy}</p>
                        </div>
                    </div>
                `;

                if (data.year_published && data.year_published.year) {
                    years.add(data.year_published.year);
                }
                if (data.course) {
                    courses.add(data.course);
                }
                if (data.field_of_study) {
                    data.field_of_study.forEach(field => fields.add(field));
                }
            }
        });

        populateDropdown(yearSelect, Array.from(years));
        populateDropdown(courseSelect, Array.from(courses));
        populateDropdown(fieldSelect, Array.from(fields));
    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
    setOnclickOnCards();
}

async function populateDissertationStudies(){
    const study_card_container = document.getElementById("study_card_container");
    const yearSelect = document.getElementById("year_published");
    const courseSelect = document.getElementById("course_option");
    const fieldSelect = document.getElementById("field_study_option");
    study_card_container.innerHTML = '';

    const underGradCollectionRef = collection(fdb, 'dissertation');

    try {
        const querySnapshot = await getDocs(underGradCollectionRef);
        const years = new Set();
        const courses = new Set();
        const fields = new Set();

        if (querySnapshot.size === 1) {
            study_card_container.innerHTML = '<h1>No Data</h1>';
            return; 
        }
        
        currentSnapshot = querySnapshot;
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
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

                const jsonData = JSON.stringify(data).replace(/"/g, '&quot;');

                study_card_container.innerHTML += `
                    <div class="study-card-details">
                        <div class="left-card-details" data-content="${jsonData}">
                            <p class="card-study-title">${studyTitle}</p>
                            <p class="card-publication-date">${publicationDate}</p>
                            <p class="card-authors">Authors: ${authors}</p>
                            <p class="card-department">Department: ${data.department || "No Department"}</p>
                            <p class="card-course">Course: ${course}</p>
                        </div>
                        <div class="right-card-details" data-content="${jsonData}">
                            <p class="card-category">${category}</p>
                            <p class="card-field-study">Fields: ${fieldStudy}</p>
                        </div>
                    </div>
                `;

                if (data.year_published && data.year_published.year) {
                    years.add(data.year_published.year);
                }
                if (data.course) {
                    courses.add(data.course);
                }
                if (data.field_of_study) {
                    data.field_of_study.forEach(field => fields.add(field));
                }
            }
        });

        populateDropdown(yearSelect, Array.from(years));
        populateDropdown(courseSelect, Array.from(courses));
        populateDropdown(fieldSelect, Array.from(fields));
    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
    setOnclickOnCards();
}

async function populateDoctorateStudies(){
    const study_card_container = document.getElementById("study_card_container");
    const yearSelect = document.getElementById("year_published");
    const courseSelect = document.getElementById("course_option");
    const fieldSelect = document.getElementById("field_study_option");
    study_card_container.innerHTML = '';

    const underGradCollectionRef = collection(fdb, 'doctorate');

    try {
        const querySnapshot = await getDocs(underGradCollectionRef);
        const years = new Set();
        const courses = new Set();
        const fields = new Set();

        if (querySnapshot.size === 1) {
            study_card_container.innerHTML = '<h1>No Data</h1>';
            return; 
        }
        
        currentSnapshot = querySnapshot;
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
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

                const jsonData = JSON.stringify(data).replace(/"/g, '&quot;');

                study_card_container.innerHTML += `
                    <div class="study-card-details">
                        <div class="left-card-details" data-content="${jsonData}">
                            <p class="card-study-title">${studyTitle}</p>
                            <p class="card-publication-date">${publicationDate}</p>
                            <p class="card-authors">Authors: ${authors}</p>
                            <p class="card-department">Department: ${data.department || "No Department"}</p>
                            <p class="card-course">Course: ${course}</p>
                        </div>
                        <div class="right-card-details" data-content="${jsonData}">
                            <p class="card-category">${category}</p>
                            <p class="card-field-study">Fields: ${fieldStudy}</p>
                        </div>
                    </div>
                `;

                if (data.year_published && data.year_published.year) {
                    years.add(data.year_published.year);
                }
                if (data.course) {
                    courses.add(data.course);
                }
                if (data.field_of_study) {
                    data.field_of_study.forEach(field => fields.add(field));
                }
            }
        });

        populateDropdown(yearSelect, Array.from(years));
        populateDropdown(courseSelect, Array.from(courses));
        populateDropdown(fieldSelect, Array.from(fields));
    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
    setOnclickOnCards();
}

function populateDropdown(selectElement, options) {
    selectElement.innerHTML = ''; 

    const clearOption = document.createElement("option");
    clearOption.value = ""; 
    clearOption.textContent = "---";  
    selectElement.appendChild(clearOption);

    options.sort().forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

function initializeListenToFilter(){
    const study_card_container = document.getElementById("study_card_container");
    const yearFilter = document.getElementById("year_published");
    const courseFilter = document.getElementById("course_option");
    const fieldFilter = document.getElementById("field_study_option");
    const departmentFilter = document.getElementById("department_option");
    const nameFilter = document.getElementById("search_study");

    yearFilter.addEventListener("change", () => {
        const dataSearchFilterValue = document.getElementById("year_published").value;
        study_card_container.innerHTML = '';

        currentSnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
                const dataName = data.year_published.year.toLowerCase();
                const searchTermLower = dataSearchFilterValue.toLowerCase(); 
    
                // Check for partial match
                if (dataName.includes(searchTermLower)) {
                    populateFilteredStudies(data);
                }
            }
        });
        setOnclickOnCards();
    });

    courseFilter.addEventListener("change", () => {
        const dataSearchFilterValue = document.getElementById("course_option").value;
        study_card_container.innerHTML = '';

        currentSnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
                const dataName = data.course.toLowerCase();
                const searchTermLower = dataSearchFilterValue.toLowerCase(); 
    
                // Check for partial match
                if (dataName.includes(searchTermLower)) {
                    populateFilteredStudies(data);
                }
            }
        });
        setOnclickOnCards();
    });

    fieldFilter.addEventListener("change", () => {
        const dataSearchFilterValue = document.getElementById("field_study_option").value.toLowerCase();
        study_card_container.innerHTML = '';

        currentSnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
                const fieldOfStudy = data.field_of_study || [];
                const matchesField = fieldOfStudy.some(field => field.toLowerCase().includes(dataSearchFilterValue));

                if (matchesField) {
                    populateFilteredStudies(data); 
                }
            }
        });
        setOnclickOnCards();
    });

    departmentFilter.addEventListener("change", () => {
        const dataSearchFilterValue = document.getElementById("department_option").value;
        study_card_container.innerHTML = '';

        // Update course options based on selected department
        const courseSelect = document.getElementById("course_option");
        courseSelect.innerHTML = '---';
        
        if (dataSearchFilterValue && departmentCourses[dataSearchFilterValue]) {
            departmentCourses[dataSearchFilterValue].forEach(course => {
                const option = document.createElement('option');
                option.value = course.value;
                option.textContent = course.text;
                courseSelect.appendChild(option);
            });
        }

        currentSnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
                const dataName = data.department.toLowerCase();
                const searchTermLower = dataSearchFilterValue.toLowerCase(); 
    
                // Check for partial match
                if (dataName.includes(searchTermLower)) {
                    populateFilteredStudies(data);
                }
            }
        });
        setOnclickOnCards();
    });

    nameFilter.addEventListener("change", () => {
        const dataSearchFilterValue = document.getElementById("search_study").value;
        study_card_container.innerHTML = '';

        currentSnapshot.forEach((doc) => {
            const data = doc.data();

            if(doc.id != "test"){
                const dataName = data.title.toLowerCase();
                const searchTermLower = dataSearchFilterValue.toLowerCase(); 
    
                // Check for partial match
                if (dataName.includes(searchTermLower)) {
                    populateFilteredStudies(data, doc.id);
                }
            }
        });
        setOnclickOnCards();
    });
}

function populateFilteredStudies(data, docId){
    const studyTitle = data.title || "No Title";
    const publicationDate = `${data.year_published.day} ${data.year_published.month} ${data.year_published.year}`;
    const authors = data.authors ? data.authors.map(author => `${author.firstName} ${author.lastName}`).join(", ") : "No Authors";
    const course = data.course || "No Course";
    let category = data.category || "No Category";
    const fieldStudy = data.field_of_study ? data.field_of_study.join(", ") : "No Fields";
    const department = data.department || "No Department";

    const jsonData = JSON.stringify(data);

    study_card_container.innerHTML += `
        <div class="study-card-details">
            <div class="left-card-details" data-content="${jsonData}">
                <p class="card-study-title">${studyTitle}</p>
                <p class="card-publication-date">${publicationDate}</p>
                <p class="card-authors">Authors: ${authors}</p>
                <p class="card-department">Department: ${department}</p>
                <p class="card-course">Course: ${course}</p>
            </div>
            <div class="right-card-details" data-content="${jsonData}">
                <p class="card-category">${category}</p>
                <p class="card-field-study">Fields: ${fieldStudy}</p>
            </div>
        </div>
    `;
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
                <embed src="../static/acre_data/raw/${data.study_document}" type="application/pdf">
            </div>
            <div class="details-summarized-container">
                <p class="details-summarized-title">Summarized Result</p>
                <embed src="../static/acre_data/summarized/summary_${data.study_document}" type="application/pdf">
            </div>
        </div>
    `;

    if(data.memorandum_of_agreement != "No file selected"){
        margin_container.innerHTML += `
        <div id="MOA_container">
            <img src="../static/images/redirect_icon1.png" alt="">
            <a href='../static/acre_data/moa/${data.memorandum_of_agreement}' target="_blank">
                <p class="MOA-title">Memorandum of Agreement</p>
            </a>
        </div>
        `;
    }
}

async function initializeDashboard(){
    try {
        // Fetch all the collections concurrently
        const [dissertationSnap, doctorateSnap, graduateSnap, masteralSnap, underGraduateSnap] = await Promise.all([
            getDocs(collection(fdb, 'dissertation')),
            getDocs(collection(fdb, 'doctorate')),
            getDocs(collection(fdb, 'graduate')),
            getDocs(collection(fdb, 'masteral')),
            getDocs(collection(fdb, 'under_graduate')),
        ]);
    
        // Process each collection separately
        const dissertations = dissertationSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const doctorates = doctorateSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const graduates = graduateSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const masterals = masteralSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const undergraduates = underGraduateSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
        const allItems = [
            ...dissertationSnap.docs
                .filter(doc => doc.id !== 'test') 
                .map(doc => ({ id: doc.id, ...doc.data() })),
            ...doctorateSnap.docs
                .filter(doc => doc.id !== 'test')
                .map(doc => ({ id: doc.id, ...doc.data() })),
            ...graduateSnap.docs
                .filter(doc => doc.id !== 'test') 
                .map(doc => ({ id: doc.id, ...doc.data() })),
            ...masteralSnap.docs
                .filter(doc => doc.id !== 'test')
                .map(doc => ({ id: doc.id, ...doc.data() })),
            ...underGraduateSnap.docs
                .filter(doc => doc.id !== 'test') 
                .map(doc => ({ id: doc.id, ...doc.data() })),
        ];

        // Call initialization functions
        // InitializeCSPublishedBooksPerYear();
        // InitializeITPublishedBooksPerYear();
        // InitializeISPublishedBooksPerYear();
        // InitializeTotalPublishedBooksPerYear();
        // InitializeCSPublishedBooksPerCategory();
        // InitializeITPublishedBooksPerCategory();
        // InitializeISPublishedBooksPerCategory();

        InitializeCategoryTotalItems(dissertationSnap, doctorateSnap, graduateSnap, masteralSnap, underGraduateSnap);
        InitializeCSPublishedBooksPerYearDB(allItems);
        InitializeITPublishedBooksPerYearDB(allItems);
        InitializeISPublishedBooksPerYearDB(allItems);
        InitializeTotalPublishedBooksPerYearDB(allItems);
        InitializeCSPublishedBooksPerCategoryDB(allItems);
        InitializeITPublishedBooksPerCategoryDB(allItems);
        InitializeISPublishedBooksPerCategoryDB(allItems);
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
}

function InitializeCategoryTotalItems(dissertationSnap, doctorateSnap, graduateSnap, masteralSnap, underGraduateSnap){
    const undergraduate_total_value = document.getElementById("undergraduate_total_value");
    const graduate_total_value = document.getElementById("graduate_total_value");
    const masteral_total_value = document.getElementById("masteral_total_value");
    const dissertation_total_value = document.getElementById("dissertation_total_value");
    const doctorate_total_value = document.getElementById("doctorate_total_value");

    const filteredUnderGraduate = underGraduateSnap.docs.filter(doc => doc.id !== 'test');
    const filteredGraduate = graduateSnap.docs.filter(doc => doc.id !== 'test');
    const filteredMasteral = masteralSnap.docs.filter(doc => doc.id !== 'test');
    const filteredDissertations = dissertationSnap.docs.filter(doc => doc.id !== 'test');
    const filteredDoctorate = doctorateSnap.docs.filter(doc => doc.id !== 'test');
    
    undergraduate_total_value.innerHTML = filteredUnderGraduate.length;
    graduate_total_value.innerHTML = filteredGraduate.length;
    masteral_total_value.innerHTML = filteredMasteral.length;
    dissertation_total_value.innerHTML = filteredDissertations.length;
    doctorate_total_value.innerHTML = filteredDoctorate.length;
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
                name: 'CS',
                data: [15, 10, 13, 29, 22, 34, 46, 57, 69, 72, 88] 
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

function InitializeCSPublishedBooksPerYearDB(allItems) {
    // Extract data from allItems
    const dataByYear = {};

    allItems.forEach(item => {
        // Access the 'year' field inside the 'year_published' object
        const year = item.year_published?.year; // Use optional chaining to avoid errors if 'year_published' is missing
        const category = item.course; // Assuming 'course' is still a direct property

        if (!year) return; // Skip if the year is not defined

        if (!dataByYear[year]) {
            dataByYear[year] = { CS: 0 };
        }

        if (category === 'BS_COMPUTER_SCIENCE') {
            dataByYear[year].CS += 1;
        }
    });

    // Convert dataByYear to the required series format
    const years = Object.keys(dataByYear).sort(); // Sort years for chronological order
    const CSData = years.map(year => dataByYear[year].CS);

    // Chart options
    const options = {
        chart: {
            type: 'line',
            height: 300,
            toolbar: {
                show: true,
            },
        },
        series: [
            {
                name: 'CS',
                data: CSData,
            },
        ],
        xaxis: {
            categories: years, // Dynamic categories based on years
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '14px',
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '14px',
                },
            },
        },
        colors: ['#fbff00', '#ffffff', '#A904FE'],
        grid: {
            borderColor: 'rgba(200, 200, 200, 0.3)',
            strokeDashArray: 4,
        },
        tooltip: {
            theme: 'dark',
        },
        stroke: {
            curve: 'smooth',
        },
        legend: {
            labels: {
                colors: '#FFFFFF',
            },
            markers: {
                fillColors: ['#FFFF00', '#1E90FF', '#A904FE'],
            },
        },
        dataLabels: {
            enabled: false,
        },
    };

    // Create and render the chart
    const chart = new ApexCharts(document.querySelector("#cs_published_books_chart_container"), options);
    chart.render();
}

function InitializeITPublishedBooksPerYearDB(allItems) {
    const dataByYear = {};

    allItems.forEach(item => {
        const year = item.year_published?.year; 
        const category = item.course; 

        if (!year) return; 

        if (!dataByYear[year]) {
            dataByYear[year] = { IT: 0 };
        }

        if (category === 'BS_INFORMATION_TECHNOLOGY') {
            dataByYear[year].IT += 1;
        }
    });

    const years = Object.keys(dataByYear).sort(); 
    const ITData = years.map(year => dataByYear[year].IT);

    const options = {
        chart: {
            type: 'line',
            height: 300,
            toolbar: {
                show: true,
            },
        },
        series: [
            {
                name: 'CS',
                data: ITData,
            },
        ],
        xaxis: {
            categories: years, 
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '14px',
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '14px',
                },
            },
        },
        colors: ['#fbff00', '#ffffff', '#A904FE'],
        grid: {
            borderColor: 'rgba(200, 200, 200, 0.3)',
            strokeDashArray: 4,
        },
        tooltip: {
            theme: 'dark',
        },
        stroke: {
            curve: 'smooth',
        },
        legend: {
            labels: {
                colors: '#FFFFFF',
            },
            markers: {
                fillColors: ['#FFFF00', '#1E90FF', '#A904FE'],
            },
        },
        dataLabels: {
            enabled: false,
        },
    };

    const chart = new ApexCharts(document.querySelector("#it_published_books_chart_container"), options);
    chart.render();
}

function InitializeISPublishedBooksPerYearDB(allItems) {
    const dataByYear = {};

    allItems.forEach(item => {
        const year = item.year_published?.year; 
        const category = item.course; 

        if (!year) return; 

        if (!dataByYear[year]) {
            dataByYear[year] = { IS: 0 };
        }

        if (category === 'BS_INFORMATION_SYSTEM') {
            dataByYear[year].IS += 1;
        }
    });

    const years = Object.keys(dataByYear).sort(); 
    const ISData = years.map(year => dataByYear[year].IS);

    const options = {
        chart: {
            type: 'line',
            height: 300,
            toolbar: {
                show: true,
            },
        },
        series: [
            {
                name: 'IS',
                data: ISData,
            },
        ],
        xaxis: {
            categories: years, 
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '14px',
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#ffffff',
                    fontSize: '14px',
                },
            },
        },
        colors: ['#fbff00', '#ffffff', '#A904FE'],
        grid: {
            borderColor: 'rgba(200, 200, 200, 0.3)',
            strokeDashArray: 4,
        },
        tooltip: {
            theme: 'dark',
        },
        stroke: {
            curve: 'smooth',
        },
        legend: {
            labels: {
                colors: '#FFFFFF',
            },
            markers: {
                fillColors: ['#FFFF00', '#1E90FF', '#A904FE'],
            },
        },
        dataLabels: {
            enabled: false,
        },
    };

    const chart = new ApexCharts(document.querySelector("#is_published_books_chart_container"), options);
    chart.render();
}

function InitializeTotalPublishedBooksPerYearDB(allItems){
    const dataByYear = {};

    allItems.forEach(item => {
        const year = item.year_published?.year; 
        const category = item.course; 

        if (!year) return; 

        if (!dataByYear[year]) {
            dataByYear[year] = { IT: 0, CS: 0, IS: 0 };
        }

        if (category === 'BS_INFORMATION_TECHNOLOGY') {
            dataByYear[year].IT += 1;
        } else if (category === 'BS_COMPUTER_SCIENCE') {
            dataByYear[year].CS += 1;
        } else if (category === 'BS_INFORMATION_SYSTEM') {
            dataByYear[year].IS += 1;
        }
    });

    const years = Object.keys(dataByYear).sort(); 
    const ITData = years.map(year => dataByYear[year].IT);
    const CSData = years.map(year => dataByYear[year].CS);
    const ISData = years.map(year => dataByYear[year].IS);

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
                data: ITData, 
            },
            {
                name: 'CS',
                data: CSData
            },
            {
                name: 'IS',
                data: ISData
            },
        ],
        xaxis: {
            categories: years,
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

function InitializeCSPublishedBooksPerCategoryDB(allItems){
    const csItems = allItems.filter(item => item.course === 'BS_COMPUTER_SCIENCE');

    const categoryCounts = {
        'under_graduate': 0,
        'graduate': 0,
        'dissertation': 0,
        'masteral': 0,
        'doctorate': 0,
    };

    csItems.forEach(item => {
        const category = item.category;
        if (categoryCounts[category] !== undefined) {
            categoryCounts[category] += 1;
        }
    });

    const series = Object.values(categoryCounts);

    const options = {
        chart: {
            type: 'pie',
            height: 500, 
            toolbar: {
                show: true
            }
        },
        series,
        labels: Object.keys(categoryCounts),
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

function InitializeITPublishedBooksPerCategoryDB(allItems){
    const csItems = allItems.filter(item => item.course === 'BS_INFORMATION_TECHNOLOGY');

    const categoryCounts = {
        'under_graduate': 0,
        'graduate': 0,
        'dissertation': 0,
        'masteral': 0,
        'doctorate': 0,
    };

    csItems.forEach(item => {
        const category = item.category;
        if (categoryCounts[category] !== undefined) {
            categoryCounts[category] += 1;
        }
    });

    const series = Object.values(categoryCounts);

    const options = {
        chart: {
            type: 'pie',
            height: 500, 
            toolbar: {
                show: true
            }
        },
        series,
        labels: Object.keys(categoryCounts),
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

function InitializeISPublishedBooksPerCategoryDB(allItems){
    const csItems = allItems.filter(item => item.course === 'BS_INFORMATION_SYSTEM');

    const categoryCounts = {
        'under_graduate': 0,
        'graduate': 0,
        'dissertation': 0,
        'masteral': 0,
        'doctorate': 0,
    };

    csItems.forEach(item => {
        const category = item.category;
        if (categoryCounts[category] !== undefined) {
            categoryCounts[category] += 1;
        }
    });

    const series = Object.values(categoryCounts);

    const options = {
        chart: {
            type: 'pie',
            height: 500, 
            toolbar: {
                show: true
            }
        },
        series,
        labels: Object.keys(categoryCounts),
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