import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormData } from '../../utils/validationSchemas';
import type { UserProfile } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: UserProfile | null;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const defaultValues: UserFormData = {
    displayName: initialData?.displayName || '',
    email: initialData?.email || '',
    role: initialData?.role || 'employee',
    department: initialData?.department || 'Field Operations',
    status: initialData?.status || 'active',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });

  const roleOptions = [
    { value: 'admin', label: 'Administrator (Full Governance)' },
    { value: 'manager', label: 'Manager (Schedule & Dispatch)' },
    { value: 'employee', label: 'Employee (Execution Only)' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active Account' },
    { value: 'inactive', label: 'Inactive / Suspended' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit User Profile & Role' : 'Provision New User'}
      subtitle={isEditing ? 'Modify access role or organizational department' : 'Configure user details and RBAC permissions'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Sarah Jenkins"
          error={errors.displayName?.message}
          {...register('displayName')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="s.jenkins@company.com"
          disabled={isEditing}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Department"
          placeholder="e.g. Field Maintenance"
          error={errors.department?.message}
          {...register('department')}
        />

        <Select
          label="System Role (RBAC)"
          options={roleOptions}
          error={errors.role?.message}
          {...register('role')}
        />

        <Select
          label="Account Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Provision User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
