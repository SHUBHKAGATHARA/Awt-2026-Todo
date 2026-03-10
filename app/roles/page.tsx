'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRolesAction, deleteRoleAction } from '@/app/actions';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/useConfirm';
import styles from './page.module.css';

/** Role-specific config for icon colour + background */
const getRoleConfig = (roleName: string) => {
  const name = (roleName || '').toLowerCase();
  if (name.includes('admin')) return { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', initial: 'A' };
  if (name.includes('manager')) return { bg: '#f0fdf4', color: '#059669', border: '#bbf7d0', initial: 'M' };
  if (name.includes('developer')) return { bg: '#eff6ff', color: '#2563EB', border: '#dbeafe', initial: 'D' };
  return { bg: '#f8fafc', color: '#6b7280', border: '#e5e7eb', initial: roleName?.charAt(0)?.toUpperCase() || 'R' };
};

export default function RolesPage() {
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRoles(); }, []);

  async function loadRoles() {
    const result = await getRolesAction();
    if (result.success) setRoles(result.data);
    setLoading(false);
  }

  async function handleDelete(id: number, roleName: string) {
    const ok = await confirm({
      title: 'Delete Role',
      message: `Are you sure you want to delete the "${roleName}" role? Users assigned this role may lose access.`,
      confirmLabel: 'Delete Role',
      variant: 'danger',
    });
    if (!ok) return;
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
      {ConfirmModal}
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Roles</h1>
          <p>Manage user roles and permissions</p>
        </div>
        <Link href="/roles/new" className={styles.createBtn}>
          + New Role
        </Link>
      </div>

      {/* Summary cards */}
      {roles.length > 0 && (
        <div className={styles.roleCards}>
          {roles.map((role: any) => {
            const cfg = getRoleConfig(role.roleName);
            return (
              <div className={styles.roleCard} key={role.id}
                style={{ '--role-color': cfg.color, '--role-bg': cfg.bg, '--role-border': cfg.border } as any}>
                <div className={styles.roleCardAvatar} style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, color: cfg.color }}>
                  {cfg.initial}
                </div>
                <div className={styles.roleCardName}>{role.roleName}</div>
                <div className={styles.roleCardDesc}>{role.description || 'No description'}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Role</th>
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
              roles.map((role: any) => {
                const cfg = getRoleConfig(role.roleName);
                return (
                  <tr key={role.id}>
                    <td className={styles.idCell}>{role.id}</td>
                    <td>
                      <div className={styles.roleCell}>
                        <span className={styles.roleAvatar}
                          style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, color: cfg.color }}>
                          {cfg.initial}
                        </span>
                        <div>
                          <span className={styles.roleNameText}>{role.roleName}</span>
                          <span className={styles.roleBadge}
                            style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                            {role.roleName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.descCell}>{role.description || '—'}</td>
                    <td className={styles.dateCell}>{new Date(role.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/roles/${role.id}`} className={styles.editBtn}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(role.id, role.roleName)} className={styles.deleteBtn}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
