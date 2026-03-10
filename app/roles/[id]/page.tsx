"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoleAction, updateRoleAction } from "@/app/actions";
import toast from "react-hot-toast";
import styles from "../page.module.css";

interface FormState {
  roleName: string;
  description: string;
}

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>({ roleName: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const roleId = Number(params?.id);

  useEffect(() => {
    if (!Number.isFinite(roleId)) {
      toast.error("Invalid role id");
      return;
    }

    const fetchRole = async () => {
      const result = await getRoleAction(roleId);
      if (result.success && result.data) {
        setFormData({
          roleName: result.data.roleName || "",
          description: result.data.description || "",
        });
      } else {
        toast.error(result.error || "Unable to load role");
        router.push("/roles");
      }
      setLoading(false);
    };

    fetchRole();
  }, [roleId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(roleId)) return;
    setSaving(true);

    const result = await updateRoleAction(roleId, {
      roleName: formData.roleName,
      description: formData.description,
    });

    if (result.success) {
      toast.success(result.message || "Role updated successfully");
      router.push("/roles");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update role");
    }

    setSaving(false);
  };

  if (loading) {
    return <div className={styles.container}>Loading role...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.formHeader}>
        <h1>Edit Role</h1>
        <p>Update role name or description</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="roleName">Role Name</label>
          <input
            id="roleName"
            type="text"
            value={formData.roleName}
            onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
            required
            placeholder="Enter role name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the role"
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
