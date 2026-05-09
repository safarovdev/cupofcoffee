// Firestore usage examples for your coffee app
// Import from your existing Firebase setup
import { initializeFirebase } from './index.js';
import { useCollection } from './firestore/use-collection.js';
import { useDoc } from './firestore/use-doc.js';

// Get Firestore instance
const { firestore } = initializeFirebase();

// Example functions for Firestore operations

// Add a new coffee order
export async function addCoffeeOrder(orderData) {
  try {
    const { collection, addDoc } = await import('firebase/firestore');
    
    const order = {
      customerName: orderData.customerName,
      coffeeType: orderData.coffeeType,
      size: orderData.size,
      price: orderData.price,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(firestore, 'orders'), order);
    console.log('Order added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

// Get all orders
export async function getAllOrders() {
  try {
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const ordersQuery = query(
      collection(firestore, 'orders'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

// Get pending orders
export async function getPendingOrders() {
  try {
    const { collection, getDocs, where, orderBy, query } = await import('firebase/firestore');
    
    const pendingOrdersQuery = query(
      collection(firestore, 'orders'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(pendingOrdersQuery);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting pending orders:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    
    const orderRef = doc(firestore, 'orders', orderId);
    await updateDoc(orderRef, {
      status: status,
      updatedAt: new Date().toISOString()
    });
    
    console.log('Order status updated:', orderId, status);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Get specific order
export async function getOrder(orderId) {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    
    const orderRef = doc(firestore, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return {
        id: orderSnap.id,
        ...orderSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

// Example usage in a React component:
/*
import { useCollection } from '../firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';

function OrdersList() {
  const { firestore } = initializeFirebase();
  const ordersQuery = query(
    collection(firestore, 'orders'),
    orderBy('createdAt', 'desc')
  );
  
  const { data: orders, loading, error } = useCollection(ordersQuery);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {orders?.map(order => (
        <div key={order.id}>
          <h3>{order.customerName}</h3>
          <p>{order.coffeeType} - {order.size}</p>
          <p>Status: {order.status}</p>
          <p>Price: ${order.price}</p>
        </div>
      ))}
    </div>
  );
}
*/
