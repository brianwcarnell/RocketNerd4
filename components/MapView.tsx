import React, { useRef, useState, useMemo } from 'react';
import { MAP_IMAGE_URL } from '../constants.ts';
import { MarkerData } from '../types.ts';

interface MapViewProps {
    zoom: number;
    activeFilter: string;
    searchQuery: string;
    isPlaying: boolean;
    onMarkerClick?: (id: string) => void;
    rocketMarkers?: MarkerData[];
    trafficMarkers?: MarkerData[]; // New prop for traffic
}

const MapView: React.FC<MapViewProps> = ({ 
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
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Merge API rockets with live traffic for display
    const allMarkers = useMemo(() => {
        return [...rocketMarkers, ...trafficMarkers];
    }, [rocketMarkers, trafficMarkers]);

    // Filter Logic
    const visibleMarkers = useMemo(() => {
        return allMarkers.filter(m => {
            // 1. Filter by Category
            const matchesCategory = 
                activeFilter === 'Traffic' || 
                (activeFilter === 'Space' && m.type === 'rocket') ||
                (activeFilter === 'Air' && m.type === 'plane') ||
                (activeFilter === 'Sea' && m.type === 'ship');
            
            // 2. Filter by Search
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
                {/* Map Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: `url("${MAP_IMAGE_URL}")` }}
                />

                {/* Markers Layer */}
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

interface MapMarkerProps {
    data: MarkerData;
    onClick?: () => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({ data, onClick }) => {
    const isRocket = data.type === 'rocket';
    
    return (
        <div 
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto transition-[left,top] duration-[2000ms] ease-linear`}
            style={{ left: `${data.x}%`, top: `${data.y}%` }}
            onClick={(e) => {
                e.stopPropagation(); // Prevent map drag start
                onClick?.();
            }}
            onMouseDown={(e) => e.stopPropagation()} 
        >
            {isRocket ? (
                // Active Rocket Marker
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
                // Standard Marker (Traffic)
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
                    {/* Tooltip for Traffic */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-surface-dark/90 backdrop-blur px-2 py-0.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-surface-dark-lighter">
                        {data.label}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapView;