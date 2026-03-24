"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import {
  useAddCommitteeMemberMutation,
  useDeleteCommitteeMemberMutation,
  useFetchCommitteeMembersQuery,
  useFetchCommitteeUserOptionsQuery,
  useUpdateCommitteeMemberMutation,
} from "../../../../../store/slicers/committeesApi";
import type { CommitteeMember } from "@/types/committee";
import { Button, Form, Input, Modal, Select } from "antd";
import { ArrowLeft, Search, Trash2, UserPlus, Users } from "lucide-react";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

interface CommitteeMembersProps {
  committeeId: string | number;
  committeeName?: string;
  onBack: () => void;
}

export function CommitteeMembers({ committeeId, committeeName, onBack }: CommitteeMembersProps) {
  const { showError, showSuccess } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const debouncedSearch = useDebounce(search, 400);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [userSearch, setUserSearch] = useState("");
  const debouncedUserSearch = useDebounce(userSearch, 300);

  const { data, isLoading, refetch } = useFetchCommitteeMembersQuery({
    committeeId,
    page,
    size,
    search: debouncedSearch,
  });
  const { data: userOptionsData, isFetching: isUsersLoading } = useFetchCommitteeUserOptionsQuery({
    search: debouncedUserSearch,
    size: 30,
  });

  const [addMember, { isLoading: adding }] = useAddCommitteeMemberMutation();
  const [updateMember, { isLoading: updating }] = useUpdateCommitteeMemberMutation();
  const [deleteMember, { isLoading: deleting }] = useDeleteCommitteeMemberMutation();

  const members = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / size) || 1;

  const userOptions = useMemo(
    () =>
      (userOptionsData?.data ?? []).map((u) => ({
        label: `${u.name}${u.email ? ` (${u.email})` : ""}`,
        value: u.id,
      })),
    [userOptionsData],
  );

  const handleAdd = async (values: { user_id: number; role: "admin" | "member"; duty?: string }) => {
    try {
      const res = await addMember({
        committeeId,
        user_id: Number(values.user_id),
        role: values.role,
        duty: values.duty || null,
      }).unwrap();
      if (!res.success) {
        showError(res.message || "Failed to add member.");
        return;
      }
      showSuccess("Member added successfully.");
      setShowAddModal(false);
      addForm.resetFields();
      await refetch();
    } catch (err: unknown) {
      showError((err as { data?: { message?: string }; message?: string })?.data?.message || "Failed to add member.");
    }
  };

  const openEdit = (member: CommitteeMember) => {
    setSelectedMember(member);
    editForm.setFieldsValue({
      role: member.role,
      duty: member.duty || "",
    });
    setShowEditModal(true);
  };

  const handleEdit = async (values: { role: "admin" | "member"; duty?: string }) => {
    if (!selectedMember) return;
    try {
      const res = await updateMember({
        committeeId,
        memberId: selectedMember.id,
        role: values.role,
        duty: values.duty || null,
      }).unwrap();
      if (!res.success) {
        showError(res.message || "Failed to update member.");
        return;
      }
      showSuccess("Member updated successfully.");
      setShowEditModal(false);
      setSelectedMember(null);
      await refetch();
    } catch (err: unknown) {
      showError((err as { data?: { message?: string }; message?: string })?.data?.message || "Failed to update member.");
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    try {
      const res = await deleteMember({
        committeeId,
        memberId: selectedMember.id,
      }).unwrap();
      if (!res.success) {
        showError(res.message || "Failed to remove member.");
        return;
      }
      showSuccess("Member removed successfully.");
      setShowDeleteDialog(false);
      setSelectedMember(null);
      await refetch();
    } catch (err: unknown) {
      showError((err as { data?: { message?: string }; message?: string })?.data?.message || "Failed to remove member.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Committee Members</h1>
            <p className="text-gray-600 mt-1">
              {committeeName ? `Manage members for: ${committeeName}` : "Manage committee members"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button icon={<ArrowLeft size={14} />} onClick={onBack}>
              Back to Committees
            </Button>
            <Button type="primary" icon={<UserPlus size={14} />} onClick={() => setShowAddModal(true)}>
              Add Member
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search members..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600">Loading members...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added At</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Users className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      No committee members found.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{m.user?.name || "Unknown User"}</div>
                        <div className="text-xs text-gray-500">{m.user?.email || ""}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            m.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {m.role === "admin" ? "Admin" : "Member"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{m.duty || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {m.created_at ? new Date(m.created_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="small" onClick={() => openEdit(m)}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            danger
                            icon={<Trash2 size={14} />}
                            onClick={() => {
                              setSelectedMember(m);
                              setShowDeleteDialog(true);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {members.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Add Committee Member"
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onOk={() => addForm.submit()}
        okText="Add Member"
        confirmLoading={adding}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="user_id" label="User" rules={[{ required: true, message: "Please select a user" }]}>
            <Select
              showSearch
              filterOption={false}
              onSearch={(value) => setUserSearch(value)}
              options={userOptions}
              loading={isUsersLoading}
              placeholder="Search and select user"
            />
          </Form.Item>
          <Form.Item name="role" label="Role" initialValue="member">
            <Select
              options={[
                { label: "Member", value: "member" },
                { label: "Admin", value: "admin" },
              ]}
            />
          </Form.Item>
          <Form.Item name="duty" label="Duty">
            <Input placeholder="Optional duty (e.g. Treasurer)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Committee Member"
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        onOk={() => editForm.submit()}
        okText="Update Member"
        confirmLoading={updating}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: "Please select a role" }]}>
            <Select
              options={[
                { label: "Member", value: "member" },
                { label: "Admin", value: "admin" },
              ]}
            />
          </Form.Item>
          <Form.Item name="duty" label="Duty">
            <Input placeholder="Optional duty" />
          </Form.Item>
        </Form>
      </Modal>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="Remove Committee Member"
        message={`Are you sure you want to remove "${selectedMember?.user?.name || "this member"}" from committee?`}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedMember(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleting}
        confirmText="Remove"
      />
    </div>
  );
}

