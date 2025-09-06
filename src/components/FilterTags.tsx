import React from 'react';

const FilterTags = ({ onFilterChange, selectedFilters = [], variant = "selectable" }) => {
  const filters = [
    { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
    { id: 'vegan', label: 'Vegan', emoji: '🌱' },
    { id: 'gluten-free', label: 'Gluten Free', emoji: '🌾' },
    { id: 'italian', label: 'Italian', emoji: '🍝' },
    { id: 'asian', label: 'Asian', emoji: '🍜' },
    { id: 'mexican', label: 'Mexican', emoji: '🌮' },
    { id: 'american', label: 'American', emoji: '🍔' },
    { id: 'budget', label: 'Budget ($)', emoji: '💰' },
    { id: 'premium', label: 'Fine Dining', emoji: '🍷' },
  ];

  const isSelectable = variant === "selectable";

  const handleFilterToggle = (filterId) => {
    if (!isSelectable) return;
    
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(f => f !== filterId)
      : [...selectedFilters, filterId];
    
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => {
        const isSelected = selectedFilters.includes(filter.id);
        
        return (
          <button
            key={filter.id}
            onClick={() => handleFilterToggle(filter.id)}
            className={`
              px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${isSelectable ? 'cursor-pointer' : 'cursor-default'}
              ${isSelected 
                ? 'bg-white/20 text-white border border-white/30' 
                : 'bg-white/10 text-gray-300 border border-white/10 hover:bg-white/15'
              }
              ${isSelectable && 'hover:scale-105'}
            `}
            disabled={!isSelectable}
          >
            <span className="mr-1">{filter.emoji}</span>
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTags;