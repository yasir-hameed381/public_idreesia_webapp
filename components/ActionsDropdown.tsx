"use client";

import React, { useState, useRef, useEffect } from "react";
import { Edit, Trash2, Eye, Play, Clock, Copy } from "lucide-react";

interface ActionsDropdownProps {
  onView?: () => void;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSchedule?: () => void;
  onDuplicate?: () => void;
  showView?: boolean;
  showPlay?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showSchedule?: boolean;
  showDuplicate?: boolean;
  align?: "left" | "right";
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  onView,
  onPlay,
  onEdit,
  onDelete,
  onSchedule,
  onDuplicate,
  showView = false,
  showPlay = false,
  showEdit = true,
  showDelete = true,
  showSchedule = false,
  showDuplicate = false,
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

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
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

  const handleSchedule = () => {
    if (onSchedule) {
      onSchedule();
    }
    setIsOpen(false);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate();
    }
    setIsOpen(false);
  };

  if (!showView && !showPlay && !showEdit && !showDelete && !showSchedule && !showDuplicate) {
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
            {showPlay && onPlay && (
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Play className="w-4 h-4 text-gray-500" />
                Play
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
            {showSchedule && onSchedule && (
              <button
                onClick={handleSchedule}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Clock className="w-4 h-4 text-gray-500" />
                Schedule Message
              </button>
            )}
            {showDuplicate && onDuplicate && (
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500" />
                Duplicate
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
