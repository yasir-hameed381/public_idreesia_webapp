// app/[locale]/(website)/parhaiyan/[slug]/page.js
"use client";
import RamzanForm from "@/components/RamzanForm";
import { useEffect, useState } from "react";

export default function ParhaiyanPage() {
  const [parhaiyanData, setParhaiyanData] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('currentParhaiyanData');
    if (storedData) {
    
      const parsedData = JSON.parse(storedData);
      setParhaiyanData(parsedData);
      
      sessionStorage.removeItem('currentParhaiyan');
      
      console.log("Loaded data:", parsedData);
    }
  }, []);
  if (!parhaiyanData) {
    return <div>Loading...</div>; 
  }

  return <RamzanForm parhaiyan={parhaiyanData} />;
}
// C:\Users\Super\Downloads\IdreesiaWeb1.0\app\[locale]\(website)\parhaiyan\Ramzan-2025