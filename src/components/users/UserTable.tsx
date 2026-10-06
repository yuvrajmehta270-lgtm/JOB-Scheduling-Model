import React from 'react';
import type { UserProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { ShieldCheck, Edit, UserX, UserCheck, Trash2 } from 'lucide-react';

interface UserTableProps {
  users: UserProfile[];
  isLoading?: boolean;
  onEditUser?: (user: UserProfile) => void;
  onToggleStatus?: (user: UserProfile) => void;
  onDeleteUser?: (user: UserProfile) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading = false,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <EmptyState
        title="No Users Found"
        description="There are no user accounts in the directory matching your query."
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-level-1 overflow-hidden hover:shadow-level-2 transition-shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider font-display">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-indigo-50/30 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold font-display text-xs shrink-0 shadow-xs">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.displayName}</p>
                      <p className="text-xs text-slate-500 font-mono text-[11px]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Badge
                    variant={user.role === 'admin' ? 'rose' : user.role === 'manager' ? 'indigo' : 'slate'}
                    icon={<ShieldCheck className="w-3 h-3" />}
                  >
                    <span className="capitalize">{user.role}</span>
                  </Badge>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700 font-semibold">
                  {user.department}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Badge variant={user.status === 'active' ? 'emerald' : 'slate'}>
                    <span className="capitalize">{user.status}</span>
                  </Badge>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {onEditUser && (
                      <button
                        onClick={() => onEditUser(user)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit User Role"
                        aria-label="Edit User Role"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {onToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(user)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.status === 'active'
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        aria-label={user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {user.status === 'active' ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {onDeleteUser && (
                      <button
                        onClick={() => onDeleteUser(user)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete User"
                        aria-label="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
