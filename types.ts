export interface MarkerData {
    id: string;
    type: 'rocket' | 'plane' | 'ship';
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    label?: string;
    status?: 'active' | 'inactive';
    rotation?: number;
}

export interface User {
    id: string;
    avatarUrl: string;
}

export interface MissionDetails {
    markerId: string;
    title: string;
    location: string;
    net: string; // ISO Date String for live countdown
    statusLabel: string;
    rocket: string;
    payload: string;
    orbit: string;
    description: string;
    padId?: number; // Helper for map positioning
}
