let currentSidebarMenuOption;

document.addEventListener("DOMContentLoaded", function() {
    setOnclickOnCards();
    initializeDashboard();

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
        });
    });

    back_button_view.addEventListener('click', () => {
        main_content_container.style.display = "flex";
        view_book_details_container.style.display = "none";
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

function populateUnderGradStudies(){
    const study_card_container = document.getElementById("study_card_container");
    study_card_container.innerHTML = '';
    for(let i = 0; i < 5; i++){
        study_card_container.innerHTML += `
        <div class="study-card-details">
            <div class="left-card-details">
                <p class="card-study-title">STUDY TITLE: UNDER GRADS ${i}</p>
                <p class="card-publication-date">Publication date</p>
                <p class="card-authors">Authors</p>
                <p class="card-course">Course</p>
            </div>
            <div class="right-card-details">
                <p class="card-category">Category</p>
                <p class="card-field-study">Field of the Study</p>
            </div>
        </div>
        `;
    }
}

function populateGradStudies(){
    const study_card_container = document.getElementById("study_card_container");
    study_card_container.innerHTML = '';
    for(let i = 0; i < 5; i++){
        study_card_container.innerHTML += `
        <div class="study-card-details">
            <div class="left-card-details">
                <p class="card-study-title">STUDY TITLE: GRADS ${i}</p>
                <p class="card-publication-date">Publication date</p>
                <p class="card-authors">Authors</p>
                <p class="card-course">Course</p>
            </div>
            <div class="right-card-details">
                <p class="card-category">Category</p>
                <p class="card-field-study">Field of the Study</p>
            </div>
        </div>
        `;
    }
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
        </div>
        `;
    }
}