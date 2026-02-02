'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoleAction } from '@/app/actions';
import toast from 'react-hot-toast';
import styles from '../page.module.css';

export default function NewRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createRoleAction(formData);
      if (result.success) {
        toast.success(result.message || 'Role created successfully');
        router.push('/roles');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create role');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formHeader}>
        <h1>Create New Role</h1>
        <p>Add a new role to the system</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="roleName">Role Name</label>
          <input
            type="text"
            id="roleName"
            value={formData.roleName}
            onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
            required
            placeholder="Enter role name (e.g., Admin, Manager)"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the role and its permissions"
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelBtn}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
}
