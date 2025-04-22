import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyDA3-KQxb0-5Pk4lVWsTrQop_t_LtHN6UQ",
    authDomain: "slynk-29641.firebaseapp.com",
    databaseURL: "https://slynk-29641-default-rtdb.firebaseio.com",
    projectId: "slynk-29641",
    storageBucket: "slynk-29641.firebasestorage.app",
    messagingSenderId: "900099320114",
    appId: "1:900099320114:web:3521a83d6e82789eafcf2b",
    measurementId: "G-MFK6LRPYST"
  };
  

const app = initializeApp(firebaseConfig);
const storage = getStorage();
const storageRef = ref(storage, 'images'); // points to images

