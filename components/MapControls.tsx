import React from 'react';

interface MapControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onZoomIn, onZoomOut }) => {
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

export default MapControls;