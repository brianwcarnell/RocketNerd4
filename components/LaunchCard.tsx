import React, { useState, useEffect } from 'react';
import { AVATAR_1, AVATAR_2 } from '../constants.ts';
import { MissionDetails } from '../types.ts';

interface LaunchCardProps {
    data: MissionDetails;
}

const LaunchCard: React.FC<LaunchCardProps> = ({ data }) => {
    const [countdown, setCountdown] = useState<string>('Loading...');

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

            const pad = (n: number) => n.toString().padStart(2, '0');
            
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
            {/* Background Gradient Decoration */}
            <div 
                className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none" 
                style={{ background: 'radial-gradient(circle at center right, #30e87a 0%, transparent 70%)' }}
            ></div>

            <div className="relative p-5 flex flex-col gap-5">
                {/* Header Info */}
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
                    {/* Timer Box */}
                    <div className="flex flex-col items-end">
                        <div className="bg-surface-dark-lighter/50 border border-primary/30 rounded-lg px-3 py-1.5 backdrop-blur-sm shadow-[0_0_15px_rgba(48,232,122,0.1)]">
                            <span className="text-primary font-mono text-xl font-bold tracking-tight">{countdown}</span>
                        </div>
                    </div>
                </div>

                {/* Mission Stats Grid */}
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

                {/* Mission Description */}
                <div className="bg-surface-dark-lighter/20 rounded-xl p-3 border border-surface-dark-lighter/50">
                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                        {data.description || "No mission description available."}
                    </p>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-surface-dark-lighter/50"></div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between gap-4">
                    {/* Viewers Pile */}
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

                    {/* Action Button */}
                    <button className="flex-1 max-w-[160px] bg-primary hover:bg-primary/90 text-background-dark h-10 px-4 rounded-full flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-[0_0_15px_rgba(48,232,122,0.3)] hover:shadow-[0_0_20px_rgba(48,232,122,0.5)] active:scale-95">
                        <span className="material-symbols-outlined text-[20px] filled">play_circle</span>
                        Watch Live
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LaunchCard;