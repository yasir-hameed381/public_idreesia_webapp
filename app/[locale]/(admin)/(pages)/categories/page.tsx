"use client";

import { useState } from "react";
import { CategoryTable } from "../../components/Category/category-tables";
import { CategoryForm } from "../../components/Category/category-form";
import { Category } from "@/app/types/category";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_CATEGORIES}>
      <div className="container mx-auto p-4">
        <CategoryTable onEdit={handleEdit} onAdd={handleAdd} />
        <CategoryForm
          category={editingCategory}
          open={isFormOpen}
          onClose={handleFormClose}
        />
      </div>
    </PermissionWrapper>
  );
}
