"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CommitteePortalRootPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";

  useEffect(() => {
    router.push(`/${locale}/committee-portal/dashboard`);
  }, [router, locale]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

