"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import reading from "../app/assets/reading.png";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

type FormValues = {
  name: string;
  fatherName: string;
  city: string;
  mobileNumber: string;
  daroodIbrahimiPehlaHissa: string;
  qulShareef: string;
  yaseenShareef: string;
  quranPak: string;
};

export default function RamzanSubmissionForm() {
  const router = useRouter();
  const [stage, setStage] = useState<"initial" | "form">("initial");
  const [isVisible, setIsVisible] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      fatherName: "",
      city: "",
      mobileNumber: "",
      daroodIbrahimiPehlaHissa: "0",
      qulShareef: "0",
      yaseenShareef: "0",
      quranPak: "0",
    }
  });

  const handleSubmitInitial = () => {
    router.push("/parhaiyan/Ramzan-2025");
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const onSubmit = (data: FormValues) => {
    console.log(data);
    router.push("/parhaiyan/Ramzan-2025");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 m-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative bg-white p-8 rounded-lg shadow-md w-full"
      >
        {/* Close Icon */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">
          27 Ramzan ul Mubarak ki Parhaiyan
        </h2>
        <p className="text-center mb-4">Ramzan Shareef 2025</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">Name *</label>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="Enter your name"
              className="w-full p-2 border rounded"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-2">Father's Name *</label>
            <input
              {...register("fatherName", { required: "Father's name is required" })}
              placeholder="Enter your father's name"
              className="w-full p-2 border rounded"
            />
            {errors.fatherName && (
              <p className="text-red-500 text-sm mt-1">{errors.fatherName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">City *</label>
            <input
              {...register("city", { required: "City is required" })}
              placeholder="Enter your city"
              className="w-full p-2 border rounded"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-2">Mobile Number *</label>
            <input
              {...register("mobileNumber", { 
                required: "Mobile number is required",
                pattern: {
                  value: /^[0-9]{10,15}$/,
                  message: "Please enter a valid mobile number"
                }
              })}
              placeholder="Enter your mobile number"
              className="w-full p-2 border rounded"
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>
            )}
          </div>
        </div>
        
        <h2 className="text-xl font-4 mb-4 text-center">Parhaiyan</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Darood Ibrahimi Pehla Hissa</label>
            <input
              {...register("daroodIbrahimiPehlaHissa")}
              type="number"
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          <div>
            <label className="block mb-2">Qul Shareef</label>
            <input
              {...register("qulShareef")}
              type="number"
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block mb-2">Yaseen Shareef</label>
            <input
              {...register("yaseenShareef")}
              type="number"
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          <div>
            <label className="block mb-2">Quran Pak</label>
            <input
              {...register("quranPak")}
              type="number"
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm">Success!</span>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}