'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserRolesAction, deleteUserRoleAction } from '@/app/actions';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/useConfirm';
import styles from './page.module.css';

function getInitials(name: string) {
  return name
    .split(/[\s._-]/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeClass(roleName: string) {
  const lower = (roleName || '').toLowerCase();
  if (lower === 'admin') return `${styles.roleBadge} ${styles.admin}`;
  if (lower === 'manager') return `${styles.roleBadge} ${styles.manager}`;
  if (lower === 'developer') return `${styles.roleBadge} ${styles.developer}`;
  return styles.roleBadge;
}

export default function UserRolesPage() {
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRoles();
  }, []);

  async function loadUserRoles() {
    const result = await getUserRolesAction();
    if (result.success) {
      setUserRoles(result.data);
    }
    setLoading(false);
  }

  async function handleDelete(id: number, username: string) {
    const ok = await confirm({
      title: 'Remove Role Assignment',
      message: `Remove the role assignment for "${username}"? They will lose the associated permissions.`,
      confirmLabel: 'Remove',
      variant: 'warning',
    });
    if (!ok) return;

    const result = await deleteUserRoleAction(id);
    if (result.success) {
      toast.success('Role assignment removed successfully');
      loadUserRoles();
    } else {
      toast.error(result.error || 'Failed to remove role assignment');
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      {ConfirmModal}
      <div className={styles.header}>
        <div>
          <h1>User Roles</h1>
          <p>Manage role assignments for users</p>
        </div>
        <Link href="/user-roles/new" className={styles.createBtn}>
          + Assign Role
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Assigned At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userRoles.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No user role assignments found
                </td>
              </tr>
            ) : (
              userRoles.map((userRole: any) => (
                <tr key={userRole.id}>
                  <td>{userRole.id}</td>
                  <td>
                    <div className={styles.userCell}>
                      <span className={styles.userAvatar}>
                        {getInitials(userRole.user?.username || 'U')}
                      </span>
                      <span className={styles.userName}>{userRole.user?.username}</span>
                    </div>
                  </td>
                  <td>{userRole.user?.email}</td>
                  <td>
                    <span className={getRoleBadgeClass(userRole.role?.roleName)}>
                      {userRole.role?.roleName}
                    </span>
                  </td>
                  <td>{new Date(userRole.assignedAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleDelete(userRole.id, userRole.user?.username || 'this user')}
                        className={styles.deleteBtn}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
