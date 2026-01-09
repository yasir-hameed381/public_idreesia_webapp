"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { usePermissions } from "@/context/PermissionContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import ResponseTemplatesService, { ResponseTemplate } from "@/services/ResponseTemplates";

interface JawabLink {
  title: string;
  url: string;
}

const EditResponseTemplatePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [jawab, setJawab] = useState("");
  const [jawabLinks, setJawabLinks] = useState<JawabLink[]>([]);

  const canUpdate = isSuperAdmin || hasPermission(PERMISSIONS.UPDATE_RESPONSE_TEMPLATES);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const template = await ResponseTemplatesService.getResponseTemplateById(id);
      setTitle(template.title);
      setJawab(template.jawab || "");
      setJawabLinks(
        template.jawab_links && Array.isArray(template.jawab_links)
          ? template.jawab_links
          : []
      );
    } catch (error: any) {
      console.error("Error loading template:", error);
      toast.error(error?.response?.data?.message || "Failed to load template");
      router.push("/response-templates");
    } finally {
      setLoading(false);
    }
  };

  if (!canUpdate) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-6">You don't have permission to update response templates.</p>
          <Link
            href="/response-templates"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  const addJawabLink = () => {
    setJawabLinks([...jawabLinks, { title: "", url: "" }]);
  };

  const removeJawabLink = (index: number) => {
    const newLinks = jawabLinks.filter((_, i) => i !== index);
    setJawabLinks(newLinks);
  };

  const updateJawabLink = (index: number, field: "title" | "url", value: string) => {
    const newLinks = [...jawabLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setJawabLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (!title.trim()) {
      toast.error("Template title is required");
      return;
    }

    // Filter out empty links
    const filteredLinks = jawabLinks.filter(
      (link) => link.title.trim() && link.url.trim()
    );

    try {
      setSubmitting(true);
      await ResponseTemplatesService.updateResponseTemplate(id, {
        title: title.trim(),
        jawab: jawab.trim() || undefined,
        jawab_links: filteredLinks.length > 0 ? filteredLinks : undefined,
      });
      toast.success("Template updated successfully");
      router.push("/response-templates");
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error(error?.response?.data?.message || "Failed to update template");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.UPDATE_RESPONSE_TEMPLATES}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
              <p className="text-gray-600">Update template details</p>
            </div>
            <Link
              href="/response-templates"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Back to Templates
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Standard Response, Welcome Message, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jawab
                </label>
                <textarea
                  value={jawab}
                  onChange={(e) => setJawab(e.target.value)}
                  rows={8}
                  placeholder="Enter response..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Taleemat/Wazaif Links
                  </label>
                  <button
                    type="button"
                    onClick={addJawabLink}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    + Add Link
                  </button>
                </div>
                <div className="space-y-4">
                  {jawabLinks.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      No links added yet. Click "Add Link" to add resources.
                    </p>
                  ) : (
                    jawabLinks.map((link, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-start p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateJawabLink(index, "title", e.target.value)}
                            placeholder="Link Title (e.g., 8 No. Copy)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateJawabLink(index, "url", e.target.value)}
                            placeholder="URL (e.g., https://idreesia.com/taleem/...)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeJawabLink(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Updating..." : "Update Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PermissionWrapper>
  );
};

export default EditResponseTemplatePage;

