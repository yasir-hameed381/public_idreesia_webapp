// "use client"

// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { HardDriveDownload } from 'lucide-react';

// import { useTranslations } from 'next-intl';
// import { usePathname } from 'next/navigation';

// const naatsharifdetails = () => {
//   const  singledata = useSelector((state) => state?.naatsharif.singledata);
//    const t = useTranslations();
//     const pathname = usePathname();
  
  
//   const locale = pathname.split('/')[1] || 'en'; 
//   const naatSharif = singledata ? Object.values(singledata)[0] : null;

  
//   if (!naatSharif) {
//     return (
//       <div className="text-center p-4 mt-8">
//         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
//           <p>naatSharif not found.</p>
//         </div>
//       </div>
//     );
//   }




//   const getTitle = () => locale === 'ur' ? naatSharif.title_ur : naatSharif.title_en;



//   return (
//     <div className="text-center mx-auto max-w-lg p-4">
//       <div className="bg-white shadow-lg rounded-lg p-6 border border-green-100">

//       <h1 className={`text-2xl text-black font-bold mb-4 ${locale === 'ur' ? 'font-urdu text-right' : ''}`}>
//           {getTitle()}
//         </h1>
//         <p className="mb-4">
//           <span className="font-bold text-gray-700"></span>{' '}
//           <span className="text-gray-600">{naatSharif?.created_at}</span>
//         </p>
//         <div className="border-b border-green-700 my-4"></div>
//         {naatSharif.filepath && (
//           <div className="mb-4">
//             <span className="font-bold text-gray-700"></span>
//             <audio controls src={naatSharif?.filepath} className="mt-2 w-full">
//             </audio>
//           </div>
//         )}
//         <p className="mb-4">
//           <span className="font-bold text-gray-700">type:</span>{' '}
//           <span className="text-gray-600">{naatSharif?.type}</span>
//         </p>
//         {naatSharif.title_en && (
//           <p className="mb-4">
//             <span className="font-bold text-gray-700">track:</span>{' '}
//             <span className="text-gray-600">{naatSharif.track}</span>
//           </p>
//         )}

//         {naatSharif.description_en && (
//           <p className="mb-4">
//             <span className="font-bold text-gray-700">Description:</span>{' '}
//             <span className="text-gray-600">{naatSharif.description_en}</span>
//           </p>
//         )}
//         {naatSharif.filepath && (
//           <div className="mb-4 flex flex-row items-center justify-center text-[#028f4f]">
//             <HardDriveDownload />
//             <a
//               href={naatSharif?.filepath}
//               download
//               className="text-bold inline-block text-[#028f4f] px-4 py-2 rounded transition-colors"
//             >
//               Download Now
//             </a>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };



// export default naatsharifdetails;