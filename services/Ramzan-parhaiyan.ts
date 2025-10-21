
import axios from "axios";

export type RamzanParhaiyanPayload = {
 parhaiyan_id: number;
  name: string;
   father_name: string; 
   city: string; 
   mobile_number: string; 
   darood_ibrahimi_pehla_hissa: number; 
   qul_shareef: number; 
   yaseen_shareef: number; 
   quran_pak: number;
};

export async function createParhaiyanEntry(data: RamzanParhaiyanPayload) {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/parhaiyan-recitations/add`, data);
    return response.data;
  } catch (error) {
    console.log(error?.response?.data?.message);

    throw new Error("Failed to submit form data");
  }
}
