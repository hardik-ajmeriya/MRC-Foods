
// Firebase order API wrappers
import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

/**
 * Example Firestore order document schema:
 * {
 *   id: string,
 *   studentId: string,
 *   items: [
 *     { itemId: string, name: string, quantity: number, price: number }
 *   ],
 *   statusTimeline: [
 *     { status: 'Placed'|'Accepted'|'Preparing'|'Ready'|'Collected', timestamp: Date }
 *   ],
 *   currentStatus: string,
 *   createdAt: Date,
 *   estimatedPickup: Date,
 *   notifications: [
 *     { type: 'in-app'|'push', message: string, timestamp: Date }
 *   ]
 * }
 */


// Create a new order in Firestore
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date(),
      statusTimeline: [
        {
          status: orderData.currentStatus || 'Placed',
          timestamp: new Date(),
        },
      ],
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};


// Listen to all orders in real time (for staff dashboard)
export const listenToOrders = (cb) => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    cb(orders);
  });
};
