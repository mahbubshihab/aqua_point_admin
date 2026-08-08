import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, signOut, browserLocalPersistence, setPersistence } from 'firebase/auth';
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
  where,
  limit,
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
export const auth = getAuth(app);

// Fix: Use localStorage persistence instead of IndexedDB to prevent
// "Database is closing/hidden" error during Google Sign-In popup flow
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export const logoutAdmin = async () => {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }
  return signOut(auth);
};

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
export const BANNERS_COLLECTION = 'banners';
export const CUSTOMERS_COLLECTION = 'customers';

// Data Interfaces
export interface CustomerMessageDoc {
  id: string;
  text: string;
  sender: 'customer' | 'user' | 'admin';
  createdAt: any;
  isRead?: boolean;
}

export interface CustomerThreadDoc {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: number;
}

export interface CustomerDoc {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  joinedDate?: string;
  rewardPoints: number;
  referralCode: string;
  activeDevices: number;
  totalOrders: number;
  createdAt?: any;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: number;
}

export interface CustomProductDoc {
  id: string;
  name: string;
  model?: string;
  price: number;
  description?: string;
  imageUrl?: string;
  createdAt?: any;
}

export interface BannerDoc {
  id: string;
  imageUrl: string;
  position: 'main' | 'side_top' | 'side_bottom' | string;
  order: number;
  isActive: boolean;
  createdAt?: any;
}

export interface ClientDoc {
  id: string;
  name: string;
  industry?: string;
  logoUrl?: string;
  imageUrl?: string;
  createdAt?: any;
}

export type ProductType = 'open_type' | 'box_type' | 'hot_cold_normal' | 'cabinet_type';

export interface ProductDoc {
  id: string;
  name: string;
  model?: string;
  category: string;
  categoryId?: string;
  type?: ProductType;
  price: number;
  originalPrice?: number;
  description?: string;
  application?: string;
  warranty?: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pre-Order';
  featured?: boolean;
  filterHealth?: number;
  imageUrl: string;
  images?: string[];
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
// Real-time Firestore Subscriptions & Server-Side Paginated Operations
// -------------------------------------------------------------

function parseParams<T>(
  param1?: any,
  param2?: any,
  param3?: any
): { filterVal?: any; limitCount: number; callback: (data: T[]) => void } {
  let filterVal: any = undefined;
  let limitCount = 15;
  let callback: (data: T[]) => void = () => {};

  if (typeof param1 === 'function') {
    callback = param1;
  } else if (typeof param1 === 'number') {
    limitCount = param1;
    if (typeof param2 === 'function') callback = param2;
  } else {
    filterVal = param1;
    if (typeof param2 === 'function') {
      callback = param2;
    } else {
      if (typeof param2 === 'number') limitCount = param2;
      if (typeof param3 === 'function') callback = param3;
    }
  }

  return { filterVal, limitCount, callback };
}

// PRODUCTS
export function subscribeToProducts(
  categoryOrCb?: string | number | ((products: ProductDoc[]) => void),
  limitOrCb?: number | ((products: ProductDoc[]) => void),
  cbParam?: (products: ProductDoc[]) => void
) {
  const { filterVal: selectedCategory, limitCount, callback } = parseParams<ProductDoc>(categoryOrCb, limitOrCb, cbParam);

  let q;
  if (selectedCategory && selectedCategory !== 'All') {
    q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('categoryId', '==', selectedCategory),
      limit(limitCount)
    );
  } else {
    q = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ProductDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || data.title || 'Unnamed Product',
          model: data.model || '',
          category: data.category || 'RO Purifiers',
          categoryId: data.categoryId || data.category || '',
          type: data.type || 'open_type',
          price: Number(data.price) || 0,
          originalPrice: data.originalPrice !== undefined && data.originalPrice !== null ? Number(data.originalPrice) : undefined,
          description: data.description || '',
          application: data.application || '',
          warranty: data.warranty || '1 Year Standard Warranty',
          stockStatus: data.stockStatus || 'In Stock',
          featured: Boolean(data.featured),
          filterHealth: Number(data.filterHealth) || 100,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop',
          images: Array.isArray(data.images) && data.images.length > 0 ? data.images : (data.imageUrl ? [data.imageUrl] : []),
          createdAt: data.createdAt,
        };
      });
      callback(list);
    },
    (error) => {
      console.error('Error fetching products snapshot, fallback:', error);
      const fallbackQ = selectedCategory && selectedCategory !== 'All'
        ? query(collection(db, PRODUCTS_COLLECTION), where('category', '==', selectedCategory), limit(limitCount))
        : query(collection(db, PRODUCTS_COLLECTION), limit(limitCount));
      onSnapshot(fallbackQ, (snapshot) => {
        const list: ProductDoc[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || data.title || 'Unnamed Product',
            model: data.model || '',
            category: data.category || 'RO Purifiers',
            categoryId: data.categoryId || data.category || '',
            type: data.type || 'open_type',
            price: Number(data.price) || 0,
            originalPrice: data.originalPrice !== undefined && data.originalPrice !== null ? Number(data.originalPrice) : undefined,
            description: data.description || '',
            application: data.application || '',
            warranty: data.warranty || '1 Year Standard Warranty',
            stockStatus: data.stockStatus || 'In Stock',
            featured: Boolean(data.featured),
            filterHealth: Number(data.filterHealth) || 100,
            imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop',
            images: Array.isArray(data.images) && data.images.length > 0 ? data.images : (data.imageUrl ? [data.imageUrl] : []),
            createdAt: data.createdAt,
          };
        });
        callback(list);
      });
    }
  );
}

export async function addProductToFirestore(data: Omit<ProductDoc, 'id'>) {
  return await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...data,
    categoryId: data.categoryId || data.category,
    createdAt: serverTimestamp(),
  });
}

export async function updateProductInFirestore(id: string, data: Partial<ProductDoc>) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const updateData: DocumentData = { ...data };
  if (data.category && !data.categoryId) {
    updateData.categoryId = data.category;
  }
  return await updateDoc(docRef, updateData);
}

export async function deleteProductFromFirestore(id: string) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  return await deleteDoc(docRef);
}

// CATEGORIES
export function subscribeToCategories(
  limitOrCb?: number | ((categories: CategoryDoc[]) => void),
  cbParam?: (categories: CategoryDoc[]) => void
) {
  let limitCount = 15;
  let callback: (categories: CategoryDoc[]) => void = () => {};

  if (typeof limitOrCb === 'function') {
    callback = limitOrCb;
  } else {
    if (typeof limitOrCb === 'number') limitCount = limitOrCb;
    if (typeof cbParam === 'function') callback = cbParam;
  }

  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('createdAt', 'desc'), limit(limitCount));
  return onSnapshot(
    q,
    (snapshot) => {
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
    },
    (error) => {
      console.error('Error fetching categories snapshot, trying fallback:', error);
      const fallbackQ = query(collection(db, CATEGORIES_COLLECTION), limit(limitCount));
      onSnapshot(fallbackQ, (snapshot) => {
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
      });
    }
  );
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
export function subscribeToServiceRequests(
  statusOrCb?: string | number | ((requests: ServiceRequestDoc[]) => void),
  limitOrCb?: number | ((requests: ServiceRequestDoc[]) => void),
  cbParam?: (requests: ServiceRequestDoc[]) => void
) {
  const { filterVal: selectedStatus, limitCount, callback } = parseParams<ServiceRequestDoc>(statusOrCb, limitOrCb, cbParam);

  let q;
  if (selectedStatus && selectedStatus !== 'All') {
    q = query(collection(db, SERVICES_COLLECTION), where('status', '==', selectedStatus), limit(limitCount));
  } else {
    q = query(collection(db, SERVICES_COLLECTION), orderBy('createdAt', 'desc'), limit(limitCount));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ServiceRequestDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
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
          id: data.serviceId || data.requestId || docSnap.id,
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
    },
    (error) => {
      console.error('Error fetching service requests, trying fallback:', error);
      const fallbackQ = query(collection(db, SERVICES_COLLECTION), limit(limitCount));
      onSnapshot(fallbackQ, (snapshot) => {
        const list: ServiceRequestDoc[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
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
            id: data.serviceId || data.requestId || docSnap.id,
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
      });
    }
  );
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
export function subscribeToOrders(
  statusOrCb?: string | number | ((orders: OrderDoc[]) => void),
  limitOrCb?: number | ((orders: OrderDoc[]) => void),
  cbParam?: (orders: OrderDoc[]) => void
) {
  const { filterVal: selectedStatus, limitCount, callback } = parseParams<OrderDoc>(statusOrCb, limitOrCb, cbParam);

  let q;
  if (selectedStatus && selectedStatus !== 'All') {
    q = query(collection(db, ORDERS_COLLECTION), where('status', '==', selectedStatus), limit(limitCount));
  } else {
    q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'), limit(limitCount));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const list: OrderDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
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
          phone: data.customerPhone || data.phone || 'N/A',
          email: data.email || '',
          address: data.shippingAddress || data.address || 'N/A',
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
    },
    (error) => {
      console.error('Error fetching orders snapshot, trying fallback:', error);
      const fallbackQ = query(collection(db, ORDERS_COLLECTION), limit(limitCount));
      onSnapshot(fallbackQ, (snapshot) => {
        const list: OrderDoc[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
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
            phone: data.customerPhone || data.phone || 'N/A',
            email: data.email || '',
            address: data.shippingAddress || data.address || 'N/A',
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
      });
    }
  );
}

export async function addOrderToFirestore(orderData: {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItemDoc[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: OrderDoc['paymentStatus'];
  status: OrderDoc['status'];
}) {
  return await addDoc(collection(db, ORDERS_COLLECTION), {
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    phone: orderData.customerPhone,
    shippingAddress: orderData.shippingAddress,
    address: orderData.shippingAddress,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    paymentMethod: orderData.paymentMethod,
    paymentStatus: orderData.paymentStatus,
    status: orderData.status,
    createdAt: serverTimestamp(),
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
export function subscribeToInquiries(
  statusOrCb?: string | number | ((inquiries: InquiryDoc[]) => void),
  limitOrCb?: number | ((inquiries: InquiryDoc[]) => void),
  cbParam?: (inquiries: InquiryDoc[]) => void
) {
  const { filterVal: selectedStatus, limitCount, callback } = parseParams<InquiryDoc>(statusOrCb, limitOrCb, cbParam);

  let q;
  if (selectedStatus && selectedStatus !== 'All') {
    q = query(collection(db, INQUIRIES_COLLECTION), where('status', '==', selectedStatus), limit(limitCount));
  } else {
    q = query(collection(db, INQUIRIES_COLLECTION), orderBy('createdAt', 'desc'), limit(limitCount));
  }

  return onSnapshot(
    q,
    (snapshot) => {
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
    },
    (error) => {
      console.error('Error fetching inquiries snapshot, fallback:', error);
      const fallbackQ = query(collection(db, INQUIRIES_COLLECTION), limit(limitCount));
      onSnapshot(fallbackQ, (snapshot) => {
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
      });
    }
  );
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
export function subscribeToReviews(
  approvedOrCb?: boolean | 'all' | number | ((reviews: ReviewDoc[]) => void),
  limitOrCb?: number | ((reviews: ReviewDoc[]) => void),
  cbParam?: (reviews: ReviewDoc[]) => void
) {
  const { filterVal: isApprovedFilter, limitCount, callback } = parseParams<ReviewDoc>(approvedOrCb, limitOrCb, cbParam);

  let q;
  if (typeof isApprovedFilter === 'boolean') {
    q = query(collection(db, REVIEWS_COLLECTION), where('isApproved', '==', isApprovedFilter), limit(limitCount));
  } else {
    q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'), limit(limitCount));
  }

  return onSnapshot(
    q,
    (snapshot) => {
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
    },
    (error) => {
      console.error('Error fetching reviews snapshot, fallback:', error);
      const fallbackQ = query(collection(db, REVIEWS_COLLECTION), limit(limitCount));
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
    }
  );
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
  twitterUrl?: string;
  updatedAt?: any;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettingsDoc = {
  phone1: '',
  phone2: '',
  whatsapp: '',
  email: '',
  address: '',
  googleMapsUrl: '',
  facebookUrl: '',
  whatsappLink: '',
  youtubeUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
};

export function subscribeToCompanyInfo(callback: (info: CompanySettingsDoc) => void) {
  const docRef = doc(db, COMPANY_INFO_COLLECTION, 'main');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        phone1: data.phone1 || '',
        phone2: data.phone2 || '',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        address: data.address || '',
        googleMapsUrl: data.googleMapsUrl || '',
        facebookUrl: data.facebookUrl || '',
        whatsappLink: data.whatsappLink || '',
        youtubeUrl: data.youtubeUrl || '',
        instagramUrl: data.instagramUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        twitterUrl: data.twitterUrl || '',
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
export function subscribeToClients(
  limitOrCb?: number | ((clients: ClientDoc[]) => void),
  cbParam?: (clients: ClientDoc[]) => void
) {
  let limitCount = 15;
  let callback: (clients: ClientDoc[]) => void = () => {};

  if (typeof limitOrCb === 'function') {
    callback = limitOrCb;
  } else {
    if (typeof limitOrCb === 'number') limitCount = limitOrCb;
    if (typeof cbParam === 'function') callback = cbParam;
  }

  const q = query(collection(db, CLIENTS_COLLECTION), orderBy('createdAt', 'desc'), limit(limitCount));
  return onSnapshot(q, (snapshot) => {
    const list: ClientDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const image = data.imageUrl || data.logoUrl || '';
      return {
        id: docSnap.id,
        name: data.name || 'Unnamed Client',
        industry: data.industry || '',
        logoUrl: image,
        imageUrl: image,
        createdAt: data.createdAt,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error fetching clients snapshot with orderBy, trying fallback:', error);
    const fallbackQ = query(collection(db, CLIENTS_COLLECTION), limit(limitCount));
    onSnapshot(fallbackQ, (snapshot) => {
      const list: ClientDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const image = data.imageUrl || data.logoUrl || '';
        return {
          id: docSnap.id,
          name: data.name || 'Unnamed Client',
          industry: data.industry || '',
          logoUrl: image,
          imageUrl: image,
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

// BANNERS
export function subscribeToBanners(
  limitOrCb?: number | ((banners: BannerDoc[]) => void),
  cbParam?: (banners: BannerDoc[]) => void
) {
  let limitCount = 15;
  let callback: (banners: BannerDoc[]) => void = () => {};

  if (typeof limitOrCb === 'function') {
    callback = limitOrCb;
  } else {
    if (typeof limitOrCb === 'number') limitCount = limitOrCb;
    if (typeof cbParam === 'function') callback = cbParam;
  }

  const q = query(collection(db, BANNERS_COLLECTION), orderBy('createdAt', 'desc'), limit(limitCount));
  return onSnapshot(q, (snapshot) => {
    const list: BannerDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        imageUrl: data.imageUrl || data.image || '',
        position: data.position || 'main',
        order: typeof data.order === 'number' ? data.order : (typeof data.sequence === 'number' ? data.sequence : 1),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        createdAt: data.createdAt,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error fetching banners snapshot with orderBy, trying fallback:', error);
    const fallbackQ = query(collection(db, BANNERS_COLLECTION), limit(limitCount));
    onSnapshot(fallbackQ, (snapshot) => {
      const list: BannerDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          imageUrl: data.imageUrl || data.image || '',
          position: data.position || 'main',
          order: typeof data.order === 'number' ? data.order : (typeof data.sequence === 'number' ? data.sequence : 1),
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
          createdAt: data.createdAt,
        };
      });
      callback(list);
    });
  });
}

export async function addBannerToFirestore(data: Omit<BannerDoc, 'id'>) {
  return await addDoc(collection(db, BANNERS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateBannerInFirestore(id: string, data: Partial<BannerDoc>) {
  const docRef = doc(db, BANNERS_COLLECTION, id);
  return await updateDoc(docRef, data);
}

export async function deleteBannerFromFirestore(id: string) {
  const docRef = doc(db, BANNERS_COLLECTION, id);
  return await deleteDoc(docRef);
}

// CUSTOMERS & CUSTOM PRODUCTS
export function subscribeToCustomers(
  limitOrCb?: number | ((customers: CustomerDoc[]) => void),
  cbParam?: (customers: CustomerDoc[]) => void
) {
  let limitCount = 100;
  let callback: (customers: CustomerDoc[]) => void = () => {};

  if (typeof limitOrCb === 'function') {
    callback = limitOrCb;
  } else {
    if (typeof limitOrCb === 'number') limitCount = limitOrCb;
    if (typeof cbParam === 'function') callback = cbParam;
  }

  const q = query(
    collection(db, CUSTOMERS_COLLECTION),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: CustomerDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let formattedJoinedDate = 'N/A';
        if (data.joinedDate) {
          formattedJoinedDate = data.joinedDate;
        } else if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            formattedJoinedDate = data.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          } else if (data.createdAt.seconds) {
            formattedJoinedDate = new Date(data.createdAt.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          }
        }
        return {
          id: docSnap.id,
          name: data.name || data.customerName || 'Unnamed Customer',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          address: data.address || data.location || data.fullAddress || 'N/A',
          joinedDate: formattedJoinedDate,
          rewardPoints: Number(data.rewardPoints) || 0,
          referralCode: data.referralCode || `AQUA-${docSnap.id.substring(0, 6).toUpperCase()}`,
          activeDevices: Number(data.activeDevices) || 0,
          totalOrders: Number(data.totalOrders) || 0,
          createdAt: data.createdAt,
          lastMessage: data.lastMessage || data.lastMessageText || '',
          lastMessageTime: data.lastMessageTime || data.updatedAt || data.createdAt,
          unreadCount: Number(data.unreadCount) || 0,
        };
      });
      callback(list);
    },
    (error) => {
      console.error('Error fetching customers snapshot:', error);
    }
  );
}

export function subscribeToCustomerCustomProducts(
  customerId: string,
  limitOrCb?: number | ((products: CustomProductDoc[]) => void),
  cbParam?: (products: CustomProductDoc[]) => void
) {
  if (!customerId) return () => {};

  let limitCount = 15;
  let callback: (products: CustomProductDoc[]) => void = () => {};

  if (typeof limitOrCb === 'function') {
    callback = limitOrCb;
  } else {
    if (typeof limitOrCb === 'number') limitCount = limitOrCb;
    if (typeof cbParam === 'function') callback = cbParam;
  }

  const q = query(
    collection(db, CUSTOMERS_COLLECTION, customerId, 'custom_products'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: CustomProductDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || data.title || 'Custom Purifier Unit',
          model: data.model || 'CUSTOM-RO',
          price: Number(data.price) || 0,
          description: data.description || data.specs || '',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800&auto=format&fit=crop',
          createdAt: data.createdAt,
        };
      });
      callback(list);
    },
    (error) => {
      console.error('Error fetching custom products snapshot:', error);
    }
  );
}

// CUSTOMER LIVE MESSAGING
export function subscribeToCustomerThreads(
  limitOrCb?: number | ((threads: CustomerThreadDoc[]) => void),
  cbParam?: (threads: CustomerThreadDoc[]) => void
) {
  let limitCount = 15;
  let callback: (threads: CustomerThreadDoc[]) => void = () => {};

  if (typeof limitOrCb === 'function') {
    callback = limitOrCb;
  } else {
    if (typeof limitOrCb === 'number') limitCount = limitOrCb;
    if (typeof cbParam === 'function') callback = cbParam;
  }

  const q = query(collection(db, CUSTOMERS_COLLECTION), limit(limitCount));
  return onSnapshot(q, (snapshot) => {
    const list: CustomerThreadDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || data.customerName || 'Anonymous Customer',
        phone: data.phone || 'N/A',
        email: data.email || '',
        address: data.address || '',
        avatarUrl: data.avatarUrl || data.photoURL || '',
        lastMessage: data.lastMessage || data.lastMessageText || '',
        lastMessageTime: data.lastMessageTime || data.updatedAt || data.createdAt,
        unreadCount: Number(data.unreadCount) || 0,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Error subscribing to customer threads:', error);
  });
}

export function subscribeToCustomerMessages(
  selectedUserId: string,
  limitOrCb?: number | ((messages: CustomerMessageDoc[]) => void),
  cbParam?: (messages: CustomerMessageDoc[]) => void
) {
  if (!selectedUserId) return () => {};

  let limitCount = 20;
  let callback: (messages: CustomerMessageDoc[]) => void = () => {};

  if (typeof limitOrCb === 'function') {
    callback = limitOrCb;
  } else {
    if (typeof limitOrCb === 'number') limitCount = limitOrCb;
    if (typeof cbParam === 'function') callback = cbParam;
  }

  const q = query(
    collection(db, CUSTOMERS_COLLECTION, selectedUserId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const list: CustomerMessageDoc[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        text: data.text || data.message || data.content || '',
        sender: data.sender || 'customer',
        createdAt: data.createdAt,
        isRead: data.isRead !== undefined ? Boolean(data.isRead) : true,
      };
    });
    callback(list);
  }, (error) => {
    console.error('Fallback subscribing to customer messages without orderBy:', error);
    const fallbackQ = query(
      collection(db, CUSTOMERS_COLLECTION, selectedUserId, 'messages'),
      limit(limitCount)
    );
    return onSnapshot(fallbackQ, (snapshot) => {
      const list: CustomerMessageDoc[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          text: data.text || data.message || data.content || '',
          sender: data.sender || 'customer',
          createdAt: data.createdAt,
          isRead: data.isRead !== undefined ? Boolean(data.isRead) : true,
        };
      });
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
      });
      callback(list);
    });
  });
}

export async function sendAdminReply(customerId: string, text: string) {
  if (!customerId || !text.trim()) return;
  const msgRef = collection(db, CUSTOMERS_COLLECTION, customerId, 'messages');
  await addDoc(msgRef, {
    text: text.trim(),
    sender: 'admin',
    createdAt: serverTimestamp(),
    isRead: true,
  });

  const custRef = doc(db, CUSTOMERS_COLLECTION, customerId);
  await setDoc(custRef, {
    lastMessage: text.trim(),
    lastMessageTime: serverTimestamp(),
    unreadCount: 0,
  }, { merge: true });
}

export async function markThreadAsRead(customerId: string) {
  if (!customerId) return;
  const custRef = doc(db, CUSTOMERS_COLLECTION, customerId);
  await setDoc(custRef, {
    unreadCount: 0,
  }, { merge: true });
}
