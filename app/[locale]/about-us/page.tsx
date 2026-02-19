"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { TranslationKeys } from '../../constants/translationKeys';

const SMSSubscriptionPage = () => {
  
  const t = useTranslations(TranslationKeys.SMS_PAGE);

  return (
    <div className="max-w-3xl mx-auto p-4" dir="rtl">
      <h1 className="text-center text-xl font-semibold mb-8 border-b border-green-500 pb-2 text-[#424242]">
        {t("sms")}
      </h1>
      
      <div className="space-y-8">
        {/* SUB Instructions */}
        <div>
          <h2 className="text-lg font-medium mb-4 text-center text-[#424242]">
            {t("subscription_instructions")}
          </h2>
          <div className="space-y-2  text-[#424242] text-center">
            <p>{t("subscription_steps")}</p>
            <p>{t("confirmation_message")}</p>
            <p>{t("subscription_charges")}</p>
          </div>
        </div>

        {/* Renewal Instructions */}
        <div>
          <h2 className="text-lg font-medium mb-4 text-center  text-[#424242]">
            {t("renewal_instructions")}
          </h2>
          <div className="space-y-2  text-[#424242] text-center">
            <p>{t("renewal_confirmation")}</p>
            <p>{t("feedback_instructions")}</p>
          </div>
        </div>

        {/* Feedback Section */}
        <div>
          <h2 className="text-lg font-medium mb-4 text-center text-[#424242]">
            {t("feedback_charges")}
          </h2>
          <div className="space-y-2 text-[#424242]">
            <p>{t("new_teaching_request")}</p>
            <p>{t("new_teaching_charges")}</p>
          </div>
        </div>


      </div>
    </div>
  );
};



export default SMSSubscriptionPage;
