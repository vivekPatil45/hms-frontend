// Room types
export type RoomType = 'SINGLE' | 'DOUBLE' | 'STANDARD' | 'DELUXE' | 'SUITE' | 'PRESIDENTIAL';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

// Room interface
export interface Room {
    id: number;
    number: string;
    type: RoomType;
    floor: number;
    pricePerNight: number;
    status: RoomStatus;
    description: string;
    amenities: string[];
    capacity: number;
    createdAt?: string;
    updatedAt?: string;
}

// Room filter params
export interface RoomFilterParams {
    type?: RoomType;
    status?: RoomStatus;
    minPrice?: number;
    maxPrice?: number;
    floor?: number;
}
