import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set,push } from "firebase/database";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword,createUserWithEmailAndPassword  } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyDZN7DF3BPdseBoCP2l6A3Yjbc0ECb0pMk",
    authDomain: "parkingait.firebaseapp.com",
    databaseURL: "https://parkingait-default-rtdb.firebaseio.com",
    projectId: "parkingait",
    storageBucket: "parkingait.appspot.com",
    messagingSenderId: "987453531886",
    appId: "1:987453531886:web:d641b174467546f31fb5ff",
    measurementId: "G-1C4E694RZQ"
};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyAA-3AL4E2X6g6eKvB5VDYjoorngVbuxjY",
//     authDomain: "parkingait-c1655.firebaseapp.com",
//     databaseURL: "https://parkingait-c1655-default-rtdb.firebaseio.com",
//     projectId: "parkingait-c1655",
//     storageBucket: "parkingait-c1655.appspot.com",
//     messagingSenderId: "467061230583",
//     appId: "1:467061230583:web:d954a3e06a527afcf6fcf2",
//     measurementId: "G-YLT27CSMFB"
//   };

const app = initializeApp(firebaseConfig);
// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);
const auth = getAuth(app);

export {auth, db};

