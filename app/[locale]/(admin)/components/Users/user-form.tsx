"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { User } from "@/services/user-service";

interface UserFormProps {
  user?: User;
  onSubmit: (user: User) => void;
  onCancel?: () => void;
}

const roles = ["Admin", "Editor", "MainEditor"];

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<User>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "",
      password: "",
    },
  });

  const submitForm = (data: any) => {
    const newUser: User = {
      id: user?.id || Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password,
      createdAt: user?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newUser);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="p-fluid">
      <div className="p-field">
        <label htmlFor="name">Full Name</label>
        <InputText
          id="name"
          {...register("name", { required: "Name is required." })}
          className={classNames({
            "p-invalid": errors.name,
            "p-inputtext-lg": true,
          })}
          aria-describedby="name-error"
          style={{ border: "1px solid #ced4da", borderRadius: "4px" }}
        />
        {errors.name && (
          <small id="name-error" className="p-error">
            {errors.name.message}
          </small>
        )}
      </div>

      <div className="p-field">
        <label htmlFor="email">Email</label>
        <InputText
          id="email"
          {...register("email", {
            required: "Email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address.",
            },
          })}
          className={classNames({
            "p-invalid": errors.email,
            "p-inputtext-lg": true,
          })}
          aria-describedby="email-error"
          style={{ border: "1px solid #ced4da", borderRadius: "4px" }}
        />
        {errors.email && (
          <small id="email-error" className="p-error">
            {errors.email.message}
          </small>
        )}
      </div>

      <div className="p-field">
        <label htmlFor="password">Password</label>
        <InputText
          id="password"
          type="password"
          {...register("password", {
            required: "Password is required.",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long.",
            },
          })}
          className={classNames({
            "p-invalid": errors.password,
            "p-inputtext-lg": true,
          })}
          aria-describedby="password-error"
          style={{ border: "1px solid #ced4da", borderRadius: "4px" }}
        />
        {errors.password && (
          <small id="password-error" className="p-error">
            {errors.password.message}
          </small>
        )}
      </div>

      <div className="p-field">
        <label htmlFor="role">Assign Role</label>
        <Controller
          name="role"
          control={control}
          rules={{ required: "Role is required." }}
          render={({ field }) => (
            <Dropdown
              id="role"
              {...field}
              options={roles}
              placeholder="Select a Role"
              className={classNames({
                "p-invalid": errors.role,
                "p-inputtext-lg": true,
              })}
              aria-describedby="role-error"
              style={{ border: "1px solid #ced4da", borderRadius: "4px" }}
            />
          )}
        />
        {errors.role && (
          <small id="role-error" className="p-error">
            {errors.role.message}
          </small>
        )}
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          label="Cancel"
          className="p-button-secondary p-2"
          text
          raised
          onClick={onCancel}
        />
        <Button
          type="submit"
          label="Save"
          className="p-button-primary p-2"
          text
          raised
        />
      </div>
    </form>
  );
};

export default UserForm;
