"use client";

import { useEffect } from "react";
import { Parhaiyan } from "@/app/types/Parhaiyan";
import moment from "moment";
import { useToast } from "@/hooks/useToast";
import {
  useCreateParhaiyanMutation,
  useUpdateParhaiyanMutation,
} from "@/store/slicers/parhaiyanApi";
import { ArrowLeft, X } from "lucide-react";
import { Button, Form, Input, Select, Row, Col, Card } from "antd";

interface ParhaiyanFormProps {
  parhaiyan?: Parhaiyan;
  open: boolean;
  onClose: () => void;
}

type FormData = {
  title_en: string;
  title_ur: string;
  description_en: string;
  description_ur: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  url_slug: string | undefined;
};

export function ParhaiyanForm({
  parhaiyan,
  open,
  onClose,
}: ParhaiyanFormProps) {
  const [form] = Form.useForm();
  const { showError, showSuccess } = useToast();

  // Generate clean URL slug from title and year
  const generateUrlSlug = (
    titleEn: string | undefined,
    titleUr: string | undefined
  ): string | undefined => {
    const year = "2025"; // Can be made dynamic if needed
    const combined = `${titleEn} ${titleUr} ${year}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    return combined || "parhaiyan";
  };

  // Reset form when parhaiyan changes
  useEffect(() => {
    if (parhaiyan) {
      form.setFieldsValue({
        title_en: parhaiyan.title_en,
        title_ur: parhaiyan.title_ur,
        description_en: parhaiyan.description_en,
        description_ur: parhaiyan.description_ur,
        start_date: parhaiyan.start_date
          ? moment(parhaiyan.start_date).format("YYYY-MM-DD")
          : "",
        end_date: parhaiyan.end_date
          ? moment(parhaiyan.end_date).format("YYYY-MM-DD")
          : "",
        is_active: parhaiyan.is_active,
        url_slug:
          parhaiyan.url_slug ||
          generateUrlSlug(parhaiyan?.title_en, parhaiyan.title_ur),
      });
    } else {
      form.resetFields();
    }
  }, [parhaiyan, form]);

  // Auto-generate URL slug when titles change
  const handleTitleChange = (field: string, value: string) => {
    const currentValues = form.getFieldsValue();
    if (field === "title_en" || field === "title_ur") {
      const titleEn = field === "title_en" ? value : currentValues.title_en;
      const titleUr = field === "title_ur" ? value : currentValues.title_ur;
      const newSlug = generateUrlSlug(titleEn, titleUr);
      form.setFieldsValue({ url_slug: newSlug });
    }
  };

  const [createParhaiyan, { isLoading: isCreating }] =
    useCreateParhaiyanMutation();
  const [updateParhaiyan, { isLoading: isUpdating }] =
    useUpdateParhaiyanMutation();

  const handleSubmit = async (values: FormData) => {
    try {
      // Final slug generation in case it wasn't set
      if (!values.url_slug) {
        values.url_slug = generateUrlSlug(values.title_en, values.title_ur);
      }

      if (parhaiyan && typeof parhaiyan.id === "number") {
        await updateParhaiyan({ id: parhaiyan.id, data: values }).unwrap();
        showSuccess("Parhaiyan updated successfully.");
      } else {
        await createParhaiyan(values).unwrap();
        showSuccess("Parhaiyan created successfully.");
      }
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      showError(
        "Failed to " + (parhaiyan ? "update" : "create") + " parhaiyan."
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-[calc(60vw-50px)] max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {parhaiyan ? "Edit Parhaiyan" : "Create Parhaiyan"}
            </h1>
            <p className="text-gray-600 text-sm">
              {parhaiyan
                ? "Update parhaiyan information"
                : "Create a new parhaiyan session"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <Form
            key="parhaiyan-form"
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            preserve={false}
            initialValues={{
              is_active: false,
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="title_en"
                  label="Title (English)"
                  rules={[
                    { required: true, message: "English title is required" },
                  ]}
                >
                  <Input
                    placeholder="Enter English title"
                    onChange={(e) =>
                      handleTitleChange("title_en", e.target.value)
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="title_ur"
                  label="Title (Urdu)"
                  rules={[
                    { required: true, message: "Urdu title is required" },
                  ]}
                >
                  <Input
                    placeholder="اردو عنوان درج کریں"
                    dir="rtl"
                    onChange={(e) =>
                      handleTitleChange("title_ur", e.target.value)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="url_slug" label="URL Slug">
              <Input
                placeholder="Auto-generated URL slug"
                disabled
                className="bg-gray-50"
              />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="description_en"
                  label="Description (English)"
                  rules={[
                    {
                      required: true,
                      message: "English description is required",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter English description"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="description_ur"
                  label="Description (Urdu)"
                  rules={[
                    { required: true, message: "Urdu description is required" },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="اردو تفصیل درج کریں"
                    dir="rtl"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="start_date"
                  label="Start Date"
                  rules={[
                    { required: true, message: "Start date is required" },
                  ]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="end_date"
                  label="End Date"
                  rules={[{ required: true, message: "End date is required" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="is_active" label="Status">
              <Select placeholder="Select status">
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button onClick={handleCancel}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                >
                  {parhaiyan ? "Update" : "Create"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
