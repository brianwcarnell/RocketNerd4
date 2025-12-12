import React, { useState, useEffect } from 'react';
import MapView from './components/MapView.tsx';
import TopBar from './components/TopBar.tsx';
import MapControls from './components/MapControls.tsx';
import Timeline from './components/Timeline.tsx';
import LaunchCard from './components/LaunchCard.tsx';
import { MissionDetails, MarkerData } from './types.ts';
import { useTrafficData } from './hooks/useTrafficData.ts';

// Approximate visual mapping of Pad IDs to X/Y percentages on the background image
// KSC and CCSFS roughly map to the center-right cluster on this specific graphic
const PAD_COORDINATES: Record<number, {x: number, y: number}> = {
    87: { x: 50, y: 35 }, // LC-39A
    16: { x: 55, y: 40 }, // SLC-40 (CCSFS)
    29: { x: 42, y: 28 }, // SLC-41 (ULA)
    14: { x: 48, y: 45 }, // SLC-37B
};

const DEFAULT_COORD = { x: 48, y: 32 };

const App: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true); // Default to playing for live data
  const [activeFilter, setActiveFilter] = useState('Space');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [launchData, setLaunchData] = useState<Record<string, MissionDetails>>({});
  const [rocketMarkers, setRocketMarkers] = useState<MarkerData[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hook for live traffic (Air/Sea)
  const { trafficMarkers, isLiveADSB } = useTrafficData(isPlaying);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));
  
  const handleMarkerClick = (id: string) => {
    if (launchData[id]) {
        setSelectedMarkerId(id);
    }
  };

  useEffect(() => {
    const fetchLaunches = async () => {
        try {
            // Using lldev endpoint to avoid rate limits during dev
            // Location IDs 12 (KSC) and 27 (CCSFS)
            const response = await fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=5&location__ids=12,27&mode=detailed');
            const data = await response.json();
            
            const newLaunchData: Record<string, MissionDetails> = {};
            const newMarkers: MarkerData[] = [];

            if (data.results) {
                data.results.forEach((launch: any) => {
                    const padId = launch.pad?.id;
                    const coords = PAD_COORDINATES[padId] || DEFAULT_COORD;
                    // Jitter coordinates slightly if multiple share same pad or default, to see them
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
                
                // Select the first one by default if nothing selected
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
  }, []); // Run once on mount

  const currentLaunchData = selectedMarkerId ? launchData[selectedMarkerId] : null;

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-background-dark">
      {/* Background Map Layer */}
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

      {/* Grid Overlay Effect */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(17,33,23,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(17,33,23,0.3)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Foreground UI Layer */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        
        {/* Top Section: Search and Filters */}
        <TopBar 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Middle Section: Flexible Spacer + Controls */}
        <div className="flex-1 w-full flex justify-between items-end px-4 pb-4">
          
          {/* Left Side: Status Indicators */}
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

          {/* Right Side: Map Controls */}
          <div className="pointer-events-auto">
            <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
          </div>
        </div>

        {/* Bottom Section: Timeline and Launch Card */}
        <div className="pointer-events-auto w-full px-4 pb-6 pt-2 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent">
          <Timeline isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
          {currentLaunchData && <LaunchCard data={currentLaunchData} />}
        </div>
      </div>
    </div>
  );
};

export default App;