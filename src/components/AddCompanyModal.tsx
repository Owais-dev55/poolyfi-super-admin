import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { BankOutlined, MailOutlined, PhoneOutlined, GlobalOutlined, TeamOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import * as api from '../api/company/api';
import * as industriesApi from '../api/industries/api';
import * as companySizesApi from '../api/companySizes/api';
import { useCustomToast } from '../utils/useCustomToast';

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

const AddCompanyModal = ({ isOpen, onClose, onAddCompany }: AddCompanyModalProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [industryOptions, setIndustryOptions] = useState<{ value: number; label: string }[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(false);
  const [sizeOptions, setSizeOptions] = useState<{ value: number; label: string }[]>([]);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const { showToast } = useCustomToast();

  // Fetch industries and company sizes from API
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return; // Only fetch when modal is open
      
      // Fetch industries
      setIsLoadingIndustries(true);
      try {
        const industriesResponse = await industriesApi.getIndustries();
        if (industriesResponse.data && Array.isArray(industriesResponse.data)) {
          const industryOptions = industriesResponse.data.map((industry: industriesApi.Industry) => ({
            value: industry.id,
            label: industry.name,
          }));
          setIndustryOptions(industryOptions);
        }
      } catch (error: any) {
        console.error('Failed to fetch industries:', error);
        showToast('error', 'Failed to load industries. Using default options.');
        // Fallback to default options
        setIndustryOptions([
          { value: 1, label: 'IT' },
          { value: 2, label: 'Finance' },
          { value: 3, label: 'Healthcare' },
          { value: 4, label: 'Energy' },
          { value: 5, label: 'Manufacturing' },
          { value: 6, label: 'Retail' },
          { value: 7, label: 'Education' },
          { value: 8, label: 'Other' },
        ]);
      } finally {
        setIsLoadingIndustries(false);
      }

      // Fetch company sizes
      setIsLoadingSizes(true);
      try {
        const sizesResponse = await companySizesApi.getCompanySizes();
        if (sizesResponse.data && Array.isArray(sizesResponse.data)) {
          const sizeOptions = sizesResponse.data.map((size: companySizesApi.CompanySize) => ({
            value: size.id,
            label: size.sizeText,
          }));
          setSizeOptions(sizeOptions);
        }
      } catch (error: any) {
        console.error('Failed to fetch company sizes:', error);
        showToast('error', 'Failed to load company sizes. Using default options.');
        // Fallback to default options
        setSizeOptions([
          { value: 1, label: '1-50 employees' },
          { value: 2, label: '51-200 employees' },
          { value: 3, label: '201-1000 employees' },
          { value: 4, label: '1000+ employees' },
        ]);
      } finally {
        setIsLoadingSizes(false);
      }
    };

    fetchData();
  }, [isOpen]);

  const handleSubmit = async (values: CompanyFormData) => {
    setIsLoading(true);
    
    try {
      const payload: api.CreateCompanyPayload = {
        name: values.companyName,
        address: values.address,
        email: values.email,
        phone: values.phoneNumber,
        websiteUrl: values.website,
        industryId: values.industryId,
        sizeId: values.sizeId,
        ownerName: values.ownerName,
        ownerEmail: values.ownerEmail,
        ownerPhone: values.ownerPhone,
        ownerPassword: values.ownerPassword,
      };

      const response = await api.createCompany(payload);
      
      // Check if the API response indicates an error
      if (response.hasError) {
        // Show error message from API response
        showToast('error', response.message || 'Failed to create company. Please try again.');
        return; // Don't close modal or reset form on error
      }
      
      // Success case
      onAddCompany(values);
      showToast('success', response.message || 'Company added successfully!');
      form.resetFields();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add company. Please try again.';
      showToast('error', errorMessage);
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
      destroyOnHidden
      zIndex={1000}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-3"
      >
        {/* Company Name */}
        <Form.Item
          name="companyName"
          label={<span className="text-sm">Company Name</span>}
          rules={[
            { required: true, message: 'Please enter the company name' },
            { min: 2, message: 'Company name must be at least 2 characters' },
            { max: 100, message: 'Company name must not exceed 100 characters' },
            { pattern: /^[a-zA-Z0-9\s\-&.,()]+$/, message: 'Company name can only contain letters, numbers, spaces, and basic punctuation' }
          ]}
        >
          <Input
            prefix={<BankOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter company name"
            size="middle"
          />
        </Form.Item>

        {/* Company Address */}
        <Form.Item
          name="address"
          label={<span className="text-sm">Company Address</span>}
          rules={[
            { required: true, message: 'Please enter the company address' },
            { min: 5, message: 'Address must be at least 5 characters' },
            { max: 200, message: 'Address must not exceed 200 characters' }
          ]}
        >
          <Input
            prefix={<BankOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter company address"
            size="middle"
          />
        </Form.Item>

        {/* Email Address */}
        <Form.Item
          name="email"
          label={<span className="text-sm">Email Address</span>}
          rules={[
            { required: true, message: 'Please enter the email address' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400 text-xs" />}
            placeholder="contact@company.com"
            size="middle"
          />
        </Form.Item>

        {/* Phone Number */}
        <Form.Item
          name="phoneNumber"
          label={<span className="text-sm">Phone Number</span>}
          rules={[
            { required: true, message: 'Please enter the phone number' },
            { 
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                
                // Remove all non-digit characters for validation
                const cleanNumber = value.replace(/\D/g, '');
                
                // Check if it's a valid Pakistani mobile number
                if (cleanNumber.startsWith('92') && cleanNumber.length === 12) {
                  const mobilePart = cleanNumber.substring(2);
                  if (mobilePart.match(/^[3][0-9]{9}$/)) {
                    return Promise.resolve();
                  }
                } else if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
                  const mobilePart = cleanNumber.substring(1);
                  if (mobilePart.match(/^[3][0-9]{9}$/)) {
                    return Promise.resolve();
                  }
                } else if (cleanNumber.length === 10) {
                  if (cleanNumber.match(/^[3][0-9]{9}$/)) {
                    return Promise.resolve();
                  }
                }
                
                return Promise.reject(new Error('Please enter a valid Pakistani mobile number (e.g., +92-300-1234567, 0300-1234567, or 3001234567)'));
              }
            }
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="text-gray-400 text-xs" />}
            placeholder="+92-300-1234567 or 0300-1234567"
            size="middle"
          />
        </Form.Item>

        {/* Industry */}
        <Form.Item
          name="industryId"
          label={<span className="text-sm">Industry</span>}
          rules={[{ required: true, message: 'Please select an industry' }]}
        >
          <Select
            placeholder={isLoadingIndustries ? "Loading industries..." : "Select industry"}
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
          label={<span className="text-sm">Company Size</span>}
          rules={[{ required: true, message: 'Please select company size' }]}
        >
          <Select
            placeholder={isLoadingSizes ? "Loading company sizes..." : "Select company size"}
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
          label={<span className="text-sm">Website</span>}
          rules={[
            { required: true, message: 'Please enter the website URL' },
            { type: 'url', message: 'Please enter a valid website URL' }
          ]}
        >
          <Input
            prefix={<GlobalOutlined className="text-gray-400 text-xs" />}
            placeholder="https://company.com"
            size="middle"
          />
        </Form.Item>

        {/* Owner Information Section */}
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <UserOutlined className="text-blue-600 text-xs mr-1" />
            Owner Information
          </h4>
        </div>

        {/* Owner Name */}
        <Form.Item
          name="ownerName"
          label={<span className="text-sm">Owner Name</span>}
          rules={[
            { required: true, message: 'Please enter the owner name' },
            { min: 2, message: 'Owner name must be at least 2 characters' },
            { max: 50, message: 'Owner name must not exceed 50 characters' }
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter owner name"
            size="middle"
          />
        </Form.Item>

        {/* Owner Email */}
        <Form.Item
          name="ownerEmail"
          label={<span className="text-sm">Owner Email</span>}
          rules={[
            { required: true, message: 'Please enter the owner email' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400 text-xs" />}
            placeholder="owner@company.com"
            size="middle"
          />
        </Form.Item>

        {/* Owner Phone */}
        <Form.Item
          name="ownerPhone"
          label={<span className="text-sm">Owner Phone</span>}
          rules={[
            { required: true, message: 'Please enter the owner phone number' },
            { 
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                
                // Remove all non-digit characters for validation
                const cleanNumber = value.replace(/\D/g, '');
                
                // Check if it's a valid Pakistani mobile number
                if (cleanNumber.startsWith('92') && cleanNumber.length === 12) {
                  const mobilePart = cleanNumber.substring(2);
                  if (mobilePart.match(/^[3][0-9]{9}$/)) {
                    return Promise.resolve();
                  }
                } else if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
                  const mobilePart = cleanNumber.substring(1);
                  if (mobilePart.match(/^[3][0-9]{9}$/)) {
                    return Promise.resolve();
                  }
                } else if (cleanNumber.length === 10) {
                  if (cleanNumber.match(/^[3][0-9]{9}$/)) {
                    return Promise.resolve();
                  }
                }
                
                return Promise.reject(new Error('Please enter a valid Pakistani mobile number (e.g., +92-300-1234567, 0300-1234567, or 3001234567)'));
              }
            }
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="text-gray-400 text-xs" />}
            placeholder="+92-300-1234567 or 0300-1234567"
            size="middle"
          />
        </Form.Item>

        {/* Owner Password */}
        <Form.Item
          name="ownerPassword"
          label={<span className="text-sm">Owner Password</span>}
          rules={[
            { required: true, message: 'Please enter the owner password' },
            { min: 6, message: 'Password must be at least 6 characters' },
            { max: 50, message: 'Password must not exceed 50 characters' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter owner password"
            size="middle"
          />
        </Form.Item>

        {/* Action Buttons */}
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
              style={{ backgroundColor: '#FFC11E', borderColor: '#FFC11E', color: 'black' }}
            >
              {isLoading ? 'Adding Company...' : 'Add Company'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCompanyModal;
