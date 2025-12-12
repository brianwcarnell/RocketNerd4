import React, { useState, useEffect } from 'react';

interface TimelineProps {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
}

const Timeline: React.FC<TimelineProps> = ({ isPlaying, setIsPlaying }) => {
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
            
            {/* Header: Time & Status */}
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

            {/* Slider / Scrubber */}
            <div className="flex flex-col gap-2 relative group/slider">
                <div className="relative h-8 flex items-center select-none cursor-pointer">
                    {/* Track Background */}
                    <div className="absolute w-full h-1.5 bg-surface-dark-lighter rounded-full overflow-hidden">
                        {/* Played Portion */}
                        <div 
                            className="absolute left-0 h-full bg-gradient-to-r from-primary/20 to-primary transition-[width] duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                        ></div>
                        {/* Ticks Pattern */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)]"></div>
                    </div>

                    {/* Events Markers */}
                    <div className="absolute left-[35%] top-1/2 -translate-y-1/2 w-1 h-3 bg-sky-400 rounded-full opacity-70 hover:h-4 hover:scale-125 transition-all" title="Weather Update"></div>
                    <div className="absolute left-[80%] top-1/2 -translate-y-1/2 w-1 h-3 bg-orange-400 rounded-full opacity-70 hover:h-4 hover:scale-125 transition-all" title="Launch Window"></div>

                    {/* Thumb */}
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing transition-[left] duration-75 ease-linear"
                        style={{ left: `${progress}%` }}
                    >
                        <div className="size-6 bg-white rounded-full shadow-[0_0_0_4px_rgba(48,232,122,0.3)] border-[3px] border-primary transition-transform group-hover/slider:scale-110"></div>
                    </div>

                    {/* Labels */}
                    <div className="absolute -bottom-5 w-full flex justify-between text-[10px] font-medium text-text-secondary/50 font-mono">
                        <span>-2h</span>
                        <span>-1h</span>
                        <span className="text-primary font-bold">Now</span>
                        <span>+1h</span>
                        <span>+2h</span>
                    </div>
                </div>
            </div>

            {/* Playback Controls */}
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

export default Timeline;