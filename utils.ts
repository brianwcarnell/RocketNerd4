import { GEO_BOUNDS } from './constants.ts';

export const latLonToXY = (lat: number, lon: number) => {
    // Normalize lat/lon to 0-1 range based on bounds
    const latRange = GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat;
    const lonRange = GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon;

    const latPercent = (lat - GEO_BOUNDS.minLat) / latRange;
    const lonPercent = (lon - GEO_BOUNDS.minLon) / lonRange;

    // Convert to CSS % (Invert Lat because screen Y goes down, but Latitude goes up)
    // Adjust scale factors to fit the specific map crop/aspect ratio if needed
    return {
        x: lonPercent * 100,
        y: (1 - latPercent) * 100
    };
};