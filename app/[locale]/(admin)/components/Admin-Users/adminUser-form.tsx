"use client";
import type React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AdminUsersService } from "@/services/AdminUser/admin-user-service";
import { fetchRoles } from "@/services/Roles/roles-service";
import { useFetchZonesQuery } from "@/store/slicers/zoneApi";
import { useFetchAddressQuery } from "@/store/slicers/mehfildirectoryApi";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  Button,
  Form,
  Input,
  Select,
  Checkbox,
  Row,
  Col,
  Divider,
  Card,
} from "antd";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import { Role } from "@/types/Role";

const { Option } = Select;

const createAdminUserSchema = (isEdit: boolean = false) =>
  yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    mobile_no: yup.string().required("Phone Number is required"),
    id_card_number: yup
      .string()
      .matches(/^[0-9]{13}$|^$/, "CNIC must be 13 digits"),
    father_name: yup.string().required("Father Name is required"),
    user_type: yup.string().required("User Type is required"),
    zone_id: yup.string().required("Zone is required"),
    mehfil_directory_id: yup.string().required("Mehfil is required"),
    ehad_year: yup.string().required("Ehad Year is required"),
    birth_year: yup.string().required("Birth Year is required"),
    address: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
    country: yup.string().required("Country is required"),
    role_id: isEdit
      ? yup.string().optional()
      : yup.string().required("Role is required"),
    password: isEdit
      ? yup.string().optional()
      : yup.string().required("Password is required"),
    confirmPassword: isEdit
      ? yup
          .string()
          .optional()
          .oneOf([yup.ref("password")], "Passwords must match")
      : yup
          .string()
          .oneOf([yup.ref("password")], "Passwords must match")
          .required("Confirm Password is required"),
    duty_type: yup.string().optional(),
    duty_days: yup.array().of(yup.string().required()).optional().default([]),
    is_zone_admin: yup.boolean().optional(),
    is_mehfil_admin: yup.boolean().optional(),
    is_super_admin: yup.boolean().optional(),
    is_region_admin: yup.boolean().optional(),
  });

interface AdminUserFormData {
  id?: number;
  name: string;
  email: string;
  mobile_no: string;
  phone_number?: string;
  id_card_number?: string;
  father_name: string;
  user_type: string;
  zone_id: string;
  mehfil_directory_id: string;
  ehad_year: string;
  birth_year: string;
  address: string;
  city: string;
  country: string;
  role_id?: string;
  role?: {
    id: number;
    name: string;
  };
  password?: string;
  confirmPassword?: string;
  duty_type?: string;
  duty_days: string[];
  is_zone_admin?: boolean;
  is_mehfil_admin?: boolean;
  is_super_admin?: boolean;
  is_region_admin?: boolean;
}

interface AdminUserFormProps {
  onSuccess: () => void;
  editingUser?: AdminUserFormData | null;
  onCancel?: () => void;
}

export function AdminUserForm({
  onSuccess,
  editingUser,
  onCancel,
}: AdminUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [form] = Form.useForm();
  const { hasPermission, isSuperAdmin, user } = usePermissions();

  const { data: zonesData } = useFetchZonesQuery({ per_page: 1000 });
  const { data: mehfilData } = useFetchAddressQuery({
    page: 1,
    size: 1000,
    zoneId: "",
    search: "",
  });
  const { showError, showSuccess } = useToast();

  const ALL_ZONES = zonesData?.data || [];
  const ALL_MEHFILS = mehfilData?.data || [];

  // Fetch roles
  const fetchRolesData = async () => {
    try {
      setIsLoadingRoles(true);
      const response = await fetchRoles({ size: 1000 });
      setRoles(response.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      showError("Failed to load roles");
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  // Permission checks
  const canCreateUsers =
    isSuperAdmin || hasPermission(PERMISSIONS.CREATE_USERS);
  const canEditUsers = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_USERS);
  const canAssignRoles =
    isSuperAdmin ||
    hasPermission(PERMISSIONS.ASSIGN_PERMISSIONS) ||
    user?.is_zone_admin; // Allow Zone Admins to assign roles

  // Debug logging for admin permissions
  console.log("🔐 Admin Permissions Check:", {
    isSuperAdmin,
    hasAssignPermissions: hasPermission(PERMISSIONS.ASSIGN_PERMISSIONS),
    isZoneAdmin: user?.is_zone_admin,
    canAssignRoles,
    userRole: user?.role?.name,
    userPermissions: user?.role?.permissions?.map((p) => p.name),
  });

  // Reset form when editing user changes
  useEffect(() => {
    if (editingUser) {
      form.setFieldsValue({
        ...editingUser,
        mobile_no: editingUser.phone_number || editingUser.mobile_no,
        role_id:
          editingUser.role_id?.toString() || editingUser.role?.id?.toString(),
      });
    } else {
      form.resetFields();
    }
  }, [editingUser, form]);

  const handleSubmit = async (values: AdminUserFormData) => {
    console.log("🚀 Form submission started");
    console.log("📝 Form values:", values);
    console.log("🔐 Permissions:", {
      canCreateUsers,
      canEditUsers,
      canAssignRoles,
      isEditing: !!editingUser,
    });

    if (!canCreateUsers && !editingUser) {
      showError("You don't have permission to create users");
      return;
    }

    if (!canEditUsers && editingUser) {
      showError("You don't have permission to edit users");
      return;
    }

    // Validate required fields
    const requiredFields = {
      name: values.name,
      email: values.email,
      father_name: values.father_name,
      address: values.address,
      city: values.city,
      country: values.country,
      user_type: values.user_type,
      zone_id: values.zone_id,
      mehfil_directory_id: values.mehfil_directory_id,
      birth_year: values.birth_year,
      ehad_year: values.ehad_year,
      ...(editingUser
        ? {}
        : { role_id: values.role_id, password: values.password }),
    };

    console.log("🔍 Required fields validation:", requiredFields);

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      showError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsLoading(true);
    try {
      // Map form fields to backend expected fields
      const formData = {
        name: values.name,
        email: values.email,
        father_name: values.father_name,
        phone_number: values.mobile_no, // Map mobile_no to phone_number for API
        id_card_number: values.id_card_number,
        address: values.address,
        birth_year: values.birth_year,
        ehad_year: values.ehad_year,
        mehfil_directory_id: values.mehfil_directory_id
          ? parseInt(values.mehfil_directory_id)
          : null,
        duty_days: values.duty_days || [],
        duty_type: values.duty_type,
        city: values.city,
        country: values.country,
        user_type: values.user_type,
        zone_id: values.zone_id ? parseInt(values.zone_id) : null,
        role_id: values.role_id ? parseInt(values.role_id) : null,
        is_zone_admin: values.is_zone_admin || false,
        is_mehfil_admin: values.is_mehfil_admin || false,
        is_super_admin: values.is_super_admin || false,
        is_region_admin: values.is_region_admin || false,
        ...(values.password && { password: values.password }),
      };

      console.log("📤 Sending data to API:", formData);

      if (editingUser) {
        console.log("🔄 Updating user with ID:", editingUser.id);
        await AdminUsersService.update(editingUser.id!, formData);
        showSuccess("Admin user updated successfully");
      } else {
        console.log("➕ Creating new user");
        await AdminUsersService.create(formData);
        showSuccess("Admin user created successfully");
      }

      console.log("✅ API call successful");
      onSuccess();
    } catch (error: any) {
      console.error("❌ API call failed:", error);
      showError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card title={editingUser ? "Edit Admin User" : "Create New Admin User"}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          duty_days: [],
          is_zone_admin: false,
          is_mehfil_admin: false,
          is_super_admin: false,
          is_region_admin: false,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="mobile_no"
              label="Phone Number"
              rules={[{ required: true, message: "Phone number is required" }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="id_card_number"
              label="CNIC"
              rules={[
                {
                  pattern: /^[0-9]{13}$|^$/,
                  message: "CNIC must be 13 digits",
                },
              ]}
            >
              <Input placeholder="Enter CNIC (13 digits)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="father_name"
              label="Father's Name"
              rules={[{ required: true, message: "Father's name is required" }]}
            >
              <Input placeholder="Enter father's name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="user_type"
              label="User Type"
              rules={[{ required: true, message: "User type is required" }]}
            >
              <Select placeholder="Select user type">
                <Option value="admin">karkun</Option>
                <Option value="moderator">Ehad karkun</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="zone_id"
              label="Zone"
              rules={[{ required: true, message: "Zone is required" }]}
            >
              <Select placeholder="Select zone">
                {ALL_ZONES.map((zone: any) => (
                  <Option key={zone.id} value={zone.id.toString()}>
                    {zone.title_en}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="mehfil_directory_id"
              label="Mehfil"
              rules={[{ required: true, message: "Mehfil is required" }]}
            >
              <Select placeholder="Select mehfil">
                {ALL_MEHFILS.map((mehfil: any) => (
                  <Option key={mehfil.id} value={mehfil.id.toString()}>
                    {mehfil.address_en}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="role_id"
              label="Role"
              rules={[{ required: !editingUser, message: "Role is required" }]}
            >
              <Select
                placeholder="Select role"
                loading={isLoadingRoles}
                notFoundContent={
                  isLoadingRoles ? "Loading roles..." : "No roles found"
                }
                allowClear={!!editingUser}
              >
                {roles.map((role: Role) => (
                  <Option key={role.id} value={role.id.toString()}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ehad_year"
              label="Ehad Year"
              rules={[{ required: true, message: "Ehad year is required" }]}
            >
              <Input placeholder="Enter ehad year" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="birth_year"
              label="Birth Year"
              rules={[{ required: true, message: "Birth year is required" }]}
            >
              <Input placeholder="Enter birth year" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: "Address is required" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter full address" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: "City is required" }]}
            >
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: "Country is required" }]}
            >
              <Input placeholder="Enter country" />
            </Form.Item>
          </Col>
        </Row>

        {!editingUser && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Password is required" }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                rules={[
                  { required: true, message: "Confirm password is required" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm password" />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item name="duty_type" label="Duty Type">
          <Input placeholder="e.g., Security, Teaching, Administration" />
        </Form.Item>

        <Form.Item name="duty_days" label="Duty Days">
          <Checkbox.Group>
            <Row gutter={16}>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <Col span={8} key={day}>
                  <Checkbox value={day}>{day}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        {canAssignRoles && (
          <>
            <Divider>Admin Permissions</Divider>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="is_zone_admin" valuePropName="checked">
                  <Checkbox>Zone Admin</Checkbox>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="is_mehfil_admin" valuePropName="checked">
                  <Checkbox>Mehfil Admin</Checkbox>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="is_region_admin" valuePropName="checked">
                  <Checkbox>Region Admin</Checkbox>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="is_super_admin" valuePropName="checked">
                  <Checkbox>Super Admin</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
