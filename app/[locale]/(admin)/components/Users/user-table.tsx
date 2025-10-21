"use-client";
import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { User } from "@/services/user-service";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isDeleteDisabled?: boolean; // Optional prop to disable delete button
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  isDeleteDisabled,
}) => {
  const actionBodyTemplate = (rowData: User) => {
    return (
      <div>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() => onEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => onDelete(rowData)}
          disabled={isDeleteDisabled} // Disable button if needed
        />
      </div>
    );
  };

  return (
    <DataTable
      value={users}
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 25, 50]}
      tableStyle={{ minWidth: "50rem" }}
    >
      <Column field="id" header="ID" sortable />
      <Column field="name" header="Name" sortable />
      <Column field="email" header="Email" sortable />
      <Column field="role" header="Role" sortable />
      <Column field="createdAt" header="Created At" sortable />
      <Column field="updatedAt" header="Updated At" sortable />
      <Column body={actionBodyTemplate} header="Manage" />
    </DataTable>
  );
};

export default UserTable;
