// Room types and enums
export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'PRESIDENTIAL';
export type BedType = 'SINGLE' | 'DOUBLE' | 'QUEEN' | 'KING';
export type ViewType = 'CITY' | 'GARDEN' | 'OCEAN' | 'MOUNTAIN';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

// Room interface matching backend RoomResponse
export interface Room {
    roomId: string;
    roomNumber: string;
    roomType: RoomType;
    bedType: BedType;
    pricePerNight: number;
    amenities: string[];
    maxOccupancy: number;
    availability: boolean;
    description: string;
    floor: number;
    roomSize: number;
    viewType: ViewType;
    images: string[];

    // Calculated fields from backend
    currentStatus?: RoomStatus;
    hasActiveReservations?: boolean;

    createdAt?: string;
    updatedAt?: string;
}

// Create room data matching backend CreateRoomRequest
export interface CreateRoomData {
    roomType: RoomType;
    bedType: BedType;
    pricePerNight: number;
    amenities: string[];
    maxOccupancy: number;
    description: string;
    availability: boolean;
    floor: number;
    roomSize: number;
    viewType: ViewType;
    images: string[];
}

// Update room data matching backend UpdateRoomRequest
export interface UpdateRoomData {
    roomType?: RoomType;
    bedType?: BedType;
    pricePerNight?: number;
    amenities?: string[];
    maxOccupancy?: number;
    description?: string;
    availability?: boolean;
    floor?: number;
    roomSize?: number;
    viewType?: ViewType;
    images?: string[];
}

// Room filter params matching backend RoomFilterRequest
export interface RoomFilterParams {
    roomType?: RoomType;
    minPrice?: number;
    maxPrice?: number;
    availability?: boolean;
    amenities?: string[];
    minOccupancy?: number;
    maxOccupancy?: number;
    availabilityDate?: string; // ISO date string
    searchQuery?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Paginated response
export interface PaginatedRoomResponse {
    content: Room[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}
