import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { REGIONS, Province } from '../data/regions';

interface RegionPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: string) => void;
    currentLocation?: string;
}

export const RegionPicker: React.FC<RegionPickerProps> = ({ isOpen, onClose, onSelect, currentLocation }) => {
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);

    // Initialize state from current location or default
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (currentLocation) {
                // Try to loosely match "Province City" or just "Province"
                // This is simple string splitting, ideally store codes.
                const parts = currentLocation.split(' ');
                const provName = parts[0];
                const cityName = parts[1] || '';

                const prov = REGIONS.find(p => p.name === provName) || REGIONS[0];
                if (prov) {
                    setSelectedProvince(prov);
                    // Check if city exists in this province
                    if (cityName && prov.cities.find(c => c.name === cityName)) {
                        setSelectedCity(cityName);
                    } else {
                        setSelectedCity('');
                    }
                }
            } else {
                // Default to first if nothing selected
                if (!selectedProvince) {
                    setSelectedProvince(REGIONS[0]);
                }
            }
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, currentLocation]);

    const handleConfirm = () => {
        if (selectedProvince) {
            const city = selectedCity || selectedProvince.cities[0]?.name || '';
            onSelect(`${selectedProvince.name} ${city}`);
            onClose();
        }
    };

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Sheet */}
            <div className={`bg-white w-full rounded-t-2xl flex flex-col max-h-[80vh] transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} relative z-10 safe-area-bottom shadow-xl`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                    <button onClick={onClose} className="text-gray-500 p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <h2 className="text-gray-800 font-medium text-lg">选择地区</h2>
                    <button
                        onClick={handleConfirm}
                        className={`text-primary-600 font-medium px-4 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors ${!selectedProvince ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedProvince}
                    >
                        确定
                    </button>
                </div>

                {/* Content - Two Columns */}
                <div className="flex h-[400px]">
                    {/* Province List */}
                    <div className="flex-[0.8] overflow-y-auto border-r border-gray-100 bg-gray-50 scrollbar-hide">
                        {REGIONS.map((prov) => (
                            <button
                                key={prov.name}
                                onClick={() => {
                                    setSelectedProvince(prov);
                                    setSelectedCity(''); // Reset city when province changes
                                }}
                                className={`w-full text-left px-4 py-4 text-sm transition-all duration-200 relative ${selectedProvince?.name === prov.name
                                        ? 'bg-white text-primary-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {selectedProvince?.name === prov.name && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-md" />
                                )}
                                <span className="ml-2">{prov.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* City List */}
                    <div className="flex-[1.2] overflow-y-auto bg-white scrollbar-hide">
                        {selectedProvince ? (
                            selectedProvince.cities.map((city) => (
                                <button
                                    key={city.name}
                                    onClick={() => setSelectedCity(city.name)}
                                    className={`w-full flex items-center justify-between px-6 py-4 text-sm transition-colors group ${selectedCity === city.name
                                            ? 'text-primary-600 font-medium bg-primary-50/30'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{city.name}</span>
                                    {selectedCity === city.name && <Check size={18} className="text-primary-500" />}
                                </button>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                请先选择省份
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
