import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface DeleteDialogProps {
  visible: boolean;
  itemName: string;
  isLoading: boolean;
  onHide: () => void;
  onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  visible,
  itemName,
  isLoading,
  onHide,
  onConfirm,
}) => {
  const deleteDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="p-button-danger"
        onClick={onConfirm}
        loading={isLoading}
      />
    </React.Fragment>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "450px" }}
      header="Confirm"
      modal
      footer={deleteDialogFooter}
      onHide={onHide}
    >
      <div className="flex align-items-center justify-content-center">
        <i
          className="pi pi-exclamation-triangle mr-3"
          style={{ fontSize: "2rem" }}
        />
        <span>
          Are you sure you want to delete <b>{itemName}</b>?
        </span>
      </div>
    </Dialog>
  );
};

export default DeleteDialog;
