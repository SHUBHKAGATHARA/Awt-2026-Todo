'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MoreVertical, Plus, Edit2, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard';
import type { TaskList, Task } from '@/types';
import styles from './TaskListColumn.module.css';

interface TaskListColumnProps {
    list: TaskList;
    onEdit: () => void;
    onDelete: () => void;
    onAddTask: () => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (taskId: number) => void;
    onCompleteTask: (taskId: number, completed: boolean) => void;
}

export default function TaskListColumn({
    list,
    onEdit,
    onDelete,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onCompleteTask,
}: TaskListColumnProps) {
    const [showMenu, setShowMenu] = React.useState(false);
    const { setNodeRef } = useDroppable({
        id: list.id,
    });

    const tasks = list.tasks || [];
    const taskIds = tasks.map((task) => task.id);

    return (
        <div className={styles.column} ref={setNodeRef}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h3 className={styles.title}>{list.name}</h3>
                    <span className={styles.count}>{tasks.length}</span>
                </div>

                <div className={styles.menuContainer}>
                    <button
                        className={styles.menuButton}
                        onClick={() => setShowMenu(!showMenu)}
                        aria-label="List options"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                        <div className={styles.menu}>
                            <button className={styles.menuItem} onClick={() => { onEdit(); setShowMenu(false); }}>
                                <Edit2 size={16} />
                                Edit List
                            </button>
                            <button
                                className={`${styles.menuItem} ${styles.danger}`}
                                onClick={() => { onDelete(); setShowMenu(false); }}
                            >
                                <Trash2 size={16} />
                                Delete List
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.tasksContainer}>
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => onEditTask(task)}
                            onDelete={() => onDeleteTask(task.id)}
                            onComplete={(completed) => onCompleteTask(task.id, completed)}
                        />
                    ))}
                </SortableContext>
            </div>

            <button className={styles.addTaskButton} onClick={onAddTask}>
                <Plus size={18} />
                Add Task
            </button>
        </div>
    );
}
