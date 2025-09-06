import React, { useState } from 'react';
import { MapPin, Star, Clock, DollarSign, ExternalLink } from 'lucide-react';
import CallToActionButton from './CallToActionButton';

const LocationCard = ({ vendor, variant = "withImage", menuItems = [] }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const isInfoOnly = variant === "infoOnly";
  const averagePrice = menuItems.length > 0 
    ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length 
    : 15;

  const getDollarSigns = (price) => {
    if (price < 10) return "$";
    if (price < 20) return "$$";
    return "$$$";
  };

  return (
    <div className="food-card glass-card rounded-xl overflow-hidden">
      {!isInfoOnly && (
        <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">4.5</span>
            </div>
            <h3 className="font-bold text-lg">{vendor.name}</h3>
          </div>
        </div>
      )}
      
      <div className="p-4">
        {isInfoOnly && (
          <h3 className="font-bold text-lg text-white mb-2">{vendor.name}</h3>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>0.3 mi</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>15-25 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>{getDollarSigns(averagePrice)}</span>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-3">{vendor.cuisineType}</p>

        {/* Featured Menu Items */}
        {menuItems.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Popular Items</span>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {showMenu ? 'Hide' : 'View All'}
              </button>
            </div>
            
            {showMenu ? (
              <div className="space-y-2">
                {menuItems.slice(0, 3).map(item => (
                  <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                    <span className="text-white">{item.name}</span>
                    <span className="text-gray-400">${item.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                {menuItems.slice(0, 2).map(item => item.name).join(', ')}
                {menuItems.length > 2 && '...'}
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <CallToActionButton
            variant="primary"
            className="flex-1 flex items-center justify-center space-x-1 text-sm py-2"
            onClick={() => window.open(vendor.orderLink || '#', '_blank')}
          >
            <span>Order Now</span>
            <ExternalLink className="w-3 h-3" />
          </CallToActionButton>
          <CallToActionButton
            variant="outline"
            className="px-4 py-2 text-sm"
            onClick={() => alert(`Viewing details for ${vendor.name}`)}
          >
            Details
          </CallToActionButton>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;