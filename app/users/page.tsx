'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUsersAction, deleteUserAction } from '@/app/actions';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function UsersPage() {
  const router = useRouter();
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

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
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
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/users/${user.id}`} className={styles.editBtn}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
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
