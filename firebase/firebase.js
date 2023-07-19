
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {getAuth} from "firebase/auth";
import {getStorage} from "firebase/storage";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyzunHTCb18txGJxF5aPuNau7M87tRRU8",
  authDomain: "chat-app-35118.firebaseapp.com",
  projectId: "chat-app-35118",
  storageBucket: "chat-app-35118.appspot.com",
  messagingSenderId: "1093254436725",
  appId: "1:1093254436725:web:f7a99a9ca7e0362461653c",
  measurementId: "G-KBG7TLHQGP"
};


const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);