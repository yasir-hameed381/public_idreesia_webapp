import { FeedbackTable } from "../../components/Feedback/feedback-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function FeedbackPage() {
  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_FEEDBACK}>
      <div className="p-4">
        <FeedbackTable />
      </div>
    </PermissionWrapper>
  );
}
