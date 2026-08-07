import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
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
  apiKey: "AIzaSyDtWGfMVTfYAULRNNxVx3WcRdy_WZaK0MY",
  authDomain: "aqua-point-bd.firebaseapp.com",
  projectId: "aqua-point-bd",
  storageBucket: "aqua-point-bd.firebasestorage.app",
  messagingSenderId: "246078088676",
  appId: "1:246078088676:web:d4a22f9eaa4d5fd58393f1",
  measurementId: "G-YHDCLHFWVG"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && getAnalytics(app));
}

// Collection References
export const PRODUCTS_COLLECTION = 'products';
export const CATEGORIES_COLLECTION = 'categories';
export const SERVICES_COLLECTION = 'services';
export const ORDERS_COLLECTION = 'orders';
export const INQUIRIES_COLLECTION = 'inquiries';
export const REVIEWS_COLLECTION = 'reviews';
export const COMPANY_INFO_COLLECTION = 'company_info';
export const CLIENTS_COLLECTION = 'clients';


// Data Interfaces
export interface ClientDoc {
  id: string;
  name: string;
  industry?: string;
  logoUrl: string;
  createdAt?: any;
}
export interface ProductDoc {
  id: string;
  name: string;
  model?: string;
  category: string;
  price: number;
  originalPrice?: number;
  description?: string;
  application?: string;
  warranty?: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pre-Order';
  featured?: boolean;
  filterHealth?: number;
  imageUrl: string;
  createdAt?: any;
}

export interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
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

export interface ReviewDoc {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  isApproved: boolean;
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
        model: data.model || '',
        category: data.category || 'RO Purifiers',
        price: Number(data.price) || 0,
        originalPrice: data.originalPrice !== undefined && data.originalPrice !== null ? Number(data.originalPrice) : undefined,
        description: data.description || '',
        application: data.application || '',
        warranty: data.warranty || '1 Year Standard Warranty',
        stockStatus: data.stockStatus || 'In Stock',
        featured: Boolean(data.featured),
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
          model: data.model || '',
          category: data.category || 'RO Purifiers',
          price: Number(data.price) || 0,
          originalPrice: data.originalPrice !== undefined && data.originalPrice !== null ? Number(data.originalPrice) : undefined,
          description: data.description || '',
          application: data.application || '',
          warranty: data.warranty || '1 Year Standard Warranty',
          stockStatus: data.stockStatus || 'In Stock',
          featured: Boolean(data.featured),
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

// CATEGORIES
export function subscribeToCategories(callback: (categories: CategoryDoc[]) => void) {
  const q = collection(db, CATEGORIES_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const list: CategoryDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        productCount: Number(data.productCount) || 0,
        createdAt: data.createdAt,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error fetching categories snapshot:', error);
  });
}

export async function addCategoryToFirestore(data: Omit<CategoryDoc, 'id'>) {
  return await addDoc(collection(db, CATEGORIES_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateCategoryInFirestore(id: string, data: Partial<CategoryDoc>) {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  return await updateDoc(docRef, data);
}

export async function deleteCategoryFromFirestore(id: string) {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
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

// REVIEWS
export function subscribeToReviews(callback: (reviews: ReviewDoc[]) => void) {
  const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: ReviewDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        customerName: data.customerName || data.name || 'Anonymous Customer',
        location: data.location || 'Dhaka',
        rating: Number(data.rating) || 5,
        comment: data.comment || '',
        isApproved: data.isApproved !== undefined ? Boolean(data.isApproved) : true,
        createdAt: data.createdAt,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error fetching reviews snapshot:', error);
    const fallbackQ = collection(db, REVIEWS_COLLECTION);
    onSnapshot(fallbackQ, (snapshot) => {
      const list: ReviewDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          customerName: data.customerName || data.name || 'Anonymous Customer',
          location: data.location || 'Dhaka',
          rating: Number(data.rating) || 5,
          comment: data.comment || '',
          isApproved: data.isApproved !== undefined ? Boolean(data.isApproved) : true,
          createdAt: data.createdAt,
        };
      });
      callback(list);
    });
  });
}

export async function addReviewToFirestore(data: Omit<ReviewDoc, 'id'>) {
  return await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateReviewInFirestore(id: string, data: Partial<ReviewDoc>) {
  const docRef = doc(db, REVIEWS_COLLECTION, id);
  return await updateDoc(docRef, data);
}

export async function deleteReviewFromFirestore(id: string) {
  const docRef = doc(db, REVIEWS_COLLECTION, id);
  return await deleteDoc(docRef);
}

// COMPANY INFO & SOCIAL MEDIA
export interface CompanySettingsDoc {
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  facebookUrl: string;
  whatsappLink: string;
  youtubeUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  updatedAt?: any;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettingsDoc = {
  phone1: '01780-885841',
  phone2: '09613 700 750',
  whatsapp: '+8801780885841',
  email: 'aquabd112@gmail.com',
  address: 'House 72, Janata Housing Road, 3 Ring Road, Dhaka 1219',
  googleMapsUrl: 'https://maps.google.com/?q=House+72,+Janata+Housing+Road,+3+Ring+Road,+Dhaka+1219',
  facebookUrl: 'https://facebook.com/aquapointbd',
  whatsappLink: 'https://wa.me/8801780885841',
  youtubeUrl: 'https://youtube.com/@aquapointbd',
  instagramUrl: 'https://instagram.com/aquapointbd',
  linkedinUrl: 'https://linkedin.com/company/aquapointbd',
};

export function subscribeToCompanyInfo(callback: (info: CompanySettingsDoc) => void) {
  const docRef = doc(db, COMPANY_INFO_COLLECTION, 'main');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        phone1: data.phone1 ?? DEFAULT_COMPANY_SETTINGS.phone1,
        phone2: data.phone2 ?? DEFAULT_COMPANY_SETTINGS.phone2,
        whatsapp: data.whatsapp ?? DEFAULT_COMPANY_SETTINGS.whatsapp,
        email: data.email ?? DEFAULT_COMPANY_SETTINGS.email,
        address: data.address ?? DEFAULT_COMPANY_SETTINGS.address,
        googleMapsUrl: data.googleMapsUrl ?? DEFAULT_COMPANY_SETTINGS.googleMapsUrl,
        facebookUrl: data.facebookUrl ?? DEFAULT_COMPANY_SETTINGS.facebookUrl,
        whatsappLink: data.whatsappLink ?? DEFAULT_COMPANY_SETTINGS.whatsappLink,
        youtubeUrl: data.youtubeUrl ?? DEFAULT_COMPANY_SETTINGS.youtubeUrl,
        instagramUrl: data.instagramUrl ?? DEFAULT_COMPANY_SETTINGS.instagramUrl,
        linkedinUrl: data.linkedinUrl ?? DEFAULT_COMPANY_SETTINGS.linkedinUrl,
      });
    } else {
      callback(DEFAULT_COMPANY_SETTINGS);
    }
  }, (error) => {
    console.error('Error fetching company info snapshot:', error);
    callback(DEFAULT_COMPANY_SETTINGS);
  });
}

export async function saveCompanyInfoToFirestore(data: Partial<CompanySettingsDoc>) {
  const docRef = doc(db, COMPANY_INFO_COLLECTION, 'main');
  return await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// CORPORATE CLIENTS
export function subscribeToClients(callback: (clients: ClientDoc[]) => void) {
  const q = query(collection(db, CLIENTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: ClientDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Unnamed Client',
        industry: data.industry || 'Corporate',
        logoUrl: data.logoUrl || data.imageUrl || '',
        createdAt: data.createdAt,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error fetching clients snapshot with orderBy, trying fallback:', error);
    const fallbackQ = collection(db, CLIENTS_COLLECTION);
    onSnapshot(fallbackQ, (snapshot) => {
      const list: ClientDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Unnamed Client',
          industry: data.industry || 'Corporate',
          logoUrl: data.logoUrl || data.imageUrl || '',
          createdAt: data.createdAt,
        };
      });
      callback(list);
    });
  });
}

export async function addClientToFirestore(data: Omit<ClientDoc, 'id'>) {
  return await addDoc(collection(db, CLIENTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateClientInFirestore(id: string, data: Partial<ClientDoc>) {
  const docRef = doc(db, CLIENTS_COLLECTION, id);
  return await updateDoc(docRef, data);
}

export async function deleteClientFromFirestore(id: string) {
  const docRef = doc(db, CLIENTS_COLLECTION, id);
  return await deleteDoc(docRef);
}
