'use client';

import { initializeFirebase } from './index';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  DocumentData,
  QuerySnapshot,
  CollectionReference 
} from 'firebase/firestore';

// Initialize Firebase and get Firestore instance
const { firestore } = initializeFirebase();

// Example: Add a document to a collection
export async function addDocument(collectionName: string, data: any) {
  try {
    const docRef = await addDoc(collection(firestore, collectionName), data);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
    throw error;
  }
}

// Example: Get a document by ID
export async function getDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(firestore, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting document: ', error);
    throw error;
  }
}

// Example: Get all documents from a collection
export async function getCollection(collectionName: string) {
  try {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    const documents: any[] = [];
    
    querySnapshot.forEach((doc: DocumentData) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting collection: ', error);
    throw error;
  }
}

// Example: Update a document
export async function updateDocument(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await updateDoc(docRef, data);
    console.log('Document successfully updated!');
  } catch (error) {
    console.error('Error updating document: ', error);
    throw error;
  }
}

// Example: Delete a document
export async function deleteDocument(collectionName: string, docId: string) {
  try {
    await deleteDoc(doc(firestore, collectionName, docId));
    console.log('Document successfully deleted!');
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw error;
  }
}

// Example: Query with filters
export async function queryDocuments(collectionName: string, field: string, operator: any, value: any) {
  try {
    const q = query(
      collection(firestore, collectionName),
      where(field, operator, value),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const documents: any[] = [];
    
    querySnapshot.forEach((doc: DocumentData) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return documents;
  } catch (error) {
    console.error('Error querying documents: ', error);
    throw error;
  }
}

// Example usage for a coffee shop app
export const coffeeExamples = {
  // Add a new coffee order
  async addOrder(orderData: {
    customerName: string;
    coffeeType: string;
    size: string;
    price: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed';
  }) {
    return await addDocument('orders', {
      ...orderData,
      createdAt: new Date().toISOString()
    });
  },

  // Get all pending orders
  async getPendingOrders() {
    return await queryDocuments('orders', 'status', '==', 'pending');
  },

  // Get order by ID
  async getOrder(orderId: string) {
    return await getDocument('orders', orderId);
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    return await updateDocument('orders', orderId, { 
      status,
      updatedAt: new Date().toISOString()
    });
  }
};
