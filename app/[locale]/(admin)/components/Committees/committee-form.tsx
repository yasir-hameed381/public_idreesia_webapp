"use client";

import { useEffect } from "react";
import {
  useAddCommitteeMutation,
  useUpdateCommitteeMutation,
  useGetParentCommitteesQuery,
} from "../../../../../store/slicers/committeesApi";
import { useToast } from "@/hooks/useToast";
import { Button, Form, Input, Select, Card, Checkbox } from "antd";
import { ArrowLeft } from "lucide-react";
import type { Committee, CommitteeFormValues } from "@/types/committee";

const { TextArea } = Input;

export interface CommitteeFormProps {
  editData?: Committee | null;
  onCancel: () => void;
}

export function CommitteeForm({ editData, onCancel }: CommitteeFormProps) {
  const { showError, showSuccess } = useToast();
  const [form] = Form.useForm<CommitteeFormValues>();
  const { data: parentsData } = useGetParentCommitteesQuery();
  const [addCommittee, { isLoading: addLoading }] = useAddCommitteeMutation();
  const [updateCommittee, { isLoading: updateLoading }] = useUpdateCommitteeMutation();

  const rawParents = Array.isArray(parentsData)
    ? parentsData
    : Array.isArray(parentsData?.data)
      ? parentsData.data
      : [];
  const parentOptions = rawParents
    .map((p: { id?: string | number; name?: string }) => ({
      id: p?.id != null ? String(p.id) : "",
      name: p?.name ?? "",
    }))
    .filter((p: { id: string; name: string }) => p.id !== "" && p.name !== "");
  const isEdit = !!editData?.id;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name ?? "",
        description: editData.description ?? undefined,
        is_active: editData.is_active !== false,
        parent_id:
          editData.parent_id != null ? String(editData.parent_id) : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ is_active: true });
    }
  }, [editData, form]);

  const handleSubmit = async (values: CommitteeFormValues) => {
    const normalizedParentId =
      values.parent_id != null && values.parent_id !== ""
        ? Number(values.parent_id)
        : null;

    try {
      if (isEdit && editData) {
        await updateCommittee({
          id: editData.id,
          body: {
            name: values.name,
            description: values.description ?? null,
            is_active: values.is_active,
            parent_id: normalizedParentId,
          },
        }).unwrap();
        showSuccess("Committee updated successfully.");
      } else {
        await addCommittee({
          name: values.name,
          description: values.description ?? null,
          is_active: values.is_active,
          parent_id: normalizedParentId,
        }).unwrap();
        showSuccess("Committee created successfully.");
      }
      onCancel();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string }; message?: string })?.data?.message ||
        (err as { message?: string })?.message ||
        "Operation failed.";
      showError(msg);
    }
  };

  const loading = addLoading || updateLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Committee" : "Create Committee"}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {isEdit ? "Update committee details" : "Create a new committee"}
            </p>
          </div>
          <Button
            onClick={onCancel}
            className="inline-flex items-center gap-2"
            icon={<ArrowLeft size={14} />}
          >
            Back to Committees
          </Button>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ is_active: true }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Name is required" }, { max: 255, message: "Max 255 characters" }]}
            >
              <Input placeholder="Committee name" autoFocus />
            </Form.Item>

            <Form.Item name="parent_id" label="Parent Committee">
              <Select
                placeholder="None (Parent Committee)"
                allowClear
                showSearch
                optionFilterProp="label"
                options={parentOptions
                  .filter((p) => !isEdit || p.id !== String(editData?.id))
                  .map((p) => ({ label: p.name, value: p.id }))}
              />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea rows={4} placeholder="Optional description" />
            </Form.Item>

            <Form.Item name="is_active" valuePropName="checked">
              <Checkbox>Active (visible and accessible to members)</Checkbox>
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? "Update Committee" : "Create Committee"}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
