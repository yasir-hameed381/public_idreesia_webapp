const LocationIcon = ({ className }) => {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   className={className}
    //   fill="none"
    //   viewBox="0 0 24 24"
    //   stroke="currentColor"
    // >
    //   <path
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //     strokeWidth={2}
    //     d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    //   />
    // </svg>


<svg 
xmlns="http://www.w3.org/2000/svg" 
      className={className}
    fill="none" 
viewBox="0 0 24 24" 
stroke="currentColor"
>
<path 
  strokeLinecap="round" 
  strokeLinejoin="round" 
  strokeWidth={2} 
  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
/>
<path 
  strokeLinecap="round" 
  strokeLinejoin="round" 
  strokeWidth={2} 
  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
/>
</svg>
  );
};

export default LocationIcon;
