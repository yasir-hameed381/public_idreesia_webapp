import React from 'react';

const SearchIcon = ({ className = "w-5 h-5 text-green-600", stroke = "currentColor", fill = "none" }) => {
  return (
    <svg
      className={className}
      fill={fill}
      stroke={stroke}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
};

export default SearchIcon;  
