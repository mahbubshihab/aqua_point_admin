import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  DocumentData,
  Timestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoConfigKeyForAquaPointBD123",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "aqua-point-bd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aqua-point-bd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "aqua-point-bd.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:102938475612:web:a1b2c3d4e5f6g7h8"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collection References
export const PRODUCTS_COLLECTION = 'products';
export const SERVICES_COLLECTION = 'services';
export const ORDERS_COLLECTION = 'orders';
export const INQUIRIES_COLLECTION = 'inquiries';

// Data Interfaces
export interface ProductDoc {
  id: string;
  name: string;
  model: string;
  category: string;
  price: number;
  warranty: string;
  description: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Pre-Order';
  filterHealth: number;
  imageUrl: string;
  createdAt?: any;
}

export interface ServiceRequestDoc {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  machineModel: string;
  appointmentDate: string;
  appointmentTime: string;
  problemDetails: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Urgent' | 'High' | 'Normal';
  technician: string;
  tdsReading?: number;
  createdAt?: any;
}

export interface OrderItemDoc {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderDoc {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  district?: string;
  items: OrderItemDoc[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Unpaid';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt?: any;
}

export interface InquiryDoc {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status?: 'New' | 'In Progress' | 'Resolved';
  createdAt?: any;
}

// -------------------------------------------------------------
// Real-time Firestore Subscriptions & Operations
// -------------------------------------------------------------

// PRODUCTS
export function subscribeToProducts(callback: (products: ProductDoc[]) => void) {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: ProductDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || data.title || 'Unnamed Product',
        model: data.model || 'AP-STANDARD',
        category: data.category || 'RO Purifiers',
        price: Number(data.price) || 0,
        warranty: data.warranty || '1 Year Standard Warranty',
        description: data.description || '',
        stockStatus: data.stockStatus || (data.stock && data.stock > 0 ? 'In Stock' : 'In Stock'),
        filterHealth: Number(data.filterHealth) || 100,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop',
        createdAt: data.createdAt,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error fetching products snapshot:', error);
    // Fallback if index missing or error
    const fallbackQ = collection(db, PRODUCTS_COLLECTION);
    onSnapshot(fallbackQ, (snapshot) => {
      const list: ProductDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || data.title || 'Unnamed Product',
          model: data.model || 'AP-STANDARD',
          category: data.category || 'RO Purifiers',
          price: Number(data.price) || 0,
          warranty: data.warranty || '1 Year Standard Warranty',
          description: data.description || '',
          stockStatus: data.stockStatus || 'In Stock',
          filterHealth: Number(data.filterHealth) || 100,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop',
          createdAt: data.createdAt,
        };
      });
      callback(list);
    });
  });
}

export async function addProductToFirestore(data: Omit<ProductDoc, 'id'>) {
  return await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateProductInFirestore(id: string, data: Partial<ProductDoc>) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  return await updateDoc(docRef, data);
}

export async function deleteProductFromFirestore(id: string) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  return await deleteDoc(docRef);
}

// SERVICE REQUESTS
export function subscribeToServiceRequests(callback: (requests: ServiceRequestDoc[]) => void) {
  const q = collection(db, SERVICES_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const list: ServiceRequestDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      
      // Normalize status string
      let rawStatus = (data.status || 'Pending').toString();
      let normalizedStatus: ServiceRequestDoc['status'] = 'Pending';
      if (rawStatus.toUpperCase() === 'PENDING') normalizedStatus = 'Pending';
      else if (rawStatus.toUpperCase() === 'IN PROGRESS' || rawStatus.toUpperCase() === 'CONFIRMED') normalizedStatus = 'In Progress';
      else if (rawStatus.toUpperCase() === 'COMPLETED') normalizedStatus = 'Completed';
      else if (rawStatus.toUpperCase() === 'CANCELLED') normalizedStatus = 'Cancelled';
      else if (['Pending', 'In Progress', 'Completed', 'Cancelled'].includes(rawStatus)) {
        normalizedStatus = rawStatus as ServiceRequestDoc['status'];
      }

      return {
        id: docSnap.id,
        customerName: data.customerName || data.name || 'Anonymous Customer',
        phone: data.phone || 'N/A',
        address: data.address || 'N/A',
        machineModel: data.machineModel || data.machineType || 'RO Water Purifier',
        appointmentDate: data.appointmentDate || data.preferredDate || new Date().toISOString().split('T')[0],
        appointmentTime: data.appointmentTime || data.preferredSlot || '10:00 AM',
        problemDetails: data.problemDetails || data.problemDescription || 'General servicing required',
        status: normalizedStatus,
        priority: data.priority || 'Normal',
        technician: data.technician || 'Unassigned',
        tdsReading: Number(data.tdsReading) || 45,
        createdAt: data.createdAt,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error fetching service requests:', error);
  });
}

export async function updateServiceRequestStatusInFirestore(id: string, status: ServiceRequestDoc['status'], technician?: string) {
  const docRef = doc(db, SERVICES_COLLECTION, id);
  const updateData: DocumentData = { status };
  if (technician !== undefined) {
    updateData.technician = technician;
  }
  return await updateDoc(docRef, updateData);
}

export async function assignTechnicianInFirestore(id: string, technician: string) {
  const docRef = doc(db, SERVICES_COLLECTION, id);
  return await updateDoc(docRef, { technician });
}

// ORDERS
export function subscribeToOrders(callback: (orders: OrderDoc[]) => void) {
  const q = collection(db, ORDERS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const list: OrderDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();

      // Normalize status string
      let rawStatus = (data.status || 'Pending').toString();
      let normalizedStatus: OrderDoc['status'] = 'Pending';
      if (rawStatus.toUpperCase() === 'PENDING') normalizedStatus = 'Pending';
      else if (rawStatus.toUpperCase() === 'PROCESSING') normalizedStatus = 'Processing';
      else if (rawStatus.toUpperCase() === 'SHIPPED') normalizedStatus = 'Shipped';
      else if (rawStatus.toUpperCase() === 'DELIVERED') normalizedStatus = 'Delivered';
      else if (rawStatus.toUpperCase() === 'CANCELLED') normalizedStatus = 'Cancelled';
      else if (['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(rawStatus)) {
        normalizedStatus = rawStatus as OrderDoc['status'];
      }

      return {
        id: docSnap.id,
        customerName: data.customerName || data.name || 'Anonymous Customer',
        phone: data.phone || 'N/A',
        email: data.email || '',
        address: data.address || 'N/A',
        district: data.district || '',
        items: Array.isArray(data.items) ? data.items : [],
        totalAmount: Number(data.totalAmount) || 0,
        paymentMethod: data.paymentMethod || 'COD',
        paymentStatus: data.paymentStatus || (data.paymentMethod === 'COD' ? 'Pending' : 'Paid'),
        status: normalizedStatus,
        createdAt: data.createdAt,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error fetching orders snapshot:', error);
  });
}

export async function updateOrderStatusInFirestore(id: string, status: OrderDoc['status'], paymentStatus?: OrderDoc['paymentStatus']) {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  const updateData: DocumentData = { status };
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }
  return await updateDoc(docRef, updateData);
}

// INQUIRIES
export function subscribeToInquiries(callback: (inquiries: InquiryDoc[]) => void) {
  const q = collection(db, INQUIRIES_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const list: InquiryDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Anonymous',
        phone: data.phone || 'N/A',
        email: data.email || '',
        subject: data.subject || 'General Inquiry',
        message: data.message || '',
        status: data.status || 'New',
        createdAt: data.createdAt,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error fetching inquiries snapshot:', error);
  });
}

export async function updateInquiryStatusInFirestore(id: string, status: InquiryDoc['status']) {
  const docRef = doc(db, INQUIRIES_COLLECTION, id);
  return await updateDoc(docRef, { status });
}

export async function deleteInquiryFromFirestore(id: string) {
  const docRef = doc(db, INQUIRIES_COLLECTION, id);
  return await deleteDoc(docRef);
}
