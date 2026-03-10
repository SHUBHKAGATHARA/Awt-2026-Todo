'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import type { Task } from '@/types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
    task: Task;
    isDragging?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onComplete?: (completed: boolean) => void;
}

const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444',
};

export default function TaskCard({ task, isDragging, onEdit, onDelete, onComplete }: TaskCardProps) {
    const [showMenu, setShowMenu] = React.useState(false);
    const isCompleted = !!task.completedAt;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    const commentCount = task.comments?.length || 0;

    const handleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onComplete) {
            onComplete(!isCompleted);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${styles.card} ${isDragging ? styles.dragging : ''} ${isCompleted ? styles.completed : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className={styles.header}>
                <div className={styles.leftHeader}>
                    <button
                        className={styles.completeButton}
                        onClick={handleComplete}
                        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                        <span className={styles.completeLabel}>{isCompleted ? 'Completed' : 'Mark done'}</span>
                    </button>
                    <div
                        className={styles.priorityIndicator}
                        style={{ backgroundColor: priorityColors[task.priority] }}
                        title={`Priority: ${task.priority}`}
                    />
                </div>

                {onEdit && onDelete && (
                    <div className={styles.menuContainer}>
                        <button
                            className={styles.menuButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            aria-label="Task options"
                        >
                            Options
                        </button>

                        {showMenu && (
                            <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
                                <button
                                    className={`${styles.menuItem} ${!isCompleted ? styles.success : ''}`}
                                    onClick={() => {
                                        if (onComplete) {
                                            onComplete(!isCompleted);
                                        }
                                        setShowMenu(false);
                                    }}
                                >
                                    {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                                </button>
                                <button
                                    className={styles.menuItem}
                                    onClick={() => {
                                        onEdit();
                                        setShowMenu(false);
                                    }}
                                >
                                    Edit Task
                                </button>
                                <button
                                    className={`${styles.menuItem} ${styles.danger}`}
                                    onClick={() => {
                                        onDelete();
                                        setShowMenu(false);
                                    }}
                                >
                                    Delete Task
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <h4 className={`${styles.title} ${isCompleted ? styles.completedText : ''}`}>{task.title}</h4>

            {task.description && (
                <p className={`${styles.description} ${isCompleted ? styles.completedText : ''}`}>{task.description}</p>
            )}

            <div className={styles.footer}>
                <div className={styles.metadata}>
                    {isCompleted && task.completedAt && (
                        <div className={`${styles.metaItem} ${styles.completedBadge}`}>
                            <span>Completed {format(new Date(task.completedAt), 'MMM d')}</span>
                        </div>
                    )}

                    {!isCompleted && task.dueDate && (
                        <div className={styles.metaItem}>
                            <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
                        </div>
                    )}

                    {task.assignedUser && (
                        <div className={styles.metaItem}>
                            <span>Assignee {task.assignedUser.username}</span>
                        </div>
                    )}

                    {commentCount > 0 && (
                        <div className={styles.metaItem}>
                            <span>Comments {commentCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
