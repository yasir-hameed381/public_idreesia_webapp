"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Phone, MessageCircle, Copy, Search, Plus, X, Info } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/context/PermissionContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import TarteebRequestService, {
  TarteebRequest,
} from "@/services/TarteebRequests";
import ResponseTemplatesService, { ResponseTemplate } from "@/services/ResponseTemplates";
import KhatService from "@/services/KhatService";
import { SearchResource } from "@/types/khat";

interface JawabLink {
  title: string;
  url: string;
}

const SEARCH_LIMIT = 50;
const SEARCH_TYPES = {
  TALEEMAT: "taleem",
  WAZAIF: "wazaif",
  MEHFILS: "mehfil",
} as const;

type SearchType = typeof SEARCH_TYPES[keyof typeof SEARCH_TYPES];

const AdminTarteebRequestDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { hasPermission, isSuperAdmin } = usePermissions();

  const requestId = useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;
    if (Array.isArray(idParam)) {
      return parseInt(idParam[0], 10);
    }
    return parseInt(idParam, 10);
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [request, setRequest] = useState<TarteebRequest | null>(null);
  
  // Response & Actions state
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [jawab, setJawab] = useState("");
  const [notes, setNotes] = useState("");
  const [jawabLinks, setJawabLinks] = useState<JawabLink[]>([]);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Resource search modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>(SEARCH_TYPES.WAZAIF);
  const [searchResults, setSearchResults] = useState<SearchResource[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOffset, setSearchOffset] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());

  // Template save modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");

  const canCreateTemplate = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_RESPONSE_TEMPLATES);

  useEffect(() => {
    if (!requestId) {
      toast.error("Invalid request id");
      router.replace("/tarteeb-requests");
      return;
    }
    loadRequest();
    loadTemplates();
  }, [requestId, router]);

  const loadRequest = async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      const data = await TarteebRequestService.getTarteebRequestById(requestId);
      setRequest(data);
      setStatus((data.status as "pending" | "approved" | "rejected") || "pending");
      setJawab(data.jawab || "");
      setNotes(data.notes || "");
      // Parse jawab_links if it exists
      if (data.jawab_links && Array.isArray(data.jawab_links)) {
        setJawabLinks(data.jawab_links as JawabLink[]);
      } else {
        setJawabLinks([]);
      }
    } catch (error) {
      console.error("Failed to load request", error);
      toast.error("Unable to load request details");
      router.replace("/tarteeb-requests");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await ResponseTemplatesService.getResponseTemplates({
        page: 1,
        size: 100,
      });
      setTemplates(response.data);
    } catch (error) {
      console.error("Failed to load templates", error);
    }
  };

  const handleSave = async () => {
    if (!requestId) return;

    try {
      setSaving(true);
      const filteredLinks = jawabLinks.filter((link) => link.title && link.url);
      await TarteebRequestService.updateTarteebRequest(requestId, {
        status,
        jawab,
        notes,
        jawab_links: filteredLinks.length > 0 ? filteredLinks : undefined,
      });
      toast.success("Tarteeb request updated successfully");
      loadRequest();
    } catch (error: any) {
      console.error("Failed to save request", error);
      toast.error(error?.response?.data?.message || "Unable to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const template = templates.find((t) => t.id === Number(templateId));
    if (template) {
      setJawab(template.jawab || "");
      setJawabLinks((template.jawab_links as JawabLink[]) || []);
      toast.success("Template applied successfully");
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!newTemplateTitle.trim()) {
      toast.error("Template title is required");
      return;
    }

    const filteredLinks = jawabLinks.filter((link) => link.title && link.url);

    try {
      await ResponseTemplatesService.createResponseTemplate({
        title: newTemplateTitle.trim(),
        jawab: jawab.trim() || undefined,
        jawab_links: filteredLinks.length > 0 ? filteredLinks : undefined,
      });
      toast.success("Template saved successfully");
      setShowTemplateModal(false);
      setNewTemplateTitle("");
      loadTemplates();
    } catch (error: any) {
      console.error("Failed to save template", error);
      toast.error(error?.response?.data?.message || "Failed to save template");
    }
  };

  const handleAddLink = () => {
    setJawabLinks((prev) => [...prev, { title: "", url: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    setJawabLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateLink = (index: number, field: keyof JawabLink, value: string) => {
    setJawabLinks((prev) =>
      prev.map((link, idx) => (idx === index ? { ...link, [field]: value } : link))
    );
  };

  // Resource search
  const handleOpenSearchModal = () => {
    setShowSearchModal(true);
    setSearchQuery("");
    setSearchResults([]);
    setSearchOffset(0);
    setHasMoreResults(false);
    setSelectedResources(new Set());
    performSearch();
  };

  const performSearch = async (loadMore = false) => {
    if (!loadMore) {
      setSearchResults([]);
      setSearchOffset(0);
      setHasMoreResults(false);
    }

    try {
      setSearchLoading(true);
      let results: SearchResource[] = [];

      switch (searchType) {
        case SEARCH_TYPES.TALEEMAT:
          results = await KhatService.searchTaleemat(searchQuery, searchOffset, SEARCH_LIMIT + 1);
          break;
        case SEARCH_TYPES.WAZAIF:
          results = await KhatService.searchWazaif(searchQuery, searchOffset, SEARCH_LIMIT + 1);
          break;
        case SEARCH_TYPES.MEHFILS:
          results = await KhatService.searchMehfils(searchQuery, searchOffset, SEARCH_LIMIT + 1);
          break;
      }

      const hasMore = results.length > SEARCH_LIMIT;
      if (hasMore) {
        results = results.slice(0, SEARCH_LIMIT);
      }

      if (loadMore) {
        setSearchResults((prev) => [...prev, ...results]);
      } else {
        setSearchResults(results);
      }

      setHasMoreResults(hasMore);
      setSearchOffset((prev) => prev + results.length);
    } catch (error) {
      console.error("Search failed", error);
      toast.error("An error occurred while searching");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    setSearchQuery("");
    setSearchResults([]);
    setSearchOffset(0);
    setHasMoreResults(false);
    setSelectedResources(new Set());
    performSearch();
  };

  const toggleResourceSelection = (resourceId: number) => {
    const key = `${searchType}-${resourceId}`;
    setSelectedResources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleAddSelectedResources = () => {
    if (selectedResources.size === 0) {
      toast.error("Please select at least one resource");
      return;
    }

    const newLinks: JawabLink[] = [];
    selectedResources.forEach((key) => {
      const [type, id] = key.split("-");
      const resource = searchResults.find((r) => r.id === Number(id));
      if (resource) {
        let url = "";
        switch (type) {
          case SEARCH_TYPES.TALEEMAT:
            url = `/taleemat/${resource.id}`;
            break;
          case SEARCH_TYPES.WAZAIF:
            url = `/wazaif/${resource.id}`;
            break;
          case SEARCH_TYPES.MEHFILS:
            url = `/mehfils/${resource.id}`;
            break;
        }
        newLinks.push({
          title: resource.title || resource.name || "",
          url: `${window.location.origin}${url}`,
        });
      }
    });

    setJawabLinks((prev) => [...prev, ...newLinks]);
    setShowSearchModal(false);
    setSelectedResources(new Set());
    toast.success(`${newLinks.length} resource(s) added`);
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const parsedBoolean = (value: any) => {
    if (value === 1) return true;
    if (value === 0) return false;
    return Boolean(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const statusLabels: Record<string, string> = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || statusClasses.pending}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  if (!requestId) {
    return null;
  }

  if (loading) {
    return (
      <PermissionWrapper requiredPermission={[PERMISSIONS.VIEW_TARTEEB_REQUESTS]}>
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PermissionWrapper>
    );
  }

  if (!request) {
    return (
      <PermissionWrapper requiredPermission={[PERMISSIONS.VIEW_TARTEEB_REQUESTS]}>
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h2>
            <Link
              href="/tarteeb-requests"
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Back to Tarteeb Requests
            </Link>
          </div>
        </div>
      </PermissionWrapper>
    );
  }

  const trackingLink = `${window.location.origin}/tarteeb-request/${requestId}/details`;

  return (
    <PermissionWrapper requiredPermission={[PERMISSIONS.VIEW_TARTEEB_REQUESTS]}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Tarteeb Request Details
                </h1>
                <div className="flex items-center gap-2">
                  {getStatusBadge(status)}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    First submission
                  </span>
                </div>
              </div>
              <Link
                href="/tarteeb-requests"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Tarteeb Requests
              </Link>
            </div>
          </div>

          {/* Response & Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Response & Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apply Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">-- Select a template --</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id.toString()}>
                      {template.title}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taleemat/Wazaif Links
                </label>
                {jawabLinks.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-2">
                    No links added yet. Click 'Add Link' to add resources.
                  </p>
                ) : (
                  <div className="space-y-2 mb-2">
                    {jawabLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <input
                          type="text"
                          placeholder="Title"
                          value={link.title}
                          onChange={(e) => handleUpdateLink(index, "title", e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(index, "url", e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleOpenSearchModal}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Search size={16} />
                    Search Resources
                  </button>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Plus size={16} />
                    Add Link
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Info size={16} className="text-gray-500" />
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Enter internal notes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "pending" | "approved" | "rejected")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                {canCreateTemplate && (
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Save as Template
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Tracking Link */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking Link</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={trackingLink}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                type="button"
                onClick={() => handleCopyLink(trackingLink)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-sm text-gray-900">{request.email}</p>
                <a
                  href={`mailto:${request.email}`}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mt-1"
                >
                  <Mail size={14} />
                  Email
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <p className="text-sm text-gray-900">{request.phone_number}</p>
                <div className="flex items-center gap-3 mt-1">
                  <a
                    href={`tel:${request.phone_number}`}
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Phone size={14} />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${request.phone_number.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tarteeb Form - Read-only display */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarteeb Form</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-sm text-gray-900">{request.full_name || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
                <p className="text-sm text-gray-900">{request.father_name || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <p className="text-sm text-gray-900">{request.age || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <p className="text-sm text-gray-900 capitalize">{request.gender || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <p className="text-sm text-gray-900">{request.city || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <p className="text-sm text-gray-900">{request.country || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Introducer to Silsila</label>
                <p className="text-sm text-gray-900">{request.introducer_name || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ehad Duration</label>
                <p className="text-sm text-gray-900">{request.ehad_duration || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source of income</label>
                <p className="text-sm text-gray-900">{request.source_of_income || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <p className="text-sm text-gray-900">{request.education || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <p className="text-sm text-gray-900 capitalize">{request.marital_status || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Members of your household in ehad?</label>
                <p className="text-sm text-gray-900">{request.household_members_in_ehad ?? "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consistent in Wazaif?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.consistent_in_wazaif) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.consistent_in_wazaif) ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consistent in your Prayers?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.consistent_in_prayers) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.consistent_in_prayers) ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Which Prayer(s) do you miss?</label>
                <p className="text-sm text-gray-900">
                  {Array.isArray(request.missed_prayers) && request.missed_prayers.length > 0
                    ? request.missed_prayers.join(", ")
                    : "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Do you make up for the missed prayer(s)?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.makes_up_missed_prayers) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.makes_up_missed_prayers) ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nawafil</label>
                <p className="text-sm text-gray-900">{request.nawafil ?? "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Can you read the Quran?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.can_read_quran) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.can_read_quran) ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consistent in praying Ishraq?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.consistent_in_ishraq) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.consistent_in_ishraq) ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consistent in Tahajjud prayer?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.consistent_in_tahajjud) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.consistent_in_tahajjud) ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount of Durood Shareef read?</label>
                <p className="text-sm text-gray-900">{request.amount_of_durood ?? "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Do you listen taleem shareef daily?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.listens_taleem_daily) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.listens_taleem_daily) ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">When was the last time you did wazaif tarteeb?</label>
                <p className="text-sm text-gray-900">{request.last_wazaif_tarteeb || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How often do you visit Multan Shareef?</label>
                <p className="text-sm text-gray-900">{request.multan_visit_frequency || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How often do you attend your local Mehfil?</label>
                <p className="text-sm text-gray-900">{request.mehfil_attendance_frequency || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Do you read your current wazaif with ease?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.reads_current_wazaif_with_ease) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.reads_current_wazaif_with_ease) ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Will you able to read additional wazaif if given?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.able_to_read_additional_wazaif) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.able_to_read_additional_wazaif) ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How long have you been consistently reading your wazaif and kept in contact with silsila?</label>
                <p className="text-sm text-gray-900">{request.wazaif_consistency_duration || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Do you do dum/taweez?</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(request.does_dum_taweez) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {parsedBoolean(request.does_dum_taweez) ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Wazaif Quantities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Please complete the quantity of the No.8 Card Wazaif you are reading below:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ["kalimah_quantity", "Kalimah (Fee qulli Lamha-tin)"],
                ["allah_quantity", "Allah"],
                ["laa_ilaaha_illallah_quantity", "Laa ilaaha illallah"],
                ["sallallahu_alayhi_wasallam_quantity", "Sallallahu alayhi wasallam (Darood Shareef)"],
                ["astagfirullah_quantity", "Astagfirullah"],
                ["ayat_ul_kursi_quantity", "Ayat-ul-Kursi"],
                ["dua_e_talluq_quantity", "Dua-e-Talluq"],
                ["subhanallah_quantity", "Subhanallah"],
                ["dua_e_waswasey_quantity", "Dua-e-Waswasey"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <p className="text-sm text-gray-900">{(request as any)[field] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Wazaif Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Wazaif Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please provide any other wazaif that you are reading
                </label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{request.other_wazaif || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please list the names of the wazaif you are not able to read from the list above
                </label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{request.wazaif_not_reading || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please list any additional wazaif you are reading in addition to the above list
                </label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{request.additional_wazaif_reading || "—"}</p>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <p className="text-sm text-gray-900">{request.zone?.title_en || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mehfil</label>
                <p className="text-sm text-gray-900">
                  {request.mehfilDirectory
                    ? `#${request.mehfilDirectory.mehfil_number} - ${request.mehfilDirectory.name_en}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Record Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-sm text-gray-900">{formatDate(request.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <p className="text-sm text-gray-900">—</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <p className="text-sm text-gray-900">{formatDate(request.updated_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
                <p className="text-sm text-gray-900">—</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Search Resources</h3>
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleSearchTypeChange(SEARCH_TYPES.TALEEMAT)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      searchType === SEARCH_TYPES.TALEEMAT
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Taleemat
                  </button>
                  <button
                    onClick={() => handleSearchTypeChange(SEARCH_TYPES.WAZAIF)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      searchType === SEARCH_TYPES.WAZAIF
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Wazaif
                  </button>
                  <button
                    onClick={() => handleSearchTypeChange(SEARCH_TYPES.MEHFILS)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      searchType === SEARCH_TYPES.MEHFILS
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Mehfils
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        performSearch();
                      }
                    }}
                    placeholder="Search..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => performSearch()}
                    disabled={searchLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Search
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {searchLoading && searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No results found</div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((resource) => {
                      const key = `${searchType}-${resource.id}`;
                      const isSelected = selectedResources.has(key);
                      return (
                        <label
                          key={resource.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleResourceSelection(resource.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{resource.title || resource.name}</p>
                            {resource.description && (
                              <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                    {hasMoreResults && (
                      <button
                        onClick={() => performSearch(true)}
                        disabled={searchLoading}
                        className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                      >
                        {searchLoading ? "Loading..." : "Load More"}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelectedResources}
                  disabled={selectedResources.size === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Selected ({selectedResources.size})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Save as Template</h3>
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setNewTemplateTitle("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  placeholder="Enter template title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setNewTemplateTitle("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!newTemplateTitle.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionWrapper>
  );
};

export default AdminTarteebRequestDetailPage;
