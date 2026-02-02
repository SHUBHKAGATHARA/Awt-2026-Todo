'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, User, MoreVertical, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
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
                        {isCompleted ? (
                            <CheckCircle2 size={20} className={styles.completedIcon} />
                        ) : (
                            <Circle size={20} className={styles.incompleteIcon} />
                        )}
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
                            <MoreVertical size={16} />
                        </button>

                        {showMenu && (
                            <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
                                <button
                                    className={styles.menuItem}
                                    onClick={() => {
                                        onEdit();
                                        setShowMenu(false);
                                    }}
                                >
                                    <Edit2 size={14} />
                                    Edit Task
                                </button>
                                <button
                                    className={`${styles.menuItem} ${styles.danger}`}
                                    onClick={() => {
                                        onDelete();
                                        setShowMenu(false);
                                    }}
                                >
                                    <Trash2 size={14} />
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
                            <CheckCircle2 size={14} />
                            <span>Completed {format(new Date(task.completedAt), 'MMM d')}</span>
                        </div>
                    )}
                    
                    {!isCompleted && task.dueDate && (
                        <div className={styles.metaItem}>
                            <Calendar size={14} />
                            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                        </div>
                    )}

                    {task.assignedUser && (
                        <div className={styles.metaItem}>
                            <User size={14} />
                            <span>{task.assignedUser.username}</span>
                        </div>
                    )}

                    {commentCount > 0 && (
                        <div className={styles.metaItem}>
                            <MessageSquare size={14} />
                            <span>{commentCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
