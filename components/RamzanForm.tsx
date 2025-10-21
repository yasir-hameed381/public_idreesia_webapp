"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createParhaiyanEntry } from "../services/Ramzan-parhaiyan";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { Button } from "primereact/button";
import { useState } from "react";

type FormValues = {
  name: string;
  father_name: string;
  city: string;
  mobile_number: string;
  darood_ibrahimi_pehla_hissa: number;
  qul_shareef: number;
  yaseen_shareef: number;
  quran_pak: number;
};

export default function RamzanForm({ parhaiyan }: { parhaiyan?: { id?: number, title_en?: string, title_ur?: string, description_en?: string, description_ur?: string } }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('RamzanForm');
  const {showError,showSuccess} = useToast()
    const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      father_name: "",
      city: "",
      mobile_number: "",
      darood_ibrahimi_pehla_hissa: 0,
      qul_shareef: 0,
      yaseen_shareef: 0,
      quran_pak: 0,
    },
  });

  const getLocalizedText = (enText?: string, urText?: string) =>
    locale === 'ur' ? urText || enText : enText || urText;

  const handleClose = () => {
    router.push("/");
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        parhaiyan_id: parhaiyan?.id ?? 0,
      };
     setLoading(true)
      const response = await createParhaiyanEntry(payload);
      showSuccess("Successfully created")
      
     setLoading(false)
    } catch (err) {
      console.error("Form submission failed:", err);
      showError("Failed to create parhaiyan.")
    }
  };

  // Determine if the locale is RTL (Urdu)
  const isRTL = locale === 'ur';
   
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-[#FCF8F5]  w-full`} dir={isRTL ? 'rtl' : 'ltr'}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`bg-white p-8 rounded-xl shadow-md m-8 w-[calc(100%-50px)]  md:w-[calc(100vw-222px)]  lg:w-[calc(100vw-522px)]   ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <button
          type="button"
          onClick={handleClose}
          className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-4 text-gray-500 hover:text-gray-700 transition`}
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h1 className="text-2xl font-bold mb-4 text-center">
          {getLocalizedText(parhaiyan?.title_en, parhaiyan?.title_ur)}
        </h1>
  <p className={`text-center text-base sm:text-[1.1rem] text-[#42424E] mb-4 ${
  isRTL ? '!leading-[2.5rem] sm:text-[1.125rem] text-[#42424E]' : '!leading-8'
}`}>
          {getLocalizedText(parhaiyan?.description_en, parhaiyan?.description_ur)}
        </p>
         {/* ${isRTL ? 'text-sm font-semibold' : 'text-sm'} */}
    <h2 className={`text-lg  font-medium mb-4 ${isRTL ? 'text-right text-lg font-semibold' : 'text-left'}`}>{t('personal Information')}</h2>
        <div className="grid  grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          
          <div className="">
            {/* <label className="block mb-2  text-sm font-medium" htmlFor="name"> */}
            <label  className={`block mb-2 ${isRTL ? 'text-sm font-semibold' : 'text-sm'} font-medium`} htmlFor="name"> 
              {t('name')} *
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: t('errors.nameRequired') })}
              placeholder={t('placeholders.name')}
              className={`w-full  border p-2  rounded-lg shadow-sm text-sm 
               ${errors.name
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500 '
                  : 'border focus:border-black focus:ring-1 focus:ring-black shadow-transparent'} 
                focus:outline-none`}

            
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className=""> 
            <label className={`block mb-2  font-medium ${isRTL ? 'text-sm font-semibold' : 'text-sm'}`} htmlFor="father_name">
              {t('fatherName')} *
            </label>
            <input
              id="father_name"
              type="text"
              {...register("father_name", { required: t('errors.fatherNameRequired') })}
              placeholder={t('placeholders.fatherName')}
              className={`w-full p-2 border rounded-lg  shadow-sm text-sm 
              ${errors.father_name
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border focus:border-black focus:ring-1 focus:ring-black'} 
              focus:outline-none`}
            
            />
            {errors.father_name && <p className="text-red-500 text-sm">{errors.father_name.message}</p>}
          </div>
        </div>



        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 border-b pb-7">
          <div className=""> 
            <label className={`block mb-2  font-medium   ${isRTL ? 'text-sm font-semibold' : 'text-sm'}`} htmlFor="city">
              {t('city')} *
            </label>
            <input
              id="city"
              type="text"
              {...register("city", { required: t('errors.cityRequired') })}
              placeholder={t('placeholders.city')}
              className={`w-full p-2 border rounded-lg   shadow-sm text-sm 
               ${errors.city
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border focus:border-black focus:ring-1 focus:ring-black'} 
               focus:outline-none`}
            
            />
            {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
          </div>
          <div className="">
            <label className={`block mb-2  font-medium  ${isRTL ? 'text-sm font-black' : 'text-sm'}`} htmlFor="mobile_number">
              {t('mobileNumber')} *
            </label>
            <input
              id="mobile_number"
              type="tel"
              {...register("mobile_number", {
                required: t('errors.mobileNumberRequired'),
                pattern: {
                  value: /^[0-9]{10,15}$/,
                  message: t('errors.invalidMobileNumber')
                }
              })}
              placeholder={t('placeholders.mobileNumber')}

              dir="ltr" 
               className={`w-full p-2 border rounded-lg  shadow-sm text-sm 
               ${errors.mobile_number
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border focus:border-black focus:ring-1 focus:ring-black'} 
               focus:outline-none`} />
            {errors.mobile_number && <p className="text-red-500 text-sm">{errors.mobile_number.message}</p>}
          </div>
        </div>
        <h2 className={`text-lg  font-medium mb-4 ${isRTL ? 'text-right text-xl font-semibold' : 'text-left'}`}>{t('recitations')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className=""> {/* text-align will be inherited from parent dir */}
            <label className={`block mb-2  font-medium  ${isRTL ? 'text-sm font-semibold' : 'text-sm'}`} htmlFor="darood_ibrahimi_pehla_hissa">
              {t('daroodIbrahimi')}
            </label>
            <input
              id="darood_ibrahimi_pehla_hissa"
              type="number"
              {...register("darood_ibrahimi_pehla_hissa", { min: 0 })}
              className="w-full p-2 border rounded shadow-sm text-sm "
              min="0"
              dir="ltr" // Numbers should ALWAYS be LTR
            />
          </div>
          <div className=""> 
            <label className={`block mb-2 font-medium  ${isRTL ? 'text-sm font-semibold' : 'text-sm'}`} htmlFor="qul_shareef">
              {t('qulShareef')}
            </label>
            <input
              id="qul_shareef"
              type="number"
              {...register("qul_shareef", { min: 0 })}
              className="w-full p-2 border rounded-lg  shadow-sm text-sm "
              min="0"
              dir="ltr" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="">
            <label className={`block mb-2 font-medium   ${isRTL ? 'text-sm font-semibold' : 'text-sm'}`} htmlFor="yaseen_shareef">
              {t('yaseenShareef')}
            </label>
            <input
              id="yaseen_shareef"
              type="number"
              {...register("yaseen_shareef", { min: 0 })}
              className="w-full p-2 border rounded-lg  shadow-sm text-sm "
              min="0"
              dir="ltr"
            />
          </div>
          <div className=""> 
            <label className={`block mb-2  font-medium  ${isRTL ? 'text-sm font-semibold' : 'text-sm'}`} htmlFor="quran_pak">
              {t('quranPak')}
            </label>
            <input
              id="quran_pak"
              type="number"
              {...register("quran_pak", { min: 0 })}
              className="w-full p-2 border rounded-lg shadow-sm text-sm "
              min="0"
              dir="ltr" 
            />
          </div>
        </div>
        <div className=" flex items-center justify-center">
          <Button
            type="submit"
            loading={loading}
            label={!loading ? t('submit') : ''}
            className="min-w-[100px] mt-6 bg-[#1B9A60] text-white p-2 rounded-md hover:bg-green-600 transition justify-center"
          />

        </div>
      </form>
    </div>
  );
}





