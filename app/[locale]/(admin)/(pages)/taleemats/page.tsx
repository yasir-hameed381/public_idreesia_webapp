import { TaleematTable } from "../../components/Taleemat/taleemat-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function TaleematPage() {
  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_TALEEMAT}>
      <div className="p-3">
        <TaleematTable />
      </div>
    </PermissionWrapper>
  );
}
