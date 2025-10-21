"use client";
import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { mockUsers, User } from "@/services/user-service";
import UserTable from "../../components/Users/user-table";
import UserForm from "../../components/Users/user-form";
import "primereact/resources/themes/lara-light-blue/theme.css";
const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAdd = () => {
    setSelectedUser(undefined);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    setDeleteUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteUser) {
      setUsers(users.filter((u) => u.id !== deleteUser.id));
      setShowDeleteDialog(false);
      setDeleteUser(null); // Reset the delete user
    }
  };

  const handleSubmit = (user: User) => {
    if (users.some((u) => u.id === user.id)) {
      setUsers(users.map((u) => (u.id === user.id ? user : u)));
    } else {
      setUsers([...users, user]);
    }
    setShowForm(false); // Close the form dialog
  };

  const handleCloseDialog = () => {
    setShowForm(false); // Close the form dialog
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false); // Close the delete dialog
    setDeleteUser(null); // Reset the delete user
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between items-center mb-4 gap-4">
        <h1>Users</h1>
        <Button
          label="Add New"
          icon="pi pi-plus"
          onClick={handleAdd}
          className="p-button-primary p-2 bg-gray"
          text
          raised
        />
      </div>

      {/* User Table */}
      <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Dialog for User Form */}
      <Dialog
        visible={showForm}
        onHide={handleCloseDialog}
        header={selectedUser ? "Edit User" : "New User"}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        modal
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleSubmit}
          onCancel={handleCloseDialog}
        />
      </Dialog>

      {/* Dialog for Delete Confirmation */}
      <Dialog
        visible={showDeleteDialog}
        onHide={handleCloseDeleteDialog}
        header="Confirm Delete"
        style={{ width: "30vw" }}
        footer={
          <div>
            <Button
              label="No"
              icon="pi pi-times"
              onClick={handleCloseDeleteDialog}
              className="p-button-text"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              onClick={confirmDelete}
              className="p-button-danger"
              autoFocus
            />
          </div>
        }
        modal
      >
        <p>
          Are you sure you want to delete <strong>{deleteUser?.name}</strong>?
        </p>
      </Dialog>
    </div>
  );
};

export default UsersPage;
