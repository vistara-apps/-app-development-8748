import React from 'react';

const CallToActionButton = ({ 
  children, 
  variant = "primary", 
  onClick, 
  className = "",
  disabled = false 
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl",
    secondary: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm",
    outline: "border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CallToActionButton;
