import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { UserTable } from '../components/users/UserTable';
import { UserForm } from '../components/users/UserForm';
import { Button } from '../components/ui/Button';
import { UserPlus, Search, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../types';
import type { UserFormData } from '../utils/validationSchemas';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

export const Users: React.FC = () => {
  const { users, createUser, updateUser, deleteUser, currentUser } = useAppContext();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUserSubmit = (data: UserFormData) => {
    if (selectedUser) {
      updateUser(selectedUser.uid, data);
      toast.success('User Updated', `"${data.displayName}" updated successfully.`);
    } else {
      createUser(data);
      toast.success('User Provisioned', `"${data.displayName}" created with role ${data.role}.`);
    }
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (user.uid === currentUser.uid) {
      toast.error('Permission Denied', 'You cannot delete your own active account.');
      return;
    }
    if (window.confirm(`Remove user "${user.displayName}" from the system?`)) {
      deleteUser(user.uid);
      toast.info('User Removed', `"${user.displayName}" removed from the system.`);
    }
  };

  return (
    <PageContainer
      title="User Directory & RBAC"
      subtitle="Manage user accounts, assign system roles (Admin, Manager, Employee), and govern permissions"
      actions={
        <Button
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => {
            setSelectedUser(null);
            setIsFormOpen(true);
          }}
        >
          Provision User
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search & Role Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-level-1 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or department..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="manager">Managers</option>
              <option value="employee">Employees</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-slate-500 -mt-2">
          Showing <span className="font-semibold text-slate-700">{filteredUsers.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{users.length}</span> users
        </p>

        {/* User Directory Table */}
        <UserTable
          users={filteredUsers}
          onEditUser={(user) => {
            setSelectedUser(user);
            setIsFormOpen(true);
          }}
          onDeleteUser={handleDeleteUser}
        />

        {/* Provision / Edit Form Modal */}
        <UserForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUserSubmit}
          initialData={selectedUser}
        />
      </div>
    </PageContainer>
  );
};
