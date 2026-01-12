"use client";

import React, { useState, useRef, useEffect } from "react";
import { Edit, Trash2, Eye } from "lucide-react";

interface ActionsDropdownProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  align?: "left" | "right";
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  onView,
  onEdit,
  onDelete,
  showView = false,
  showEdit = true,
  showDelete = true,
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleView = () => {
    if (onView) {
      onView();
    }
    setIsOpen(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setIsOpen(false);
  };

  if (!showView && !showEdit && !showDelete) {
    return null;
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Actions"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="5" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="15" cy="10" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200`}
        >
          <div className="py-1">
            {showView && onView && (
              <button
                onClick={handleView}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Eye className="w-4 h-4 text-gray-500" />
                View
              </button>
            )}
            {showEdit && onEdit && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-500" />
                Edit
              </button>
            )}
            {showDelete && onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown;
