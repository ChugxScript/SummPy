// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

import { 
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { 
    getFirestore,
    collection,
    addDoc,
    getDoc,
    getDocs,
    deleteDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAfjMMKL7sCAl-Hmb5CEqGGa6Vn5S3XWEA",
    authDomain: "summpy-65d2e.firebaseapp.com",
    projectId: "summpy-65d2e",
    storageBucket: "summpy-65d2e.firebasestorage.app",
    messagingSenderId: "866327933846",
    appId: "1:866327933846:web:7832759d1dffd313c0a3b7",
    measurementId: "G-VR1402369H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const fdb = getFirestore(app);

// exporting the methods that we got from the firestore
// to use in our multiple files
export {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    collection,
    addDoc,
    getDoc,
    getDocs,
    deleteDoc,
    doc,
}