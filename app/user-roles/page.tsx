'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserRolesAction, deleteUserRoleAction } from '@/app/actions';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function UserRolesPage() {
  const router = useRouter();
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

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to remove this role assignment?')) return;
    
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
                  <td>{userRole.user?.username}</td>
                  <td>{userRole.user?.email}</td>
                  <td>
                    <span className={styles.roleBadge}>{userRole.role?.roleName}</span>
                  </td>
                  <td>{new Date(userRole.assignedAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleDelete(userRole.id)}
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
