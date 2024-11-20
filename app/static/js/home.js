import {
    auth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    fdb,
    getDoc,
    doc,
} from "./firebase_config.js";

document.addEventListener("DOMContentLoaded", function() {
    checkUserLoginStatus()
});

`
    check what role of the current user base on the 
    uid in 'users' collection inder 'role' field.
    then it displays the corresponding header base on the role
    of the current user.
`
function checkUserLoginStatus(){
    onAuthStateChanged(auth, async (user) => {
        if(user){
            const uid = user.uid;
            
            try {
                // Reference to the user's document in Firestore
                const userDocRef = doc(fdb, "users", uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const role = userDoc.data().role;

                    `TODO: check which page is the user currently in.
                        if the user is student, they cannot access the /cos_library_admin
                        same as if user is admin, then they cannot access the /cos_library_student
                    `

                    switch(role){
                        case "STUDENT":
                            initializeHeader(1);
                            break;
                        case "PROFESSOR":
                            initializeHeader(2);
                            break;
                        case "ADMIN":
                            initializeHeader(3);
                            break;
                        default:
                            initializeHeader(0);
                            break;
                    }
                } else {
                    console.log("No user data found: role");
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                initializeHeader(0); 
            }
        } else {
            initializeHeader(0)
        }
    });
}

function initializeHeader(userRole) {
    const homeUrl = navbar.getAttribute("data-home-url");
    const howToUseUrl = navbar.getAttribute("data-how-to-use-url");
    const aboutUsUrl = navbar.getAttribute("data-about-us-url");
    const donateUrl = navbar.getAttribute("data-donate-url");
    const adminUrl = navbar.getAttribute("data-admin-url");
    const studentUrl = navbar.getAttribute("data-student-url");
    
    // Build navbar HTML
    let navbarHTML = `
        <a href="${homeUrl}">HOME</a>
        <a href="${howToUseUrl}">HOW TO USE</a>
        <a href="${aboutUsUrl}">ABOUT US</a>
    `;

    let flag;

    switch(userRole){
        case 1:
            flag = 1;
            navbarHTML += `
                <a href="${studentUrl}">COS LIBRARY</a>
                <a href="${donateUrl}">DONATE</a>
                <a href="#" id="logoutButton">LOGOUT</a>
            `;
            break;
        case 2:
            flag = 1;
            navbarHTML += `
                <a href="${studentUrl}">COS LIBRARY</a>
                <a href="${donateUrl}">DONATE</a>
                <a href="#" id="logoutButton">LOGOUT</a>
            `;
            break;
        case 3:
            flag = 1;
            navbarHTML += `
                <a href="${adminUrl}">COS LIBRARY</a>
                <a href="${donateUrl}">DONATE</a>
                <a href="#" id="logoutButton">LOGOUT</a>
            `;
            break;
        default:
            flag = 0;
            navbarHTML += `
                <a href="${donateUrl}">DONATE</a>
                <a href="#" id="loginButton">LOGIN</a>
            `;
            break;
    }

    navbar.innerHTML = navbarHTML;
    setOnClickListenerLoginButton(flag);
}

function setOnClickListenerLoginButton(mode){
    const login_modal_container = document.getElementById("login_modal_container");
    const close_button_form = document.getElementById("close_button_form");
    const login_button_form = document.getElementById("login_button_form");
     
    if(mode === 0){
        const loginButton = document.getElementById("loginButton");
        loginButton.addEventListener("click", () => {
            login_modal_container.style.display = "flex";
        });
    } else {
        const logoutButton = document.getElementById("logoutButton");
        logoutButton.addEventListener("click", () => {
            logoutUser();
        });
    }

    close_button_form.addEventListener("click", () =>{
        login_modal_container.style.display = "none";
    });

    login_button_form.addEventListener("click", () =>{
        authenticateUser();
    });
}

async function authenticateUser(){
    const email_input_value = document.getElementById("email_input_value").value;
    const password_input_value = document.getElementById("password_input_value").value;

    signInWithEmailAndPassword(auth, email_input_value, password_input_value)
        .then(async (userCredential) => {
            const user = userCredential.user;
            try {
                // Reference to the user's document in Firestore
                const userDocRef = doc(fdb, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Logged in as ' + user.email,
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        const role = userDoc.data().role;

                        switch(role){
                            case "STUDENT":
                                initializeHeader(1);
                                break;
                            case "PROFESSOR":
                                initializeHeader(2);
                                break;
                            case "ADMIN":
                                initializeHeader(3);
                                break;
                            default:
                                initializeHeader(0);
                                break;
                        }
                        document.getElementById("login_modal_container").style.display = "none";
                    });
                } else {
                    console.log("No user data found: role");
                    Swal.fire({
                        title: 'Error!',
                        text: "No user data found: role",
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                initializeHeader(0); 
                Swal.fire({
                    title: 'Error!',
                    text: "Error fetching user role:"+ error,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            Swal.fire({
                title: 'Error!',
                text: errorCode + " : " + errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
}

function logoutUser(){
    auth.signOut()
    .then(() => {
        console.log('User logged out successfully');
        window.location.href = '/'; 
    })
    .catch((error) => {
        console.error('Error logging out:', error);
    });
}