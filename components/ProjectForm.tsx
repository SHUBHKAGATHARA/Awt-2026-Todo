'use client';

import React, { useState } from 'react';
import Button from './Button';
import type { Project } from '@/types';
import styles from './Forms.module.css';

interface ProjectFormProps {
    project?: Project;
    onSubmit: (data: { name: string; description?: string }) => Promise<void>;
    onCancel: () => void;
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
    const [name, setName] = useState(project?.name || '');
    const [description, setDescription] = useState(project?.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onSubmit({
                name: name.trim(),
                description: description.trim() || undefined,
            });
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
                <label htmlFor="project-name" className={styles.label}>
                    Project Name <span className={styles.required}>*</span>
                </label>
                <input
                    id="project-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    placeholder="Enter project name"
                    maxLength={100}
                    disabled={isSubmitting}
                    autoFocus
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="project-description" className={styles.label}>
                    Description
                </label>
                <textarea
                    id="project-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.textarea}
                    placeholder="Enter project description (optional)"
                    rows={4}
                    disabled={isSubmitting}
                />
            </div>

            <div className={styles.formActions}>
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
}
