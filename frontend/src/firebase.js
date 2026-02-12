import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCpkwYt8YuiwLjkTIHqW-5zltmnpkb89wo",
    authDomain: "safeguard-ai-d0edb.firebaseapp.com",
    projectId: "safeguard-ai-d0edb",
    storageBucket: "safeguard-ai-d0edb.firebasestorage.app",
    messagingSenderId: "583437451965",
    appId: "1:583437451965:web:032898a2224abdc98fedd4",
    measurementId: "G-ZH5FL0Y7X4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Auth, Firestore, and Providers
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export { analytics };
