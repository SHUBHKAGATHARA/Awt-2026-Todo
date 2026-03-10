'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUserAction, updateUserAction } from '@/app/actions';
import toast from 'react-hot-toast';
import styles from '../page.module.css';

type FormState = {
  username: string;
  email: string;
  password: string;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params?.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (Number.isNaN(userId)) {
      router.push('/users');
      return;
    }
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadUser() {
    setLoading(true);
    const result = await getUserAction(userId);
    if (result.success && result.data) {
      setFormData({ username: result.data.username, email: result.data.email, password: '' });
    } else {
      toast.error(result.error || 'User not found');
      router.push('/users');
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload: Partial<FormState> = {
      username: formData.username,
      email: formData.email,
    };

    if (formData.password.trim().length > 0) {
      payload.password = formData.password;
    }

    const result = await updateUserAction(userId, payload);
    if (result.success) {
      toast.success(result.message || 'User updated successfully');
      router.push('/users');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update user');
    }

    setSaving(false);
  }

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.formHeader}>
        <h1>Edit User</h1>
        <p>Update user details</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            placeholder="Enter username"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="user@example.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password (leave blank to keep)</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="New password"
            minLength={6}
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelBtn}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
