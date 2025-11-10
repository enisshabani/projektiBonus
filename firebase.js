import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhCAauOtdIHekaYYpIiBDnNKd-FSrCBnk",
  authDomain: "week-3-practice-5fd01.firebaseapp.com",
  projectId: "week-3-practice-5fd01",
  storageBucket: "week-3-practice-5fd01.appspot.com",
  messagingSenderId: "792262978726",
  appId: "1:792262978726:web:015cbb508509f26d5cd867",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
