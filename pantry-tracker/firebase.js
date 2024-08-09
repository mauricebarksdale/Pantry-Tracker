// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC60DfjmWO0z4NAYlvg73g2V8i_SBg9f9g",
  authDomain: "pantry-tracker-93f59.firebaseapp.com",
  projectId: "pantry-tracker-93f59",
  storageBucket: "pantry-tracker-93f59.appspot.com",
  messagingSenderId: "814887155072",
  appId: "1:814887155072:web:3e1f53ac4a71cd89247d65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore }; 