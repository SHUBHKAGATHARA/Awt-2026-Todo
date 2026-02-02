'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserRoleAction, getUsersAction, getRolesAction } from '@/app/actions';
import toast from 'react-hot-toast';
import styles from '../page.module.css';

export default function NewUserRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    userId: '',
    roleId: '',
  });

  useEffect(() => {
    async function loadData() {
      const [usersResult, rolesResult] = await Promise.all([
        getUsersAction(),
        getRolesAction(),
      ]);
      
      if (usersResult.success) setUsers(usersResult.data);
      if (rolesResult.success) setRoles(rolesResult.data);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createUserRoleAction({
        userId: parseInt(formData.userId),
        roleId: parseInt(formData.roleId),
      });
      
      if (result.success) {
        toast.success(result.message || 'Role assigned successfully');
        router.push('/user-roles');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to assign role');
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
        <h1>Assign Role to User</h1>
        <p>Create a new user role assignment</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="userId">Select User</label>
          <select
            id="userId"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            required
          >
            <option value="">Choose a user...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="roleId">Select Role</label>
          <select
            id="roleId"
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            required
          >
            <option value="">Choose a role...</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.roleName}
              </option>
            ))}
          </select>
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
            {loading ? 'Assigning...' : 'Assign Role'}
          </button>
        </div>
      </form>
    </div>
  );
}
