import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import {
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import * as api from "../api/company/api";
import * as industriesApi from "../api/industries/api";
import * as companySizesApi from "../api/companySizes/api";
import { useCustomToast } from "../utils/useCustomToast";

interface CompanyFormData {
  companyName: string;
  address: string;
  email: string;
  phoneNumber: string;
  industryId: number;
  sizeId: number;
  website: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword: string;
}

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCompany: (company: CompanyFormData) => void;
}

const AddCompanyModal = ({
  isOpen,
  onClose,
  onAddCompany,
}: AddCompanyModalProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [industryOptions, setIndustryOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(false);
  const [sizeOptions, setSizeOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const { showToast } = useCustomToast();

  // Fetch industries and company sizes from API
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return; // Only fetch when modal is open

      setIsLoadingIndustries(true);
      try {
        const industriesResponse = await industriesApi.getIndustries();
        if (industriesResponse.data && Array.isArray(industriesResponse.data)) {
          const industryOptions = industriesResponse.data.map(
            (industry: industriesApi.Industry) => ({
              value: industry.id,
              label: industry.name,
            })
          );
          setIndustryOptions(industryOptions);
        }
      } catch (error: any) {
        console.error("Failed to fetch industries:", error);
        showToast("error", "Failed to load industries. Using default options.");
        setIndustryOptions([
          { value: 1, label: "IT" },
          { value: 2, label: "Finance" },
          { value: 3, label: "Healthcare" },
          { value: 4, label: "Energy" },
          { value: 5, label: "Manufacturing" },
          { value: 6, label: "Retail" },
          { value: 7, label: "Education" },
          { value: 8, label: "Other" },
        ]);
      } finally {
        setIsLoadingIndustries(false);
      }

      setIsLoadingSizes(true);
      try {
        const sizesResponse = await companySizesApi.getCompanySizes();
        if (sizesResponse.data && Array.isArray(sizesResponse.data)) {
          const sizeOptions = sizesResponse.data.map(
            (size: companySizesApi.CompanySize) => ({
              value: size.id,
              label: size.sizeText,
            })
          );
          setSizeOptions(sizeOptions);
        }
      } catch (error: any) {
        console.error("Failed to fetch company sizes:", error);
        showToast(
          "error",
          "Failed to load company sizes. Using default options."
        );
        setSizeOptions([
          { value: 1, label: "1-50 employees" },
          { value: 2, label: "51-200 employees" },
          { value: 3, label: "201-1000 employees" },
          { value: 4, label: "1000+ employees" },
        ]);
      } finally {
        setIsLoadingSizes(false);
      }
    };

    fetchData();
  }, [isOpen]);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const payload: api.CreateCompanyPayload = {
        name: values.companyName,
        address: values.companyAddressHidden,
        email: values.companyEmailHidden,
        phone: values.companyPhoneHidden,
        websiteUrl: values.website,
        industryId: values.industryId,
        sizeId: values.sizeId,
        ownerName: values.ownerName,
        ownerEmail: values.ownerEmailHidden,
        ownerPhone: values.ownerPhoneHidden,
        ownerPassword: values.ownerPasswordHidden,
      };

      const response = await api.createCompany(payload);

      if (response.hasError) {
        showToast(
          "error",
          response.message || "Failed to create company. Please try again."
        );
        return;
      }

      onAddCompany(values);
      showToast("success", response.message || "Company added successfully!");
      form.resetFields();
      onClose();
    } catch (error: any) {
      showToast(
        "error",
        error?.message || "Failed to add company. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-1.5">
          <BankOutlined className="text-blue-600 text-sm" />
          <span className="text-base">Add New Company</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={520}
      destroyOnClose
      zIndex={1000}
    >
      <Form
        form={form}
        autoComplete="off"
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-3 overflow-y-auto max-h-[70vh] pr-2"
      >
        {/* Hidden dummy fields to trick Chrome */}
        <input
          type="text"
          name="fakeusernameremembered"
          style={{ display: "none" }}
        />
        <input
          type="password"
          name="fakepasswordremembered"
          style={{ display: "none" }}
        />

        {/* Company Name */}
        <Form.Item
          name="companyName"
          label="Company Name"
          rules={[{ required: true, message: "Please enter the company name" }]}
        >
          <Input
            autoComplete="off"
            prefix={<BankOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter company name"
            size="middle"
          />
        </Form.Item>

        {/* Company Address */}
        <Form.Item
          name="companyAddressHidden"
          label="Company Address"
          rules={[
            { required: true, message: "Please enter the company address" },
          ]}
        >
          <Input
            name="address_hidden"
            id="addr-field"
            autoComplete="new-password"
            prefix={<BankOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter company address"
            size="middle"
          />
        </Form.Item>

        {/* Company Email */}
        <Form.Item
          name="companyEmailHidden"
          label="Email Address"
          rules={[
            { required: true, message: "Please enter the email address" },
          ]}
        >
          <Input
            name="email_hidden"
            id="email-field"
            autoComplete="new-password"
            prefix={<MailOutlined className="text-gray-400 text-xs" />}
            placeholder="contact@company.com"
            size="middle"
          />
        </Form.Item>

        {/* Phone Number */}
        <Form.Item
          name="CompanyPhoneHidden"
          label={<span className="text-sm">Phone Number</span>}
          rules={[
            { required: true, message: "Please enter the phone number" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                // Remove all non-digit characters for validation
                const cleanNumber = value.replace(/\D/g, "");

                // Check if it's a valid Pakistani mobile number
                if (cleanNumber.startsWith("92") && cleanNumber.length === 12) {
                  const mobilePart = cleanNumber.substring(2);
                  if (mobilePart.match(/^[3][0-9]{9}$/)) {
                    return Promise.resolve();
                  }
                } else if (
                  cleanNumber.startsWith("0") &&
                  cleanNumber.length === 11
                ) {
                  const mobilePart = cleanNumber.substring(1);
                  if (mobilePart.match(/^[3][0-9]{9}$/)) {
                    return Promise.resolve();
                  }
                } else if (cleanNumber.length === 10) {
                  if (cleanNumber.match(/^[3][0-9]{9}$/)) {
                    return Promise.resolve();
                  }
                }

                return Promise.reject(
                  new Error(
                    "Please enter a valid Pakistani mobile number (e.g., +92-300-1234567, 0300-1234567, or 3001234567)"
                  )
                );
              },
            },
          ]}
        >
          <Input
            autoComplete="new-password"
            name="phone_hidden"
            id="phone-field"
            prefix={<PhoneOutlined className="text-gray-400 text-xs" />}
            placeholder="+92-300-1234567 or 0300-1234567"
            size="middle"
          />
        </Form.Item>

        {/* Industry */}
        <Form.Item
          name="industryId"
          label="Industry"
          rules={[{ required: true, message: "Please select an industry" }]}
        >
          <Select
            placeholder={
              isLoadingIndustries ? "Loading industries..." : "Select industry"
            }
            size="middle"
            options={industryOptions}
            loading={isLoadingIndustries}
            disabled={isLoadingIndustries}
            suffixIcon={<TeamOutlined className="text-xs" />}
          />
        </Form.Item>

        {/* Company Size */}
        <Form.Item
          name="sizeId"
          label="Company Size"
          rules={[{ required: true, message: "Please select company size" }]}
        >
          <Select
            placeholder={
              isLoadingSizes
                ? "Loading company sizes..."
                : "Select company size"
            }
            size="middle"
            options={sizeOptions}
            loading={isLoadingSizes}
            disabled={isLoadingSizes}
            suffixIcon={<TeamOutlined className="text-xs" />}
          />
        </Form.Item>

        {/* Website */}
        <Form.Item
          name="website"
          label="Website"
          rules={[{ required: true, message: "Please enter the website URL" }]}
        >
          <Input
            autoComplete="off"
            prefix={<GlobalOutlined className="text-gray-400 text-xs" />}
            placeholder="https://company.com"
            size="middle"
          />
        </Form.Item>

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <UserOutlined className="text-blue-600 text-xs mr-1" />
            Owner Information
          </h4>
        </div>

        {/* Owner Name */}
        <Form.Item
          name="ownerName"
          label="Owner Name"
          rules={[{ required: true, message: "Please enter the owner name" }]}
        >
          <Input
            autoComplete="new-password"
            name="ownerName"
            prefix={<UserOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter owner name"
            size="middle"
          />
        </Form.Item>

        {/* Owner Email */}
        <Form.Item
          name="ownerEmailHidden"
          label="Owner Email"
          rules={[{ required: true, message: "Please enter the owner email" }]}
        >
          <Input
            name="owner_email_hidden"
            id="owner-email-field"
            autoComplete="new-password"
            prefix={<MailOutlined className="text-gray-400 text-xs" />}
            placeholder="owner@company.com"
            size="middle"
          />
        </Form.Item>

        {/* Owner Phone */}
        <Form.Item
          name="ownerPhoneHidden"
          label="Owner Phone"
          rules={[
            { required: true, message: "Please enter the owner phone number" },
          ]}
        >
          <Input
            name="owner_phone_hidden"
            id="owner-phone-field"
            autoComplete="new-password"
            prefix={<PhoneOutlined className="text-gray-400 text-xs" />}
            placeholder="+92-300-1234567 or 0300-1234567"
            size="middle"
          />
        </Form.Item>

        {/* Owner Password */}
        <Form.Item
          name="ownerPasswordHidden"
          label="Owner Password"
          rules={[
            { required: true, message: "Please enter the owner password" },
            () => ({
              validator(_, value) {
                if (!value) return Promise.resolve();

                const missing: string[] = [];

                if (value.length < 8) missing.push("• At least 8 characters");
                if (!/[A-Z]/.test(value))
                  missing.push("• One uppercase letter");
                if (!/[a-z]/.test(value))
                  missing.push("• One lowercase letter");
                if (!/[0-9]/.test(value)) missing.push("• One number");
                if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value))
                  missing.push("• One special character");

                if (missing.length > 0) {
                  return Promise.reject(
                    new Error(`Password must contain:\n${missing.join("\n")}`)
                  );
                }

                return Promise.resolve();
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password
            name="owner_password_hidden"
            id="owner-password-field"
            autoComplete="new-password"
            prefix={<LockOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter owner password"
            size="middle"
          />
        </Form.Item>

        {/* Buttons */}
        <Form.Item className="mb-0 mt-4">
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleCancel}
              size="middle"
              className="px-6 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="middle"
              className="px-6 text-sm"
              style={{
                backgroundColor: "#FFC11E",
                borderColor: "#FFC11E",
                color: "black",
              }}
            >
              {isLoading ? "Adding Company..." : "Add Company"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCompanyModal;
