"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import KhatService from "@/services/KhatService";
import ResponseTemplatesService from "@/services/ResponseTemplates";
import {
  JawabLink,
  Khat,
  KhatStatus,
  KhatQuestion,
  ResponseTemplate,
  SearchResource,
} from "@/types/khat";
import { Mail, Phone, MessageCircle, Search, Plus, X, Info } from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

const statusOptions: { value: KhatStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-review", label: "In Review" },
  { value: "awaiting-response", label: "Awaiting Response" },
  { value: "closed", label: "Closed" },
];

const SEARCH_LIMIT = 50;
const SEARCH_TYPES = {
  TALEEMAT: "taleem",
  WAZAIF: "wazaif",
  MEHFILS: "mehfil",
} as const;

type SearchType = typeof SEARCH_TYPES[keyof typeof SEARCH_TYPES];

const AdminKhatDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const khatId = Number(params?.id);

  const [khat, setKhat] = useState<Khat | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<KhatStatus>("pending");
  const [jawab, setJawab] = useState("");
  const [notes, setNotes] = useState("");
  const [jawabLinks, setJawabLinks] = useState<JawabLink[]>([]);
  const [questions, setQuestions] = useState<KhatQuestion[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
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

  // Delete question modal state
  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  const canCreateTemplate = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_RESPONSE_TEMPLATES);

  useEffect(() => {
    if (!Number.isFinite(khatId)) {
      toast.error("Invalid khat reference");
      setLoading(false);
      return;
    }
    loadKhat();
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khatId]);

  const loadKhat = async () => {
    if (!Number.isFinite(khatId)) return;
    try {
      setLoading(true);
      const data = await KhatService.getKhatById(khatId);
      setKhat(data);
      setStatus((data.status as KhatStatus) || "pending");
      setJawab(data.jawab || "");
      setNotes(data.notes || "");
      setJawabLinks((data.jawab_links as JawabLink[]) || []);

      // Load questions
      try {
        const questionsData = await KhatService.getQuestions(khatId);
        setQuestions(questionsData);
      } catch (error) {
        console.error("Failed to load questions", error);
      }
    } catch (error) {
      console.error("Failed to load khat", error);
      toast.error("Unable to load khat details");
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

  const filteredLinks = useMemo(
    () => jawabLinks.filter((link) => link.title && link.url),
    [jawabLinks]
  );

  const handleSave = async () => {
    if (!Number.isFinite(khatId)) return;

    try {
      setSaving(true);
      await KhatService.updateJawab(khatId, {
        status,
        jawab,
        jawab_links: filteredLinks,
        notes,
      });
      toast.success("Khat record updated successfully");
      loadKhat();
    } catch (error: any) {
      console.error("Failed to save khat", error);
      toast.error(error?.response?.data?.message || "Unable to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Question management
  const handleAddQuestion = () => {
    if (!newQuestion.trim() || newQuestion.trim().length < 10) {
      toast.error("Question must be at least 10 characters long");
      return;
    }
    setPendingQuestions((prev) => [...prev, newQuestion.trim()]);
    setNewQuestion("");
  };

  const handleRemovePendingQuestion = (index: number) => {
    setPendingQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSendQuestions = async () => {
    if (pendingQuestions.length === 0) {
      toast.error("No questions to send");
      return;
    }

    if (!khat?.email) {
      toast.error("Cannot send questions - no email address on file");
      return;
    }

    try {
      // Add all pending questions first
      const questionIds: number[] = [];
      for (const questionText of pendingQuestions) {
        const question = await KhatService.addQuestion(khatId, questionText);
        questionIds.push(question.id);
      }

      // Send questions
      await KhatService.sendQuestions(khatId, questionIds);
      toast.success("Questions sent successfully");
      setPendingQuestions([]);
      loadKhat();
    } catch (error: any) {
      console.error("Failed to send questions", error);
      toast.error(error?.response?.data?.message || "Failed to send questions");
    }
  };

  const handleDeleteQuestionClick = (questionId: number) => {
    setQuestionToDelete(questionId);
    setShowDeleteQuestionModal(true);
  };

  const handleConfirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      await KhatService.deleteQuestion(questionToDelete);
      toast.success("Question deleted successfully");
      setShowDeleteQuestionModal(false);
      setQuestionToDelete(null);
      loadKhat();
    } catch (error: any) {
      console.error("Failed to delete question", error);
      toast.error(error?.response?.data?.message || "Failed to delete question");
    }
  };

  // Template management
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
          title: resource.title_en || "",
          url: `${window.location.origin}${url}`,
        });
      }
    });

    setJawabLinks((prev) => [...prev, ...newLinks]);
    toast.success(`${newLinks.length} resource(s) added`);
    setShowSearchModal(false);
    setSelectedResources(new Set());
  };

  if (!Number.isFinite(khatId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Invalid khat reference.</p>
      </div>
    );
  }

  const previousSubmissionsCount = 0; // TODO: Calculate from API if needed

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

  const parsedBoolean = (value?: boolean | null) => {
    if (value === null || value === undefined) return false;
    return Boolean(value);
  };

  const formatList = (list?: string[] | null) => {
    if (!list || list.length === 0) return "None";
    return list.join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading khat details...</p>
          </div>
        ) : !khat ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-600">Khat submission not found.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Khat Details
                  </h1>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        khat.type === "khat"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {khat.type === "khat" ? "Khat" : "Masail"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : status === "in-review"
                          ? "bg-green-100 text-green-800"
                          : status === "awaiting-response"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {statusOptions.find((s) => s.value === status)?.label || status}
                    </span>
                    {previousSubmissionsCount > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {previousSubmissionsCount} previous submission
                        {previousSubmissionsCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        First submission
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href="/admin/khatoot"
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  ← Back to Khatoot
                </Link>
              </div>
            </div>

            {/* Description/Issue */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description/Issue</h2>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{khat.description || "—"}</p>
            </div>

            {/* Response & Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Response & Actions</h2>

              {/* Template Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apply Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- Select a template --</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id.toString()}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jawab */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Jawab</label>
                <textarea
                  value={jawab}
                  onChange={(e) => setJawab(e.target.value)}
                  placeholder="Enter response..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Jawab Links */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taleemat/Wazaif Links
                </label>
                <div className="space-y-3">
                  {jawabLinks.length === 0 ? (
                    <p className="text-sm text-gray-500">
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
                            onChange={(e) => handleUpdateLink(index, "title", e.target.value)}
                            placeholder="Link Title (e.g., 8 No. Copy)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => handleUpdateLink(index, "url", e.target.value)}
                            placeholder="URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="mt-2 px-3 py-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2 mt-4">
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

              {/* Notes */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Info size={16} className="text-gray-500" />
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter internal notes..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as KhatStatus)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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

            {/* Questions & Answers */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions & Answers</h2>

              {/* Existing Questions */}
              {questions.length > 0 && (
                <div className="space-y-3 mb-6">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className={`border-l-4 pl-4 py-2 ${
                        question.answer ? "border-green-500" : "border-yellow-500"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{question.question}</p>
                          <span className="text-xs text-gray-500">
                            {question.askedBy?.name || "Unknown"} ·{" "}
                            {question.created_at
                              ? new Date(question.created_at).toLocaleString()
                              : ""}
                          </span>
                          {question.answer && (
                            <div className="mt-2 pl-3 border-l-4 border-gray-200">
                              <p className="text-sm text-gray-700">{question.answer}</p>
                              <span className="text-xs text-gray-500">
                                {question.answered_at
                                  ? new Date(question.answered_at).toLocaleString()
                                  : ""}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              question.answer
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {question.answer ? "Answered" : "Waiting"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestionClick(question.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Questions */}
              {pendingQuestions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {pendingQuestions.map((pendingQuestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 border-l-4 border-blue-500 pl-4 py-2 pr-2 bg-blue-50 rounded-r"
                    >
                      <p className="flex-1 text-sm text-gray-900">{pendingQuestion}</p>
                      <button
                        type="button"
                        onClick={() => handleRemovePendingQuestion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Question */}
              <div className="space-y-2">
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Plus size={16} />
                    Add Question
                  </button>
                </div>
                {pendingQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSendQuestions}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                  >
                    Send {pendingQuestions.length} Question{pendingQuestions.length > 1 ? "s" : ""}
                  </button>
                )}
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
                  <p className="text-sm text-gray-900">{khat.email || "—"}</p>
                  {khat.email && (
                    <a
                      href={`mailto:${khat.email}`}
                      className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mt-1"
                    >
                      <Mail size={14} />
                      Email
                    </a>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <p className="text-sm text-gray-900">{khat.phone_number || "—"}</p>
                  {khat.phone_number && (
                    <div className="flex items-center gap-3 mt-1">
                      <a
                        href={`tel:${khat.phone_number}`}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        <Phone size={14} />
                        Call
                      </a>
                      <a
                        href={`https://wa.me/${khat.phone_number.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-sm text-gray-900">{khat.full_name || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
                  <p className="text-sm text-gray-900">{khat.father_name || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <p className="text-sm text-gray-900">{khat.age || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <p className="text-sm text-gray-900">{khat.city || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-sm text-gray-900">{khat.address || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of Introducer to Silsila</label>
                  <p className="text-sm text-gray-900">{khat.introducer_name || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ehad Duration</label>
                  <p className="text-sm text-gray-900">{khat.ehad_duration || "—"}</p>
                </div>
              </div>
            </div>

            {/* Wazaif Quantities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Complete the quantity of Wazaif that you are reading:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  ["kalimah_quantity", "Kalimah (Fee qulli Lamha-tin)"],
                  ["allah_quantity", "Allah"],
                  ["laa_ilaaha_illallah_quantity", "Laa Ilaaha Illallah"],
                  ["sallallahu_alayhi_wasallam_quantity", "Sallallahu Alayhi Wasallam"],
                  ["astagfirullah_quantity", "Astagfirullah"],
                  ["ayat_ul_kursi_quantity", "Ayat-ul-Kursi"],
                  ["dua_e_talluq_quantity", "Dua-e-Talluq"],
                  ["dua_e_waswasey_quantity", "Dua-e-Waswasey"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <p className="text-sm text-gray-900">{(khat as any)[field] ?? 0}</p>
                  </div>
                ))}
              </div>
              {khat.additional_wazaif_reading && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    In addition to these, write the details of any wazaif, surahs, or nawafil that you are also reciting
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{khat.additional_wazaif_reading}</p>
                </div>
              )}
            </div>

            {/* Quran/Prayer Consistency */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quran/Prayer Consistency</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Can read the Quran?</label>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(khat.can_read_quran) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {parsedBoolean(khat.can_read_quran) ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consistent in Wazaif?</label>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(khat.consistent_in_wazaif) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {parsedBoolean(khat.consistent_in_wazaif) ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Makes up missed prayers?</label>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(khat.makes_up_missed_prayers) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {parsedBoolean(khat.makes_up_missed_prayers) ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Which Prayer(s) do you miss?</label>
                  <p className="text-sm text-gray-900">{formatList(khat.missed_prayers)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mehfil Attendance Frequency</label>
                  <p className="text-sm text-gray-900">{khat.mehfil_attendance_frequency || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consistent in Prayers?</label>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${parsedBoolean(khat.consistent_in_prayers) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {parsedBoolean(khat.consistent_in_prayers) ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Multan Visit Frequency</label>
                  <p className="text-sm text-gray-900">{khat.multan_visit_frequency || "0"}</p>
                </div>
              </div>
            </div>

            {/* Assignment Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <p className="text-sm text-gray-900">{khat.zone?.title_en || "—"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mehfil</label>
                  <p className="text-sm text-gray-900">
                    {khat.mehfilDirectory
                      ? `#${khat.mehfilDirectory.mehfil_number} - ${khat.mehfilDirectory.name_en}`
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
                  <p className="text-sm text-gray-900">{formatDate(khat.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                  <p className="text-sm text-gray-900">—</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                  <p className="text-sm text-gray-900">{formatDate(khat.updated_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
                  <p className="text-sm text-gray-900">—</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Resource Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Search Resources</h3>
                <button
                  type="button"
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
                  type="button"
                  onClick={() => performSearch()}
                  disabled={searchLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Search Results */}
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
                          <p className="font-medium text-gray-900">{resource.title_en}</p>
                          {resource.title_ur && (
                            <p className="text-sm text-gray-600 mt-1">{resource.title_ur}</p>
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
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
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
                type="button"
                onClick={() => {
                  setShowTemplateModal(false);
                  setNewTemplateTitle("");
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
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

      {/* Delete Question Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={showDeleteQuestionModal}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onClose={() => {
          setShowDeleteQuestionModal(false);
          setQuestionToDelete(null);
        }}
        onConfirm={handleConfirmDeleteQuestion}
      />
    </div>
  );
};

export default AdminKhatDetailPage;
