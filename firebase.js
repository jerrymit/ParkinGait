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

const app = initializeApp(firebaseConfig);
// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);
const auth = getAuth(app);

export {auth, db};

