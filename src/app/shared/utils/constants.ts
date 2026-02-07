// API base URL
export const API_BASE_URL = 'http://localhost:8080/api';

// API endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',

    // Rooms
    ROOMS: '/rooms',
    ROOM_BY_ID: (id: number) => `/rooms/${id}`,

    // Reservations
    RESERVATIONS: '/reservations',
    RESERVATION_BY_ID: (id: number) => `/reservations/${id}`,
    MY_RESERVATIONS: '/reservations/my',

    // Complaints
    COMPLAINTS: '/complaints',
    COMPLAINT_BY_ID: (id: number) => `/complaints/${id}`,
    MY_COMPLAINTS: '/complaints/my',

    // Bills
    BILLS: '/bills',
    BILL_BY_ID: (id: number) => `/bills/${id}`,
    MY_BILLS: '/bills/my',

    // Customers (Admin only)
    CUSTOMERS: '/customers',
    CUSTOMER_BY_ID: (id: number) => `/customers/${id}`,

    // Staff (Admin only)
    STAFF: '/staff',
    STAFF_BY_ID: (id: number) => `/staff/${id}`,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    USER: 'hms_user_data',
    TOKEN: 'hms_auth_token',
} as const;

// Room amenities
export const ROOM_AMENITIES = [
    'WiFi',
    'Air Conditioning',
    'TV',
    'Mini Bar',
    'Room Service',
    'Safe',
    'Balcony',
    'Ocean View',
    'City View',
    'Bathtub',
    'Shower',
    'Hair Dryer',
    'Iron',
    'Coffee Maker',
] as const;

// Complaint categories
export const COMPLAINT_CATEGORIES = [
    'Room Cleanliness',
    'Maintenance',
    'Noise',
    'Staff Behavior',
    'Amenities',
    'Billing',
    'Food Service',
    'Other',
] as const;
