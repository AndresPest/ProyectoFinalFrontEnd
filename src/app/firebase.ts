// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCzthFnNo4ERDhSuRgn2K9cdynwIe1Iwj0",
  authDomain: "reconocimiento-emocional-2d6e4.firebaseapp.com",
  projectId: "reconocimiento-emocional-2d6e4",
  storageBucket: "reconocimiento-emocional-2d6e4.firebasestorage.app",
  messagingSenderId: "916389845817",
  appId: "1:916389845817:web:58e56ecb07ce37001826e8",
  measurementId: "G-7LWDZBT0P2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);