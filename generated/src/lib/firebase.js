// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDO_Bf-BOfGG_pNqlw9q6pxEERjeTsgSOY",
  authDomain: "nexmart-bd770.firebaseapp.com",
  projectId: "nexmart-bd770",
  storageBucket: "nexmart-bd770.firebasestorage.app",
  messagingSenderId: "976100183979",
  appId: "1:976100183979:web:3bece7324473480d63ccee",
  measurementId: "G-KCR7JS740H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);