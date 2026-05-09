// Create admin user for Firebase Authentication
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDf0eTnkygKjLGg5LBu8KZEJ-NPvJ42XMk",
  authDomain: "coffee-f4bc1.firebaseapp.com",
  projectId: "coffee-f4bc1",
  storageBucket: "coffee-f4bc1.firebasestorage.app",
  messagingSenderId: "847730890494",
  appId: "1:847730890494:web:2a91d2cfb8bd674487b7af",
  measurementId: "G-3XN7LXDTJJ"
};

async function createAdminUser() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    // Admin user credentials
    const email = "admin@mail.com";
    const password = "admin123456"; // You should change this after first login

    console.log("Creating admin user...");
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("User created successfully:", user.uid);

    // Create user document in Firestore with admin role
    await setDoc(doc(firestore, "users", user.uid), {
      email: email,
      role: "admin",
      createdAt: new Date().toISOString(),
      isActive: true
    });

    console.log("Admin user document created in Firestore");
    console.log("Login credentials:");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("\nIMPORTANT: Change the password after first login!");

    // Sign out
    await auth.signOut();
    console.log("Admin user creation completed");

  } catch (error) {
    console.error("Error creating admin user:", error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log("Admin user already exists. You can try logging in with:");
      console.log("Email: admin@mail.com");
      console.log("Password: admin123456");
    }
  }
}

// Run the function
createAdminUser();
