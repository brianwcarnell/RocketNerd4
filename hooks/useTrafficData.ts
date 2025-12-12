import { useState, useEffect, useCallback, useRef } from 'react';
import { MarkerData } from '../types';
import { GEO_BOUNDS } from '../constants';
import { latLonToXY } from '../utils';

export const useTrafficData = (isPlaying: boolean) => {
    const [trafficMarkers, setTrafficMarkers] = useState<MarkerData[]>([]);
    const [isLiveADSB, setIsLiveADSB] = useState(false);
    
    // Fallback Simulation Data refs
    const simPlanesRef = useRef<any[]>([]);
    const simShipsRef = useRef<any[]>([]);

    // Initialize Simulation Objects once
    useEffect(() => {
        // Create 3 random planes
        simPlanesRef.current = Array.from({ length: 3 }).map((_, i) => ({
            id: `sim-plane-${i}`,
            lat: GEO_BOUNDS.minLat + Math.random() * (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat),
            lon: GEO_BOUNDS.minLon + Math.random() * (GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon),
            heading: Math.random() * 360,
            speed: 0.002,
            type: 'plane' as const
        }));

        // Create 5 random ships
        simShipsRef.current = Array.from({ length: 5 }).map((_, i) => ({
            id: `sim-ship-${i}`,
            lat: GEO_BOUNDS.minLat + Math.random() * (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat) * 0.5, // Keep ships mostly south/water
            lon: GEO_BOUNDS.maxLon - Math.random() * 0.1, // Keep ships east
            heading: Math.random() * 360,
            speed: 0.0005,
            type: 'ship' as const
        }));
    }, []);

    const fetchOpenSky = useCallback(async () => {
        try {
            // Fetch live data for the bounding box
            const response = await fetch(
                `https://opensky-network.org/api/states/all?lamin=${GEO_BOUNDS.minLat}&lomin=${GEO_BOUNDS.minLon}&lamax=${GEO_BOUNDS.maxLat}&lomax=${GEO_BOUNDS.maxLon}`
            );
            
            if (!response.ok) throw new Error("API Limit or Error");

            const data = await response.json();
            const states = data.states || [];

            const markers: MarkerData[] = states.map((state: any) => {
                const [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track] = state;
                const { x, y } = latLonToXY(latitude, longitude);
                
                return {
                    id: `adsb-${icao24}`,
                    type: 'plane',
                    x,
                    y,
                    rotation: true_track,
                    label: callsign?.trim() || 'Unknown',
                    status: 'active'
                };
            });

            return { success: true, markers };
        } catch (err) {
            return { success: false, markers: [] };
        }
    }, []);

    const updateSimulation = useCallback(() => {
        const updateEntity = (entity: any) => {
            // Move based on heading
            const rad = (entity.heading - 90) * (Math.PI / 180);
            entity.lon += Math.cos(rad) * entity.speed;
            entity.lat -= Math.sin(rad) * entity.speed; // Lat goes up, but we use map logic here

            // Bounce off bounds
            if (entity.lat < GEO_BOUNDS.minLat || entity.lat > GEO_BOUNDS.maxLat) {
                entity.heading = (360 - entity.heading) % 360;
                entity.lat = Math.max(GEO_BOUNDS.minLat, Math.min(GEO_BOUNDS.maxLat, entity.lat));
            }
            if (entity.lon < GEO_BOUNDS.minLon || entity.lon > GEO_BOUNDS.maxLon) {
                entity.heading = (180 - entity.heading + 360) % 360;
                entity.lon = Math.max(GEO_BOUNDS.minLon, Math.min(GEO_BOUNDS.maxLon, entity.lon));
            }

            const { x, y } = latLonToXY(entity.lat, entity.lon);
            return {
                id: entity.id,
                type: entity.type,
                x,
                y,
                rotation: entity.heading,
                label: entity.type === 'plane' ? 'TRAFFIC' : 'VESSEL',
                status: 'active'
            };
        };

        const planeMarkers = simPlanesRef.current.map(updateEntity);
        const shipMarkers = simShipsRef.current.map(updateEntity);

        return [...planeMarkers, ...shipMarkers];
    }, []);

    useEffect(() => {
        let intervalId: any;

        const loop = async () => {
            // 1. Try to fetch Real Data
            const { success, markers: realMarkers } = await fetchOpenSky();
            setIsLiveADSB(success);

            // 2. Get Simulated Data (Always run ships, run planes if API fails)
            const simMarkers = updateSimulation();
            const simShips = simMarkers.filter(m => m.type === 'ship');
            const simPlanes = simMarkers.filter(m => m.type === 'plane');

            // 3. Merge
            // If real data worked, use it for planes. If not, use sim planes. Always use sim ships.
            const finalMarkers = [
                ...simShips,
                ...(success && realMarkers.length > 0 ? realMarkers : simPlanes)
            ];

            setTrafficMarkers(finalMarkers);
        };

        // Run immediately
        loop();

        // Polling Interval
        if (isPlaying) {
             // If simulating, we need fast updates. If fetching API, we need slow updates (10s).
             // We'll run fast loop for smooth sim, but throttle API calls in a real app.
             // For this demo, we just run at 1s intervals.
            intervalId = setInterval(loop, 2000);
        }

        return () => clearInterval(intervalId);
    }, [isPlaying, fetchOpenSky, updateSimulation]);

    return { trafficMarkers, isLiveADSB };
};