"use client";
import type React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegionService, Region } from "@/services/Region/region-service";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Card,
} from "antd";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const regionSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  description: yup.string().optional(),
  co: yup.string().optional(),
  primaryPhoneNumber: yup.string().optional(),
  secondaryPhoneNumber: yup.string().optional(),
});

interface RegionFormData {
  name: string;
  description?: string;
  co?: string;
  primaryPhoneNumber?: string;
  secondaryPhoneNumber?: string;
}

interface RegionFormProps {
  onSuccess: () => void;
  editingRegion?: Region | null;
  onCancel?: () => void;
}

export function RegionForm({
  onSuccess,
  editingRegion,
  onCancel,
}: RegionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const { hasPermission } = usePermissions();
  const { showError, showSuccess } = useToast();
  const router = useRouter();

  // Permission checks
  const canCreateRegions = hasPermission(PERMISSIONS.CREATE_REGIONS);
  const canEditRegions = hasPermission(PERMISSIONS.EDIT_REGIONS);

  // Reset form when editing region changes
  useEffect(() => {
    if (editingRegion) {
      form.setFieldsValue({
        name: editingRegion.name,
        description: editingRegion.description || "",
        co: editingRegion.co || "",
        primaryPhoneNumber: editingRegion.primary_phone_number || "",
        secondaryPhoneNumber: editingRegion.secondary_phone_number || "",
      });
    } else {
      form.resetFields();
    }
  }, [editingRegion, form]);

  const handleSubmit = async (values: RegionFormData) => {
    if (!canCreateRegions && !editingRegion) {
      showError("You don't have permission to create regions");
      return;
    }

    if (!canEditRegions && editingRegion) {
      showError("You don't have permission to edit regions");
      return;
    }

    setIsLoading(true);
    try {
      const formData = {
        name: values.name,
        description: values.description || undefined,
        co: values.co || undefined,
        primaryPhoneNumber: values.primaryPhoneNumber || undefined,
        secondaryPhoneNumber: values.secondaryPhoneNumber || undefined,
      };

      if (editingRegion) {
        await RegionService.update(editingRegion.id, formData);
        showSuccess("Region updated successfully");
      } else {
        await RegionService.create(formData);
        showSuccess("Region created successfully");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving region:", error);
      showError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    } else {
      router.push("/regions");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card
          title={
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {editingRegion ? "Edit Region" : "Create Region"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {editingRegion
                    ? "Update region details"
                    : "Create a new region"}
                </p>
              </div>
              <Button
                icon={<ArrowLeft size={16} />}
                onClick={handleCancel}
                type="default"
              >
                Back to Regions
              </Button>
            </div>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: "",
              description: "",
              co: "",
              primaryPhoneNumber: "",
              secondaryPhoneNumber: "",
            }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: "Name is required" }]}
                >
                  <Input placeholder="Enter region name" autoFocus />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="co" label="CO">
                  <Input placeholder="Enter CO" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="primaryPhoneNumber" label="Primary Phone Number">
                  <Input placeholder="Enter primary phone number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="secondaryPhoneNumber" label="Secondary Phone Number">
                  <Input placeholder="Enter secondary phone number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="description" label="Description">
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter description"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <div className="flex justify-end gap-3">
                <Button onClick={handleCancel} type="default">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  {editingRegion ? "Update Region" : "Create Region"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

