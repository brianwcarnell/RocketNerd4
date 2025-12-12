import React from 'react';

interface TopBarProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
    activeFilter, 
    onFilterChange, 
    searchQuery, 
    onSearchChange 
}) => {
    return (
        <div className="pt-12 px-4 pb-2 bg-gradient-to-b from-background-dark/90 via-background-dark/60 to-transparent pointer-events-auto">
            {/* Search Input */}
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

            {/* Filter Chips */}
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

interface FilterChipProps {
    label: string;
    icon: string;
    active: boolean;
    onClick: () => void;
    activeColor?: string;
    activeTextColor?: string;
    iconColor?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({ 
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

export default TopBar;