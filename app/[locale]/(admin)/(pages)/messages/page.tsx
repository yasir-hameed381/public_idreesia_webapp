import { MessagesTable } from "../../components/Messages/messages-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function MessagesPage() {
  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_MESSAGES}>
      <div className="p-4">
        <MessagesTable />
      </div>
    </PermissionWrapper>
  );
}
