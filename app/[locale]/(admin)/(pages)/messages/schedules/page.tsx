import { ScheduledMessagesTable } from "../../../components/Messages/scheduled-messages-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function ScheduledMessagesPage() {
  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_MESSAGES}>
      <div className="p-4">
        <ScheduledMessagesTable />
      </div>
    </PermissionWrapper>
  );
}

