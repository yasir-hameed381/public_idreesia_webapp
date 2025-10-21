import { NaatShareefTable } from "../../components/Naat-Shareef/naat-shareef-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function NaatShareefPage() {
  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_NAATS}>
      <div className="p-4">
        <NaatShareefTable />
      </div>
    </PermissionWrapper>
  );
}
