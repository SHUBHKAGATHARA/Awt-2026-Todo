'use client';

import React, { useState } from 'react';
import Button from './Button';
import type { TaskList } from '@/types';
import styles from './Forms.module.css';

interface TaskListFormProps {
    taskList?: TaskList;
    projectId: number;
    onSubmit: (data: { name: string; projectId: number }) => Promise<void>;
    onCancel: () => void;
}

export default function TaskListForm({
    taskList,
    projectId,
    onSubmit,
    onCancel,
}: TaskListFormProps) {
    const [name, setName] = useState(taskList?.name || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('List name is required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onSubmit({
                name: name.trim(),
                projectId,
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
                <label htmlFor="list-name" className={styles.label}>
                    List Name <span className={styles.required}>*</span>
                </label>
                <input
                    id="list-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    placeholder="Enter list name"
                    maxLength={100}
                    disabled={isSubmitting}
                    autoFocus
                />
            </div>

            <div className={styles.formActions}>
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : taskList ? 'Update List' : 'Create List'}
                </Button>
            </div>
        </form>
    );
}
