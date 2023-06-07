import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBH4SvoHeT6CvvrKXm2b1XI7cfBJeRjjAg",
  authDomain: "bdpifagor.firebaseapp.com",
  databaseURL: "https://bdpifagor-default-rtdb.firebaseio.com",
  projectId: "bdpifagor",
  storageBucket: "bdpifagor.appspot.com",
  messagingSenderId: "48454220064",
  appId: "1:48454220064:web:4978bc6515878cb782bf45",
  measurementId: "G-X9XFQJTVJC"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);