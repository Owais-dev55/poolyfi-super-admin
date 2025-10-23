import { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { Company } from '../data/companyData';
import * as companyApi from '../api/company/api';

interface DeleteCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteCompany: (companyId: string) => void;
  company: Company | null;
}

const DeleteCompanyModal = ({ isOpen, onClose, onDeleteCompany, company }: DeleteCompanyModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!company) return;
    
    setIsLoading(true);
    
    try {
      const response = await companyApi.deleteCompany(parseInt(company.id));
      
      if (response.hasError) {
        throw new Error(response.message || 'Failed to delete company');
      }
      
      onDeleteCompany(company.id);
      message.success(response.message || 'Company deleted successfully!');
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete company. Please try again.';
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-1.5">
          <ExclamationCircleOutlined className="text-red-500 text-sm" />
          <span className="text-base font-semibold text-gray-900">Delete Company</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={400}
      destroyOnHidden
    >
      <div className="mt-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm shadow-sm">
            {company?.avatar}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {company?.name}
            </h3>
            <p className="text-xs text-gray-600 mb-1">{company?.email}</p>
            <div className="flex items-center space-x-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {company?.industry}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{company?.size}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleOutlined className="h-4 w-4 text-red-400" />
            </div>
            <div className="ml-2">
              <h3 className="text-xs font-medium text-red-800">
                Warning
              </h3>
              <div className="mt-1 text-xs text-red-700">
                <p>This action cannot be undone. The company will be permanently removed from the system and all associated data will be lost.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            onClick={handleCancel}
            size="middle"
            className="px-6 py-1.5 text-sm font-medium"
          >
            Cancel
          </Button>

          <Button
            type="primary"
            danger
            onClick={handleDelete}
            loading={isLoading}
            size="middle"
            className="px-6 py-1.5 text-sm font-medium"
          >
            {isLoading ? 'Deleting...' : 'Delete Company'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteCompanyModal;
