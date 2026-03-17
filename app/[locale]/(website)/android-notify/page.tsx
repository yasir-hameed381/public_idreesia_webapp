import React from "react";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { TranslationKeys } from "../../../constants/translationKeys";

type Props = { params: Promise<{ locale: string }> };

export default async function AndroidNotifyPage({ params }: Props) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);

  const t = (await getTranslations({
    locale,
    namespace: TranslationKeys.ANDROID,
  })) as (key: string) => string;

  return (
    <div className='flex flex-col items-center h-screen bg-[#fcf8f5]'>
<div className="h-max-[1140px]">
<h2 className="text-center text-[24px] mb-4 border-b-2 border-green-700 pb-2 text-[#424242]">
        {t("title")}
      </h2>

      <ul className="list-disc pl-5 text-center list-inside text-[#424242]">
        {[1, 2, 3, 4, 5].map((stepNumber) => (
          <li key={stepNumber} className="my-3">
            {t(`steps.${stepNumber}`)}
          </li>
        ))}
      </ul>

      </div>
    </div>
  );
}