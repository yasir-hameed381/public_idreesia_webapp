"use client";

import { useParams, useRouter } from "next/navigation";
import { FeedbackShow } from "@/app/[locale]/(admin)/components/Feedback/feedback-show";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function FeedbackDetailsPage() {
  const params = useParams();
  const feedbackId = params.id as string;

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_FEEDBACK}>
      <FeedbackShow feedbackId={Number(feedbackId)} />
    </PermissionWrapper>
  );
}

