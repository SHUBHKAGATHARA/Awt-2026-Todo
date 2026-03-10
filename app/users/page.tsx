'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUsersAction, deleteUserAction } from '@/app/actions';
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

export default function UsersPage() {
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const result = await getUsersAction();
    if (result.success) {
      setUsers(result.data);
    }
    setLoading(false);
  }

  async function handleDelete(id: number, username: string) {
    const ok = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete "${username}"? This action cannot be undone.`,
      confirmLabel: 'Delete User',
      variant: 'danger',
    });
    if (!ok) return;

    const result = await deleteUserAction(id);
    if (result.success) {
      toast.success('User deleted successfully');
      loadUsers();
    } else {
      toast.error(result.error || 'Failed to delete user');
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>;


  return (
    <div className={styles.container}>
      {ConfirmModal}
      <div className={styles.header}>
        <div>
          <h1>Users</h1>
          <p>Manage system users</p>
        </div>
        <Link href="/users/new" className={styles.createBtn}>
          + New User
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className={styles.userCell}>
                      <span className={styles.userAvatar}>{getInitials(user.username)}</span>
                      <span className={styles.userName}>{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/users/${user.id}`} className={styles.editBtn}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
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
