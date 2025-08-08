// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKB24afmgkgXIf9lrgAF6-f4HAHfGbfzo",
  authDomain: "seisaku-kanri.firebaseapp.com",
  projectId: "seisaku-kanri",
  storageBucket: "seisaku-kanri.firebasestorage.app",
  messagingSenderId: "136562453433",
  appId: "1:136562453433:web:954f14d5124a569a122468"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
