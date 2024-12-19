import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch data from Firestore
export const fetchSeoData = async () => {
  const seoDataSnapshot = await getDocs(collection(db, 'seoData'));
  const seoData = {};
  seoDataSnapshot.forEach((doc) => {
    seoData[doc.id] = doc.data();
  });
  return seoData;
};

// Save new data (with a specified document ID for the website)
export const saveSeoData = async (website, scores, dates) => {
  try {
    // Use setDoc with the website as the document ID
    const seoRef = doc(db, 'seoData', website);
    await setDoc(seoRef, {
      scores,
      dates,
    });
  } catch (error) {
    console.error('Error saving data: ', error);
  }
};

// Update data (with a specified document ID for the website)
// Update or Add SEO Data in Firestore
export const updateSeoData = async (website, scores, dates) => {
    const seoRef = doc(db, 'seoData', website); // Reference to the document
  
    try {
      // Update the document if it exists, otherwise create it
      await setDoc(
        seoRef,
        {
          website,
          scores,
          dates // Automatically set the current time
        },
        { merge: true } // This ensures the document is updated without overwriting existing fields
      );
      console.log(`SEO data for ${website} updated successfully.`);
    } catch (error) {
      console.error('Error updating SEO data:', error);
    }
  };

// Delete data (with a specified document ID for the website)
export const deleteSeoData = async (website) => {
  const seoRef = doc(db, 'seoData', website);
  try {
    await deleteDoc(seoRef);
  } catch (error) {
    console.error('Error deleting data: ', error);
  }
};