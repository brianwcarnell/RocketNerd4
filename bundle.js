import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- CONSTANTS ---
const MAP_IMAGE_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCvHNY4BvtLalZcygyFxnsPKnJ4ClAXsPp8iQ_O4qUDLYOJHX2tUPBVVrfvUREGF8983vMmvqEU7mMnSMgE0wq2QSyiZ1LokcjF47g29px06qECuzkcmfkqvWDnnFcFeFHJ14-MeK1bNDT9jJHAzqat1lrl9nEZBv0R88bnjhQsxRSBJZQ3lYdA0caQBy4Ym9JiyJMvxfrnSnWawR4W-QGvbHsg4jgvxtNUnIGi19cCXcs96Gov6ED5PnsEe8bKEe5NhnBYrC9m7zo";
const AVATAR_1 = "https://lh3.googleusercontent.com/aida-public/AB6AXuBLLwMrhOp0eZFQdcsGIdmEQiUHcRPEx5je1xnVWi4eU9RaTUvd9XOBZNyrr7VOn7KCTQCwrsnITgI45_xJH0dd1XKnQcl8Gd6L0M3Q78izFawja-NPQG_UYPNVVhyFyxNmjGqfl_1BDEExYBh_1R-NYf9loxT0J3Z9wFwkv5QUN6jvzh1ic4Ajfe1MDfu2fxrsMuiEuQwnrhVV41SQkj6vsSSNZ9huNajPoS3AhtWAShty1rQpb3Oy1682-zuAYlX7haNya2VI08Y";
const AVATAR_2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuC409ViDMSyqWK-q6HoIne5Je0QpEAUSeFt0RSvrjt_u4fc4E4v0F6eappkTft6fS0CN6r9sRblr-d1ZN6nqbto5aYk8krKRHkQKNBirJSgta7eplCKjKITcPZV_kLXG3fkGhmiXYmVFcRRcdq1M0tW2vHB9V4MRvBbncEi7dWBuQAtwx5wqxlQqR--oyOIZrzW6WUHPMKy4EZz-V4Z5YcjGiMK6RNwfJMIbhNzXdcvkr9jlX-4rQCYabGgaZHf9eMklkrNNzGtyfI";

const GEO_BOUNDS = {
    minLat: 28.35,
    maxLat: 28.70,
    minLon: -80.80,
    maxLon: -80.45
};

const PAD_COORDINATES = {
    87: { x: 50, y: 35 }, // LC-39A
    16: { x: 55, y: 40 }, // SLC-40 (CCSFS)
    29: { x: 42, y: 28 }, // SLC-41 (ULA)
    14: { x: 48, y: 45 }, // SLC-37B
};
const DEFAULT_COORD = { x: 48, y: 32 };

// --- UTILS ---
const latLonToXY = (lat, lon) => {
    const latRange = GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat;
    const lonRange = GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon;
    const latPercent = (lat - GEO_BOUNDS.minLat) / latRange;
    const lonPercent = (lon - GEO_BOUNDS.minLon) / lonRange;

    // Convert to CSS %
    return {
        x: lonPercent * 100,
        y: (1 - latPercent) * 100
    };
};

// --- HOOKS ---
const useTrafficData = (isPlaying) => {
    const [trafficMarkers, setTrafficMarkers] = useState([]);
    const [isLiveADSB, setIsLiveADSB] = useState(false);
    
    // Fallback Simulation Data refs
    const simPlanesRef = useRef([]);
    const simShipsRef = useRef([]);

    // Initialize Simulation Objects once
    useEffect(() => {
        simPlanesRef.current = Array.from({ length: 3 }).map((_, i) => ({
            id: `sim-plane-${i}`,
            lat: GEO_BOUNDS.minLat + Math.random() * (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat),
            lon: GEO_BOUNDS.minLon + Math.random() * (GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon),
            heading: Math.random() * 360,
            speed: 0.002,
            type: 'plane'
        }));

        simShipsRef.current = Array.from({ length: 5 }).map((_, i) => ({
            id: `sim-ship-${i}`,
            lat: GEO_BOUNDS.minLat + Math.random() * (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat) * 0.5,
            lon: GEO_BOUNDS.maxLon - Math.random() * 0.1,
            heading: Math.random() * 360,
            speed: 0.0005,
            type: 'ship'
        }));
    }, []);

    const fetchOpenSky = useCallback(async () => {
        try {
            const response = await fetch(
                `https://opensky-network.org/api/states/all?lamin=${GEO_BOUNDS.minLat}&lomin=${GEO_BOUNDS.minLon}&lamax=${GEO_BOUNDS.maxLat}&lomax=${GEO_BOUNDS.maxLon}`
            );
            
            if (!response.ok) throw new Error("API Limit or Error");

            const data = await response.json();
            const states = data.states || [];

            const markers = states.map((state) => {
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
        const updateEntity = (entity) => {
            const rad = (entity.heading - 90) * (Math.PI / 180);
            entity.lon += Math.cos(rad) * entity.speed;
            entity.lat -= Math.sin(rad) * entity.speed;

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
        let intervalId;

        const loop = async () => {
            // Use simulaton primarily for smoothness, try API in background
            const simMarkers = updateSimulation();
            const simShips = simMarkers.filter(m => m.type === 'ship');
            const simPlanes = simMarkers.filter(m => m.type === 'plane');

            // Optionally merge real data if available (skipping to keep demo smooth)
            setTrafficMarkers([...simShips, ...simPlanes]);
            setIsLiveADSB(false); 
        };

        loop();

        if (isPlaying) {
            intervalId = setInterval(loop, 100); // 100ms for smooth animation
        }

        return () => clearInterval(intervalId);
    }, [isPlaying, fetchOpenSky, updateSimulation]);

    return { trafficMarkers, isLiveADSB };
};

// --- COMPONENTS ---

const FilterChip = ({ 
    label, icon, active, onClick, 
    activeColor = "bg-primary", 
    activeTextColor = "text-background-dark",
    iconColor = "text-white"
}) => {
    return (
        <button 
            onClick={onClick}
            className={`
                group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-3 pr-4 transition-all active:scale-95
                ${active 
                    ? `${activeColor} shadow-lg shadow-primary/20` 
                    : 'bg-surface-dark/90 backdrop-blur-md border border-surface-dark-lighter hover:bg-surface-dark-lighter'
                }
            `}
        >
            <span className={`material-symbols-outlined text-[20px] ${active ? activeTextColor : iconColor}`}>
                {icon}
            </span>
            <p className={`text-sm font-medium leading-normal ${active ? activeTextColor : 'text-white'}`}>
                {label}
            </p>
        </button>
    );
};

const TopBar = ({ 
    activeFilter, 
    onFilterChange, 
    searchQuery, 
    onSearchChange 
}) => {
    return (
        <div className="pt-12 px-4 pb-2 bg-gradient-to-b from-background-dark/90 via-background-dark/60 to-transparent pointer-events-auto">
            <label className="flex flex-col w-full h-12 mb-4 shadow-lg shadow-black/20 group">
                <div className="flex w-full flex-1 items-stretch rounded-full h-full backdrop-blur-md bg-surface-dark/80 border border-surface-dark-lighter group-focus-within:border-primary/50 transition-colors">
                    <div className="text-text-secondary flex border-none items-center justify-center pl-4 rounded-l-full border-r-0">
                        <span className="material-symbols-outlined text-[24px]">search</span>
                    </div>
                    <input 
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-white focus:outline-0 focus:ring-0 border-none bg-transparent focus:border-none h-full placeholder:text-text-secondary/70 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" 
                        placeholder="Search flights, ships, or launch pads..." 
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <div className="flex items-center justify-center pr-2">
                        <button className="size-8 rounded-full bg-surface-dark-lighter flex items-center justify-center text-white hover:bg-surface-dark-lighter/80 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">tune</span>
                        </button>
                    </div>
                </div>
            </label>

            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                <FilterChip 
                    label="Space" 
                    icon="rocket_launch" 
                    active={activeFilter === 'Space'} 
                    onClick={() => onFilterChange('Space')}
                    activeColor="bg-primary"
                    activeTextColor="text-background-dark"
                />
                <FilterChip 
                    label="Air" 
                    icon="flight" 
                    active={activeFilter === 'Air'} 
                    onClick={() => onFilterChange('Air')}
                    iconColor="text-sky-400"
                />
                <FilterChip 
                    label="Sea" 
                    icon="directions_boat" 
                    active={activeFilter === 'Sea'} 
                    onClick={() => onFilterChange('Sea')}
                    iconColor="text-orange-400"
                />
                <FilterChip 
                    label="Traffic" 
                    icon="traffic" 
                    active={activeFilter === 'Traffic'} 
                    onClick={() => onFilterChange('Traffic')}
                    iconColor="text-amber-400"
                />
            </div>
        </div>
    );
};

const MapControls = ({ onZoomIn, onZoomOut }) => {
    return (
        <div className="flex flex-col items-end gap-3 pb-24 md:pb-0">
            <div className="flex flex-col gap-1 bg-surface-dark/80 backdrop-blur-md rounded-full p-1 border border-surface-dark-lighter shadow-lg">
                <button 
                    onClick={onZoomIn}
                    className="flex size-10 items-center justify-center rounded-full text-white hover:bg-surface-dark-lighter active:bg-surface-dark-lighter/80 transition-colors"
                >
                    <span className="material-symbols-outlined text-[24px]">add</span>
                </button>
                <div className="h-px w-6 bg-surface-dark-lighter mx-auto"></div>
                <button 
                    onClick={onZoomOut}
                    className="flex size-10 items-center justify-center rounded-full text-white hover:bg-surface-dark-lighter active:bg-surface-dark-lighter/80 transition-colors"
                >
                    <span className="material-symbols-outlined text-[24px]">remove</span>
                </button>
            </div>
            
            <button className="flex size-12 items-center justify-center rounded-full bg-surface-dark/80 backdrop-blur-md border border-surface-dark-lighter text-primary shadow-lg hover:bg-surface-dark-lighter active:scale-95 transition-all group">
                <span className="material-symbols-outlined text-[24px] group-hover:text-white transition-colors filled">my_location</span>
            </button>
        </div>
    );
};

const Timeline = ({ isPlaying, setIsPlaying }) => {
    const [progress, setProgress] = useState(50);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            if (isPlaying) {
                setProgress(p => (p + 0.1) % 100);
            }
        }, 100);
        return () => clearInterval(timer);
    }, [isPlaying]);

    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const formattedDate = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div className="w-full rounded-2xl bg-surface-dark/95 border border-surface-dark-lighter backdrop-blur-xl shadow-2xl mb-4 p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-primary text-[20px] filled">schedule</span>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Timeline</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white font-mono tracking-tight leading-none">{formattedTime}</span>
                        <span className="text-sm font-medium text-text-secondary">{formattedDate}</span>
                    </div>
                </div>
                <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors group">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-red-400 transition-colors">Live Data</span>
                </button>
            </div>

            <div className="flex flex-col gap-2 relative group/slider">
                <div className="relative h-8 flex items-center select-none cursor-pointer">
                    <div className="absolute w-full h-1.5 bg-surface-dark-lighter rounded-full overflow-hidden">
                        <div 
                            className="absolute left-0 h-full bg-gradient-to-r from-primary/20 to-primary transition-[width] duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                        ></div>
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)]"></div>
                    </div>

                    <div className="absolute left-[35%] top-1/2 -translate-y-1/2 w-1 h-3 bg-sky-400 rounded-full opacity-70 hover:h-4 hover:scale-125 transition-all" title="Weather Update"></div>
                    <div className="absolute left-[80%] top-1/2 -translate-y-1/2 w-1 h-3 bg-orange-400 rounded-full opacity-70 hover:h-4 hover:scale-125 transition-all" title="Launch Window"></div>

                    <div 
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing transition-[left] duration-75 ease-linear"
                        style={{ left: `${progress}%` }}
                    >
                        <div className="size-6 bg-white rounded-full shadow-[0_0_0_4px_rgba(48,232,122,0.3)] border-[3px] border-primary transition-transform group-hover/slider:scale-110"></div>
                    </div>

                    <div className="absolute -bottom-5 w-full flex justify-between text-[10px] font-medium text-text-secondary/50 font-mono">
                        <span>-2h</span>
                        <span>-1h</span>
                        <span className="text-primary font-bold">Now</span>
                        <span>+1h</span>
                        <span>+2h</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2">
                <div className="flex items-center gap-2">
                    <button className="text-[10px] font-bold text-surface-dark bg-text-secondary/80 px-2 py-1 rounded hover:bg-white transition-colors">1x</button>
                </div>
                <div className="flex items-center gap-6">
                    <button className="text-text-secondary hover:text-white transition-colors p-2 hover:bg-surface-dark-lighter rounded-full">
                        <span className="material-symbols-outlined text-[28px]">replay_10</span>
                    </button>
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center justify-center size-12 rounded-full bg-primary text-surface-dark shadow-[0_0_20px_rgba(48,232,122,0.4)] hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[32px] filled">
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    </button>
                    <button className="text-text-secondary hover:text-white transition-colors p-2 hover:bg-surface-dark-lighter rounded-full">
                        <span className="material-symbols-outlined text-[28px]">forward_10</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="text-text-secondary hover:text-white transition-colors p-1.5 hover:bg-surface-dark-lighter rounded-full">
                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const LaunchCard = ({ data }) => {
    const [countdown, setCountdown] = useState('Loading...');

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const launchTime = new Date(data.net).getTime();
            const distance = launchTime - now;

            if (distance < 0) {
                setCountdown("T-00:00:00");
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const pad = (n) => n.toString().padStart(2, '0');
            
            if (days > 0) {
                setCountdown(`T-${pad(days)}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
            } else {
                setCountdown(`T-${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [data.net]);

    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-surface-dark border border-surface-dark-lighter shadow-xl shadow-black/40">
            <div 
                className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none" 
                style={{ background: 'radial-gradient(circle at center right, #30e87a 0%, transparent 70%)' }}
            ></div>

            <div className="relative p-5 flex flex-col gap-5">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className={`flex h-2 w-2 rounded-full ${data.statusLabel.includes('Go') ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                            <span className={`text-xs font-bold uppercase tracking-wider ${data.statusLabel.includes('Go') ? 'text-green-500' : 'text-yellow-500'}`}>
                                {data.statusLabel || 'Scheduled'}
                            </span>
                        </div>
                        <h3 className="text-white text-2xl font-bold leading-tight font-display">{data.title}</h3>
                        <p className="text-text-secondary text-sm font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            {data.location}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="bg-surface-dark-lighter/50 border border-primary/30 rounded-lg px-3 py-1.5 backdrop-blur-sm shadow-[0_0_15px_rgba(48,232,122,0.1)]">
                            <span className="text-primary font-mono text-xl font-bold tracking-tight">{countdown}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                     <div className="bg-surface-dark-lighter/40 rounded-xl p-3 border border-surface-dark-lighter flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                            Rocket
                        </div>
                        <span className="text-white font-semibold text-sm truncate" title={data.rocket}>{data.rocket}</span>
                     </div>
                     <div className="bg-surface-dark-lighter/40 rounded-xl p-3 border border-surface-dark-lighter flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                            Payload
                        </div>
                        <span className="text-white font-semibold text-sm truncate" title={data.payload}>{data.payload}</span>
                     </div>
                     <div className="bg-surface-dark-lighter/40 rounded-xl p-3 border border-surface-dark-lighter flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[16px]">public</span>
                            Orbit
                        </div>
                        <span className="text-white font-semibold text-sm truncate" title={data.orbit}>{data.orbit}</span>
                     </div>
                </div>

                <div className="bg-surface-dark-lighter/20 rounded-xl p-3 border border-surface-dark-lighter/50">
                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                        {data.description || "No mission description available."}
                    </p>
                </div>

                <div className="h-px w-full bg-surface-dark-lighter/50"></div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="flex -space-x-2">
                            <div 
                                className="h-8 w-8 rounded-full border-2 border-surface-dark bg-gray-600 bg-cover" 
                                style={{ backgroundImage: `url("${AVATAR_1}")` }}
                                title="Viewer 1"
                            ></div>
                            <div 
                                className="h-8 w-8 rounded-full border-2 border-surface-dark bg-gray-600 bg-cover" 
                                style={{ backgroundImage: `url("${AVATAR_2}")` }}
                                title="Viewer 2"
                            ></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-dark bg-surface-dark-lighter text-[10px] font-bold text-white">
                                +2k
                            </div>
                        </div>
                        <span className="text-xs text-text-secondary font-medium">Watching now</span>
                    </div>

                    <button className="flex-1 max-w-[160px] bg-primary hover:bg-primary/90 text-background-dark h-10 px-4 rounded-full flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-[0_0_15px_rgba(48,232,122,0.3)] hover:shadow-[0_0_20px_rgba(48,232,122,0.5)] active:scale-95">
                        <span className="material-symbols-outlined text-[20px] filled">play_circle</span>
                        Watch Live
                    </button>
                </div>
            </div>
        </div>
    );
};

const MapMarker = ({ data, onClick }) => {
    const isRocket = data.type === 'rocket';
    
    return (
        <div 
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto transition-[left,top] duration-[2000ms] ease-linear`}
            style={{ left: `${data.x}%`, top: `${data.y}%` }}
            onClick={(e) => {
                e.stopPropagation(); 
                onClick?.();
            }}
            onMouseDown={(e) => e.stopPropagation()} 
        >
            {isRocket ? (
                <div className="relative flex items-center justify-center size-12">
                    <div className="animate-pulse-ring absolute inset-0 rounded-full bg-primary/60"></div>
                    <div className="relative bg-surface-dark border-2 border-primary rounded-full p-2 shadow-lg shadow-primary/20 z-10 transition-transform group-hover:scale-110 active:scale-95">
                        <span className="material-symbols-outlined text-primary text-[24px]">rocket_launch</span>
                    </div>
                    {data.label && (
                        <div className="absolute bottom-full mb-2 bg-surface-dark px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-surface-dark-lighter shadow-xl z-20">
                            {data.label}
                        </div>
                    )}
                </div>
            ) : (
                <div className="hover:scale-110 transition-transform active:scale-95 group">
                     <div 
                        className={`bg-surface-dark/90 p-1.5 rounded-full border shadow-sm transition-transform duration-300 ${
                            data.type === 'plane' ? 'border-sky-500/50' : 'border-orange-500/50'
                        }`}
                        style={{ transform: `rotate(${data.rotation || 0}deg)`}}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${
                            data.type === 'plane' ? 'text-sky-400' : 'text-orange-400'
                        }`}>
                            {data.type === 'plane' ? 'flight' : 'sailing'}
                        </span>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-surface-dark/90 backdrop-blur px-2 py-0.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-surface-dark-lighter">
                        {data.label}
                    </div>
                </div>
            )}
        </div>
    );
};

const MapView = ({ 
    zoom, 
    activeFilter, 
    searchQuery, 
    onMarkerClick,
    rocketMarkers = [],
    trafficMarkers = []
}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const allMarkers = useMemo(() => {
        return [...rocketMarkers, ...trafficMarkers];
    }, [rocketMarkers, trafficMarkers]);

    const visibleMarkers = useMemo(() => {
        return allMarkers.filter(m => {
            const matchesCategory = 
                activeFilter === 'Traffic' || 
                (activeFilter === 'Space' && m.type === 'rocket') ||
                (activeFilter === 'Air' && m.type === 'plane') ||
                (activeFilter === 'Sea' && m.type === 'ship');
            
            const matchesSearch = 
                searchQuery === '' || 
                (m.label && m.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
                m.type.includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [allMarkers, activeFilter, searchQuery]);

    return (
        <div 
            className="w-full h-full bg-background-dark overflow-hidden cursor-move active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            ref={containerRef}
        >
            <div 
                className="w-full h-full relative transition-transform duration-300 ease-out origin-center"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`
                }}
            >
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: `url("${MAP_IMAGE_URL}")` }}
                />

                <div className="absolute inset-0 pointer-events-none">
                    {visibleMarkers.map((marker) => (
                        <MapMarker 
                            key={marker.id} 
                            data={marker} 
                            onClick={() => onMarkerClick?.(marker.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- APP COMPONENT ---
const App = () => {
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Space');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [launchData, setLaunchData] = useState({});
  const [rocketMarkers, setRocketMarkers] = useState([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const { trafficMarkers, isLiveADSB } = useTrafficData(isPlaying);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));
  
  const handleMarkerClick = (id) => {
    if (launchData[id]) {
        setSelectedMarkerId(id);
    }
  };

  useEffect(() => {
    const fetchLaunches = async () => {
        try {
            const response = await fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=5&location__ids=12,27&mode=detailed');
            const data = await response.json();
            
            const newLaunchData = {};
            const newMarkers = [];

            if (data.results) {
                data.results.forEach((launch) => {
                    const padId = launch.pad?.id;
                    const coords = PAD_COORDINATES[padId] || DEFAULT_COORD;
                    const jitterX = (Math.random() - 0.5) * 2;
                    const jitterY = (Math.random() - 0.5) * 2;
                    
                    const markerId = `launch-${launch.id}`;
                    
                    newMarkers.push({
                        id: markerId,
                        type: 'rocket',
                        x: coords.x + jitterX,
                        y: coords.y + jitterY,
                        label: launch.pad?.name?.split(',')[0] || 'Pad',
                        status: 'active'
                    });

                    newLaunchData[markerId] = {
                        markerId: markerId,
                        title: launch.name,
                        location: launch.pad?.name,
                        net: launch.net,
                        statusLabel: launch.status?.abbrev || 'Scheduled',
                        rocket: launch.rocket?.configuration?.name || 'Unknown Rocket',
                        payload: launch.mission?.name || 'Payload',
                        orbit: launch.mission?.orbit?.name || 'Orbit',
                        description: launch.mission?.description || 'No description available.',
                        padId: padId
                    };
                });

                setLaunchData(newLaunchData);
                setRocketMarkers(newMarkers);
                
                if (newMarkers.length > 0 && !selectedMarkerId) {
                    setSelectedMarkerId(newMarkers[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch launches:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchLaunches();
  }, []);

  const currentLaunchData = selectedMarkerId ? launchData[selectedMarkerId] : null;

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-background-dark">
      <div className="absolute inset-0 z-0">
        <MapView 
          zoom={zoom} 
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          isPlaying={isPlaying}
          onMarkerClick={handleMarkerClick}
          rocketMarkers={rocketMarkers}
          trafficMarkers={trafficMarkers}
        />
      </div>

      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(17,33,23,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(17,33,23,0.3)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        
        <TopBar 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="flex-1 w-full flex justify-between items-end px-4 pb-4">
          
          <div className="flex flex-col gap-2 pointer-events-auto">
             {loading && (
                 <div className="bg-surface-dark/80 backdrop-blur border border-surface-dark-lighter px-4 py-2 rounded-lg text-text-secondary text-sm flex items-center gap-2">
                     <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                     Syncing Launch Data...
                 </div>
             )}
             <div className="flex gap-2">
                <div className={`bg-surface-dark/80 backdrop-blur border px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${isLiveADSB ? 'border-sky-500/50 text-sky-400' : 'border-surface-dark-lighter text-text-secondary'}`}>
                     <span className={`size-1.5 rounded-full ${isLiveADSB ? 'bg-sky-400 animate-pulse' : 'bg-gray-500'}`}></span>
                     ADS-B: {isLiveADSB ? 'LIVE' : 'SIM'}
                </div>
                <div className="bg-surface-dark/80 backdrop-blur border border-orange-500/30 px-3 py-1.5 rounded-full text-orange-400 text-xs font-bold flex items-center gap-2">
                     <span className="size-1.5 rounded-full bg-orange-400"></span>
                     AIS: SIM
                </div>
             </div>
          </div>

          <div className="pointer-events-auto">
            <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
          </div>
        </div>

        {/* Floating Expand Button (Visible when docked) */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-300 ${isPanelOpen ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}>
            <button
                onClick={() => setIsPanelOpen(true)}
                className="flex items-center gap-2 bg-primary text-surface-dark font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(48,232,122,0.4)] hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined text-[20px] filled">radar</span>
                Mission Control
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
            </button>
        </div>

        {/* Collapsible Panel */}
        <div 
            className={`pointer-events-auto w-full px-4 pb-6 pt-2 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent transition-transform duration-500 ease-in-out ${isPanelOpen ? 'translate-y-0' : 'translate-y-full absolute bottom-0'}`}
        >
          {/* Collapse Button */}
          <div className="flex justify-center -mt-6 mb-2">
              <button
                  onClick={() => setIsPanelOpen(false)}
                  className="bg-surface-dark/80 backdrop-blur border border-surface-dark-lighter text-text-secondary hover:text-white rounded-full p-1 shadow-lg hover:bg-surface-dark-lighter transition-all"
              >
                  <span className="material-symbols-outlined text-[24px]">keyboard_arrow_down</span>
              </button>
          </div>
          
          <Timeline isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
          {currentLaunchData && <LaunchCard data={currentLaunchData} />}
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);