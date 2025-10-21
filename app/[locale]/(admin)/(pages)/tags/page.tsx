import { TagTable } from "../../components/Tags/tag-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function TagsPage() {
  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_TAGS}>
      <div className="p-4">
        <TagTable />
      </div>
    </PermissionWrapper>
  );
}
