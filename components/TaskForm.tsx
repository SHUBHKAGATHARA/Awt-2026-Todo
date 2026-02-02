'use client';

import React, { useState } from 'react';
import Button from './Button';
import type { Task, User } from '@/types';
import styles from './Forms.module.css';

interface TaskFormProps {
    task?: Task;
    listId: number;
    users: User[];
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export default function TaskForm({ task, listId, users, onSubmit, onCancel }: TaskFormProps) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>(
        task?.priority || 'medium'
    );
    const [status, setStatus] = useState(task?.status || 'pending');
    const [assignedTo, setAssignedTo] = useState<string>(
        task?.assignedTo?.toString() || ''
    );
    const [dueDate, setDueDate] = useState(
        task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Task title is required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onSubmit({
                listId,
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                status,
                assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
                dueDate: dueDate ? new Date(dueDate) : undefined,
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
                <label htmlFor="task-title" className={styles.label}>
                    Task Title <span className={styles.required}>*</span>
                </label>
                <input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.input}
                    placeholder="Enter task title"
                    maxLength={200}
                    disabled={isSubmitting}
                    autoFocus
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="task-description" className={styles.label}>
                    Description
                </label>
                <textarea
                    id="task-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.textarea}
                    placeholder="Enter task description (optional)"
                    rows={4}
                    disabled={isSubmitting}
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="task-priority" className={styles.label}>
                        Priority
                    </label>
                    <select
                        id="task-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className={styles.select}
                        disabled={isSubmitting}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="task-status" className={styles.label}>
                        Status
                    </label>
                    <select
                        id="task-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={styles.select}
                        disabled={isSubmitting}
                    >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="task-assigned" className={styles.label}>
                        Assign To
                    </label>
                    <select
                        id="task-assigned"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className={styles.select}
                        disabled={isSubmitting}
                    >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="task-due-date" className={styles.label}>
                        Due Date
                    </label>
                    <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={styles.input}
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className={styles.formActions}>
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    );
}
