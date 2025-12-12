import { MarkerData, MissionDetails } from './types';

export const MAP_IMAGE_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCvHNY4BvtLalZcygyFxnsPKnJ4ClAXsPp8iQ_O4qUDLYOJHX2tUPBVVrfvUREGF8983vMmvqEU7mMnSMgE0wq2QSyiZ1LokcjF47g29px06qECuzkcmfkqvWDnnFcFeFHJ14-MeK1bNDT9jJHAzqat1lrl9nEZBv0R88bnjhQsxRSBJZQ3lYdA0caQBy4Ym9JiyJMvxfrnSnWawR4W-QGvbHsg4jgvxtNUnIGi19cCXcs96Gov6ED5PnsEe8bKEe5NhnBYrC9m7zo";

export const AVATAR_1 = "https://lh3.googleusercontent.com/aida-public/AB6AXuBLLwMrhOp0eZFQdcsGIdmEQiUHcRPEx5je1xnVWi4eU9RaTUvd9XOBZNyrr7VOn7KCTQCwrsnITgI45_xJH0dd1XKnQcl8Gd6L0M3Q78izFawja-NPQG_UYPNVVhyFyxNmjGqfl_1BDEExYBh_1R-NYf9loxT0J3Z9wFwkv5QUN6jvzh1ic4Ajfe1MDfu2fxrsMuiEuQwnrhVV41SQkj6vsSSNZ9huNajPoS3AhtWAShty1rQpb3Oy1682-zuAYlX7haNya2VI08Y";
export const AVATAR_2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuC409ViDMSyqWK-q6HoIne5Je0QpEAUSeFt0RSvrjt_u4fc4E4v0F6eappkTft6fS0CN6r9sRblr-d1ZN6nqbto5aYk8krKRHkQKNBirJSgta7eplCKjKITcPZV_kLXG3fkGhmiXYmVFcRRcdq1M0tW2vHB9V4MRvBbncEi7dWBuQAtwx5wqxlQqR--oyOIZrzW6WUHPMKy4EZz-V4Z5YcjGiMK6RNwfJMIbhNzXdcvkr9jlX-4rQCYabGgaZHf9eMklkrNNzGtyfI";

// Calibrated roughly for the Cape Canaveral map image provided
export const GEO_BOUNDS = {
    minLat: 28.35,
    maxLat: 28.70,
    minLon: -80.80,
    maxLon: -80.45
};

export const INITIAL_MARKERS: MarkerData[] = []; // Cleared, as we now use live/simulated data

export const LAUNCH_DATA: Record<string, MissionDetails> = {
    'lc-39a': {
        markerId: 'lc-39a',
        title: 'SpaceX Starlink 6-42',
        location: 'LC-39A, Kennedy Space Center',
        net: '2025-10-25T14:30:00Z',
        statusLabel: 'Live Countdown',
        rocket: 'Falcon 9 B5',
        payload: 'Starlink v2',
        orbit: 'LEO',
        description: "Batch of 23 Starlink v2 Mini satellites for the Starlink mega-constellation. This mission will expand broadband coverage to remote global locations. Booster B1069 will land on the droneship 'Just Read the Instructions'."
    },
    'slc-41': {
        markerId: 'slc-41',
        title: 'USSF-51 (Atlas V)',
        location: 'SLC-41, Cape Canaveral SFS',
        net: '2025-11-15T20:00:00Z',
        statusLabel: 'Scheduled',
        rocket: 'Atlas V 551',
        payload: 'Classified',
        orbit: 'GEO',
        description: "A classified payload for the United States Space Force. This marks the final national security launch for the Atlas V family before retirement. The 551 configuration includes five solid rocket boosters."
    }
};