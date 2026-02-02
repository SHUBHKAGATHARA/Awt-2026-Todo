'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRolesAction, deleteRoleAction } from '@/app/actions';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    const result = await getRolesAction();
    if (result.success) {
      setRoles(result.data);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    const result = await deleteRoleAction(id);
    if (result.success) {
      toast.success('Role deleted successfully');
      loadRoles();
    } else {
      toast.error(result.error || 'Failed to delete role');
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Roles</h1>
          <p>Manage user roles and permissions</p>
        </div>
        <Link href="/roles/new" className={styles.createBtn}>
          + New Role
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Role Name</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No roles found
                </td>
              </tr>
            ) : (
              roles.map((role: any) => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>{role.roleName}</td>
                  <td>{role.description || '-'}</td>
                  <td>{new Date(role.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/roles/${role.id}`} className={styles.editBtn}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className={styles.deleteBtn}
                      >
                        Delete
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
