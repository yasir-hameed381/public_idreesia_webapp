"use client";

import React from "react";
import { useLocale } from "next-intl";
import ContentCards from "./ContentCards";

const IslamicCards = () => {
  const locale = useLocale();

  return <ContentCards locale={locale as string} />;
};

export default IslamicCards;
