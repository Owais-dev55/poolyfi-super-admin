import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { BankOutlined, MailOutlined, PhoneOutlined, GlobalOutlined, TeamOutlined } from '@ant-design/icons';
import type { Company } from '../data/companyData';
import * as companyApi from '../api/company/api';
import * as industriesApi from '../api/industries/api';
import * as companySizesApi from '../api/companySizes/api';

interface CompanyFormData {
  companyName: string;
  address: string;
  email: string;
  phoneNumber: string;
  industryId: number;
  sizeId: number;
  website: string;
}

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditCompany: (companyId: string, companyData: CompanyFormData) => void;
  company: Company | null;
}

const EditCompanyModal = ({ isOpen, onClose, onEditCompany, company }: EditCompanyModalProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [industryOptions, setIndustryOptions] = useState<{ value: number; label: string }[]>([]);
  const [sizeOptions, setSizeOptions] = useState<{ value: number; label: string }[]>([]);

  // Fetch industries and company sizes from API
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      // Fetch industries
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
      }

      // Fetch company sizes
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
        // Fallback to default options
        setSizeOptions([
          { value: 1, label: '1-50 employees' },
          { value: 2, label: '51-200 employees' },
          { value: 3, label: '201-1000 employees' },
          { value: 4, label: '1000+ employees' },
        ]);
      }
    };

    fetchData();
  }, [isOpen]);

  // Pre-fill form when company data changes
  useEffect(() => {
    if (company && isOpen) {
      form.setFieldsValue({
        companyName: company.name,
        address: company.address,
        email: company.email,
        phoneNumber: company.phoneNumber,
        industryId: company.industryId,
        sizeId: company.sizeId,
        website: company.website,
      });
    }
  }, [company, isOpen, form]);

  const handleSubmit = async (values: CompanyFormData) => {
    if (!company) return;
    
    setIsLoading(true);
    
    try {
      const payload: companyApi.UpdateCompanyPayload = {
        name: values.companyName,
        address: values.address,
        phone: values.phoneNumber,
        websiteUrl: values.website,
        industryId: values.industryId,
        sizeId: values.sizeId,
        // Note: email is intentionally excluded from the payload
      };

      const response = await companyApi.updateCompany(parseInt(company.id), payload);
      
      onEditCompany(company.id, values);
      message.success(response.message || 'Company updated successfully!');
      form.resetFields();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update company. Please try again.';
      message.error(errorMessage);
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
          <span className="text-base">Edit Company</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={520}
      destroyOnHidden
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
            { min: 2, message: 'Company name must be at least 2 characters' }
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
            { min: 5, message: 'Address must be at least 5 characters' }
          ]}
        >
          <Input
            prefix={<BankOutlined className="text-gray-400 text-xs" />}
            placeholder="Enter company address"
            size="middle"
          />
        </Form.Item>

        {/* Email Address - Read Only */}
        <Form.Item
          name="email"
          label={<span className="text-sm">Email Address</span>}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400 text-xs" />}
            placeholder="contact@company.com"
            size="middle"
            disabled
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </Form.Item>

        {/* Phone Number */}
        <Form.Item
          name="phoneNumber"
          label={<span className="text-sm">Phone Number</span>}
          rules={[
            { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="text-gray-400 text-xs" />}
            placeholder="+1 (555) 123-4567"
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
            placeholder="Select industry"
            size="middle"
            options={industryOptions}
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
            placeholder="Select company size"
            size="middle"
            options={sizeOptions}
            suffixIcon={<TeamOutlined className="text-xs" />}
          />
        </Form.Item>


        {/* Website */}
        <Form.Item
          name="website"
          label={<span className="text-sm">Website</span>}
          rules={[
            { type: 'url', message: 'Please enter a valid website URL' }
          ]}
        >
          <Input
            prefix={<GlobalOutlined className="text-gray-400 text-xs" />}
            placeholder="https://company.com"
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCompanyModal;
