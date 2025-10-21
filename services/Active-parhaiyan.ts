import axios from "axios";

export async function activeParhaiyan() {
  console.log(process.env.NEXT_PUBLIC_API_URL);

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/parhaiyan/active`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching data:",
      error?.response?.data?.message || error.message
    );
    throw new Error("Error fetching active parhaiyan data");
  }
}
