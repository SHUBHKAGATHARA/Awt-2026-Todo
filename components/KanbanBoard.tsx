'use client';

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskListColumn from './TaskListColumn';
import TaskCard from './TaskCard';
import Button from './Button';
import type { TaskList, Task } from '@/types';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
    taskLists: TaskList[];
    projectId: number;
    onAddList: () => void;
    onEditList: (list: TaskList) => void;
    onDeleteList: (listId: number) => void;
    onAddTask: (listId: number) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (taskId: number) => void;
    onMoveTask: (taskId: number, newListId: number, newPosition: number) => void;
    onCompleteTask: (taskId: number, completed: boolean) => void;
}

export default function KanbanBoard({
    taskLists,
    projectId,
    onAddList,
    onEditList,
    onDeleteList,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onMoveTask,
    onCompleteTask,
}: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = taskLists
            .flatMap((list) => list.tasks || [])
            .find((t) => t.id === active.id);

        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const activeTask = taskLists
            .flatMap((list) => list.tasks || [])
            .find((t) => t.id === active.id);

        if (!activeTask) {
            setActiveTask(null);
            return;
        }

        // Check if dropped on a task list or another task
        const overList = taskLists.find((list) => list.id === over.id);
        const overTask = taskLists
            .flatMap((list) => list.tasks || [])
            .find((t) => t.id === over.id);

        let newListId = activeTask.listId;
        let newPosition = activeTask.position;

        if (overList) {
            // Dropped on a list
            newListId = overList.id;
            newPosition = overList.tasks?.length || 0;
        } else if (overTask) {
            // Dropped on another task
            newListId = overTask.listId;
            newPosition = overTask.position;
        }

        if (newListId !== activeTask.listId || newPosition !== activeTask.position) {
            onMoveTask(activeTask.id, newListId, newPosition);
        }

        setActiveTask(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={styles.board}>
                <div className={styles.listsContainer}>
                    {taskLists.map((list) => (
                        <TaskListColumn
                            key={list.id}
                            list={list}
                            onEdit={() => onEditList(list)}
                            onDelete={() => onDeleteList(list.id)}
                            onAddTask={() => onAddTask(list.id)}
                            onEditTask={onEditTask}
                            onDeleteTask={onDeleteTask}
                            onCompleteTask={onCompleteTask}
                        />
                    ))}

                    <div className={styles.addListColumn}>
                        <Button
                            variant="ghost"
                            onClick={onAddList}
                            className={styles.addListButton}
                        >
                            <Plus size={20} />
                            Add List
                        </Button>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className={styles.dragOverlay}>
                        <TaskCard task={activeTask} isDragging />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
