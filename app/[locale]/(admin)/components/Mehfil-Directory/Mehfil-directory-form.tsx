"use client";

import {
  useAddMehfilDirectoryMutation,
  useUpdateMehfilDirectoryMutation,
} from "../../../../../store/slicers/mehfildirectoryApi";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { useEffect } from "react";
import { MehfilFormData, Zone } from "../../../../types/Mehfil-Directory";
import { useToast } from "@/hooks/useToast";
import { Button, Form, Input, Select, Row, Col, Card } from "antd";
import { ArrowLeft, X } from "lucide-react";

export function MehfilDirectoryForm({ editData, onCancel }) {
  const { data: zonesData, isLoading: isZonesLoading } = useFetchZonesQuery({
    per_page: 1000,
  });
  const [addMehfilDirectory, { isLoading, error: apiError }] =
    useAddMehfilDirectoryMutation();
  const [updateMehfilDirectory] = useUpdateMehfilDirectoryMutation();
  const { showError, showSuccess } = useToast();
  const [form] = Form.useForm();

  const ALL_ZONES = zonesData?.data || [];
  const zoneOptions = ALL_ZONES.map((zone: Zone) => ({
    label: zone.title_en,
    value: zone.id,
  }));

  const statusOptions = [
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
  ];

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        is_published: editData.is_published ?? 0,
        zone_id: editData.zone_id ?? 0,
        mehfil_number: editData.mehfil_number ?? "",
        name_en: editData.name_en ?? "",
        name_ur: editData.name_ur ?? "",
        address_en: editData.address_en ?? "",
        address_ur: editData.address_ur ?? "",
        city_en: editData.city_en ?? "",
        city_ur: editData.city_ur ?? "",
        country_en: editData.country_en ?? "",
        country_ur: editData.country_ur ?? "",
        google_location: editData.google_location ?? "",
        mediacell_co: editData.mediacell_co ?? "",
        co_phone_number: editData.co_phone_number ?? "",
        zimdar_bhai: editData.zimdar_bhai ?? "",
        zimdar_bhai_phone_number: editData.zimdar_bhai_phone_number ?? "",
        zimdar_bhai_phone_number_2: editData.zimdar_bhai_phone_number_2 ?? "",
        zimdar_bhai_phone_number_3: editData.zimdar_bhai_phone_number_3 ?? "",
        sarkari_rent: editData.sarkari_rent ?? "",
        mehfil_open: editData.mehfil_open ?? "",
        ipad_serial_number: editData.ipad_serial_number ?? "",
        description: editData.description ?? "",
      });
    } else {
      form.resetFields();
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (editData?.id) {
        const result = await updateMehfilDirectory({
          id: editData.id,
          ...values,
        }).unwrap();
        console.log("Update response:", result);
        onCancel();
        showSuccess("Mehfil addresses updated");
      } else {
        const result = await addMehfilDirectory(values).unwrap();
        console.log("Add response:", result);
        onCancel();
        showSuccess("Mehfil addresses created");
      }
      form.resetFields();
    } catch (err) {
      console.error("API error:", err);
      showError(err?.data?.message || "Operation failed");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {editData ? "Edit Mehfil Directory" : "Add Mehfil Directory"}
            </h1>
            <p className="text-gray-600 text-sm">
              {editData
                ? "Update mehfil directory information"
                : "Create a new mehfil directory entry"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              <ArrowLeft size={14} />
              Back
            </Button>
            <Button
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              is_published: 0,
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="is_published"
                  label="Published"
                  rules={[
                    { required: true, message: "Published status is required" },
                  ]}
                >
                  <Select placeholder="Select published status">
                    {statusOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="zone_id"
                  label="Zone"
                  rules={[{ required: true, message: "Zone is required" }]}
                >
                  <Select placeholder="Select zone" loading={isZonesLoading}>
                    {zoneOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="mehfil_number"
                  label="Mehfil Number"
                  rules={[
                    { required: true, message: "Mehfil number is required" },
                  ]}
                >
                  <Input placeholder="Enter mehfil number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="name_en"
                  label="Mehfil Name (English)"
                  rules={[
                    { required: true, message: "English name is required" },
                  ]}
                >
                  <Input placeholder="Enter English name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="name_ur"
                  label="Mehfil Name (Urdu)"
                  rules={[{ required: true, message: "Urdu name is required" }]}
                >
                  <Input placeholder="اردو نام درج کریں" dir="rtl" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="address_en"
                  label="Address (English)"
                  rules={[
                    { required: true, message: "English address is required" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter English address"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="address_ur"
                  label="Address (Urdu)"
                  rules={[
                    { required: true, message: "Urdu address is required" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="اردو پتہ درج کریں"
                    dir="rtl"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="city_en"
                  label="City (English)"
                  rules={[
                    { required: true, message: "English city is required" },
                  ]}
                >
                  <Input placeholder="Enter English city" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="city_ur"
                  label="City (Urdu)"
                  rules={[{ required: true, message: "Urdu city is required" }]}
                >
                  <Input placeholder="اردو شہر درج کریں" dir="rtl" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="country_en"
                  label="Country (English)"
                  rules={[
                    { required: true, message: "English country is required" },
                  ]}
                >
                  <Input placeholder="Enter English country" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="country_ur"
                  label="Country (Urdu)"
                  rules={[
                    { required: true, message: "Urdu country is required" },
                  ]}
                >
                  <Input placeholder="اردو ملک درج کریں" dir="rtl" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="mediacell_co" label="Medical CO">
                  <Input placeholder="Enter medical CO" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="co_phone_number" label="CO Phone Number">
                  <Input placeholder="Enter CO phone number" maxLength={11} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="zimdar_bhai" label="Zimdar Bhai">
                  <Input placeholder="Enter zimdar bhai name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="zimdar_bhai_phone_number"
                  label="Zimdar Bhai Phone Number"
                >
                  <Input
                    placeholder="Enter zimdar bhai phone number"
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="zimdar_bhai_phone_number_2"
                  label="Zimdar Bhai Phone Number 2"
                >
                  <Input
                    placeholder="Enter second phone number"
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="zimdar_bhai_phone_number_3"
                  label="Zimdar Bhai Phone Number 3"
                >
                  <Input
                    placeholder="Enter third phone number"
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="sarkari_rent" label="Sarkari / Rent">
                  <Input placeholder="Enter sarkari/rent information" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="mehfil_open" label="Mehfil Timing">
                  <Input placeholder="Enter mehfil timing" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="ipad_serial_number" label="iPad Serial Number">
                  <Input placeholder="Enter iPad serial number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="google_location" label="Google Location">
                  <Input placeholder="https://goo.gl/maps/hGAUHixYGv1VQdMm8" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} placeholder="Enter description" />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  {editData ? "Update" : "Create"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
