"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Copy, Link as LinkIcon, ExternalLink } from "lucide-react";
import TarteebRequestService, { TarteebRequest } from "@/services/TarteebRequests";

const TarteebRequestViewPage = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { user } = useAuth();

  const locale = (typeof pathname === "string" && pathname.split("/")[1]) || "en";

  const requestId = useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;
    if (Array.isArray(idParam)) {
      return parseInt(idParam[0], 10);
    }
    return parseInt(idParam, 10);
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<TarteebRequest | null>(null);
  const [trackingLink, setTrackingLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!requestId) {
      toast.error("Invalid request ID");
      router.push(`/${locale}/karkun-portal/tarteeb-requests`);
      return;
    }
    loadRequest();
  }, [requestId, router, locale]);

  const loadRequest = async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      const data = await TarteebRequestService.getTarteebRequestById(requestId);
      setRequest(data);

      // Generate tracking link (public link)
      // The hash_id should come from the API, but if not available, we'll use the ID
      // In Laravel, this uses route('public.tarteeb-request.details', $tarteebRequest->hash_id)
      // For now, we'll construct it based on the ID - backend should provide hash_id
      const baseUrl = window.location.origin;
      const hashId = (data as any).hash_id || requestId;
      setTrackingLink(`${baseUrl}/${locale}/tarteeb-request/${hashId}/details`);
    } catch (error: any) {
      console.error("Failed to load request", error);
      toast.error("Unable to load request details");
      router.push(`/${locale}/karkun-portal/tarteeb-requests`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, "");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Request not found</p>
          <Link
            href={`/${locale}/karkun-portal/tarteeb-requests`}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  // Parse jawab_links if it's a string
  let jawabLinks: Array<{ title: string; url: string }> = [];
  if (request.jawab_links) {
    if (typeof request.jawab_links === "string") {
      try {
        jawabLinks = JSON.parse(request.jawab_links);
      } catch (e) {
        console.error("Failed to parse jawab_links:", e);
        jawabLinks = [];
      }
    } else if (Array.isArray(request.jawab_links)) {
      jawabLinks = request.jawab_links;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center gap-2 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Tarteeb Request Details
              </h1>
              <span
                className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                  request.status
                )}`}
              >
                {getStatusLabel(request.status)}
              </span>
            </div>
            <Link
              href={`/${locale}/karkun-portal/tarteeb-requests`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Requests
            </Link>
          </div>

          {/* Tracking Link */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tracking Link
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={trackingLink}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                id="tracking-link"
              />
              <button
                onClick={() => copyToClipboard(trackingLink)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Copy size={16} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with the requester to track their request status
            </p>
          </div>

          {/* Jawab (Response) */}
          {request.jawab && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Response (Jawab)
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm whitespace-pre-wrap text-gray-700">
                  {request.jawab}
                </div>
              </div>

              {/* Jawab Links */}
              {jawabLinks.length > 0 && (
                <div className="mt-4">
                  <div className="space-y-2">
                    {jawabLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors group"
                      >
                        <LinkIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {link.title || link.url}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {link.url}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="mt-1 text-sm text-gray-900">{request.email}</div>
                <div className="flex gap-3 mt-2">
                  <a
                    href={`mailto:${request.email}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Mail size={14} />
                    Email
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {request.phone_number}
                </div>
                <div className="flex gap-3 mt-2">
                  <a
                    href={`tel:${request.phone_number}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Phone size={14} />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(request.phone_number)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assignment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {request.zone?.title_en || "—"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mehfil
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {request.mehfilDirectory
                    ? `#${request.mehfilDirectory.mehfil_number} - ${request.mehfilDirectory.name_en}`
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Record Information */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Record Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {request.created_at
                    ? new Date(request.created_at).toLocaleString()
                    : "—"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created By
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {(request as any).creator?.name || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarteebRequestViewPage;
