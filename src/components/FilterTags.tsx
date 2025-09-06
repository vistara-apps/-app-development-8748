import React from 'react';

interface FilterTagsProps {
  onFilterChange: (filters: string[]) => void;
  selectedFilters?: string[];
  variant?: "selectable" | "display";
  availableOptions?: string[];
}

const FilterTags: React.FC<FilterTagsProps> = ({ 
  onFilterChange, 
  selectedFilters = [], 
  variant = "selectable",
  availableOptions = []
}) => {
  // Default filter options with emojis
  const defaultFilters = [
    { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
    { id: 'vegan', label: 'Vegan', emoji: '🌱' },
    { id: 'gluten-free', label: 'Gluten Free', emoji: '🌾' },
    { id: 'dairy-free', label: 'Dairy Free', emoji: '🥛' },
    { id: 'keto', label: 'Keto', emoji: '🥑' },
    { id: 'paleo', label: 'Paleo', emoji: '🥩' },
    { id: 'italian', label: 'Italian', emoji: '🍝' },
    { id: 'asian', label: 'Asian', emoji: '🍜' },
    { id: 'mexican', label: 'Mexican', emoji: '🌮' },
    { id: 'american', label: 'American', emoji: '🍔' },
    { id: 'indian', label: 'Indian', emoji: '🍛' },
    { id: 'chinese', label: 'Chinese', emoji: '🥢' },
    { id: 'japanese', label: 'Japanese', emoji: '🍣' },
    { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
    { id: 'thai', label: 'Thai', emoji: '🌶️' },
    { id: 'budget', label: 'Budget ($)', emoji: '💰' },
    { id: 'premium', label: 'Fine Dining', emoji: '🍷' },
  ];

  // Create emoji mapping
  const emojiMap = defaultFilters.reduce((acc, filter) => {
    acc[filter.id] = filter.emoji;
    acc[filter.label.toLowerCase()] = filter.emoji;
    return acc;
  }, {} as Record<string, string>);

  // Get emoji for a filter
  const getEmoji = (filterId: string): string => {
    return emojiMap[filterId.toLowerCase()] || 
           emojiMap[filterId.replace(/[-_]/g, ' ').toLowerCase()] || 
           '🏷️';
  };

  // Use available options if provided, otherwise use defaults
  const filters = availableOptions.length > 0 
    ? availableOptions.map(option => ({
        id: option,
        label: option.charAt(0).toUpperCase() + option.slice(1).replace(/[-_]/g, ' '),
        emoji: getEmoji(option)
      }))
    : defaultFilters;

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
