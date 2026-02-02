'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, Plus, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import KanbanBoard from '@/components/KanbanBoard';
import Modal from '@/components/Modal';
import ProjectForm from '@/components/ProjectForm';
import TaskListForm from '@/components/TaskListForm';
import TaskForm from '@/components/TaskForm';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import {
    getProjectAction,
    updateProjectAction,
    deleteProjectAction,
    createTaskListAction,
    updateTaskListAction,
    deleteTaskListAction,
    createTaskAction,
    updateTaskAction,
    deleteTaskAction,
    moveTaskAction,
    getUsersAction,
    completeTaskAction,
    uncompleteTaskAction,
} from '@/app/actions';
import type { Project, TaskList, Task, User } from '@/types';
import styles from './page.module.css';

interface ProjectPageProps {
    params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProjectMenu, setShowProjectMenu] = useState(false);

    // Modal states
    const [editProjectModal, setEditProjectModal] = useState(false);
    const [addListModal, setAddListModal] = useState(false);
    const [editListModal, setEditListModal] = useState<TaskList | null>(null);
    const [addTaskModal, setAddTaskModal] = useState<number | null>(null);
    const [editTaskModal, setEditTaskModal] = useState<Task | null>(null);

    const [projectId, setProjectId] = useState<number | null>(null);

    useEffect(() => {
        params.then((p) => {
            setProjectId(parseInt(p.id));
        });
    }, [params]);

    useEffect(() => {
        if (projectId) {
            loadProject();
            loadUsers();
        }
    }, [projectId]);

    const loadProject = async () => {
        if (!projectId) return;

        setLoading(true);
        const response = await getProjectAction(projectId);

        if (response.success) {
            setProject(response.data);
        } else {
            toast.error(response.error || 'Failed to load project');
            router.push('/');
        }
        setLoading(false);
    };

    const loadUsers = async () => {
        const response = await getUsersAction();
        if (response.success) {
            setUsers(response.data);
        }
    };

    const handleUpdateProject = async (data: { name: string; description?: string }) => {
        if (!projectId) return;

        const response = await updateProjectAction(projectId, data);

        if (response.success) {
            toast.success(response.message || 'Project updated');
            setEditProjectModal(false);
            loadProject();
        } else {
            toast.error(response.error || 'Failed to update project');
            throw new Error(response.error);
        }
    };

    const handleDeleteProject = async () => {
        if (!projectId) return;

        if (!confirm('Are you sure you want to delete this project? This will delete all lists and tasks.')) {
            return;
        }

        const response = await deleteProjectAction(projectId);

        if (response.success) {
            toast.success(response.message || 'Project deleted');
            router.push('/');
        } else {
            toast.error(response.error || 'Failed to delete project');
        }
    };

    const handleCreateList = async (data: { name: string; projectId: number }) => {
        const response = await createTaskListAction(data);

        if (response.success) {
            toast.success(response.message || 'List created');
            setAddListModal(false);
            loadProject();
        } else {
            toast.error(response.error || 'Failed to create list');
            throw new Error(response.error);
        }
    };

    const handleUpdateList = async (data: { name: string }) => {
        if (!editListModal || !projectId) return;

        const response = await updateTaskListAction(editListModal.id, projectId, data);

        if (response.success) {
            toast.success(response.message || 'List updated');
            setEditListModal(null);
            loadProject();
        } else {
            toast.error(response.error || 'Failed to update list');
            throw new Error(response.error);
        }
    };

    const handleDeleteList = async (listId: number) => {
        if (!projectId) return;

        if (!confirm('Are you sure you want to delete this list? This will delete all tasks in it.')) {
            return;
        }

        const response = await deleteTaskListAction(listId, projectId);

        if (response.success) {
            toast.success(response.message || 'List deleted');
            loadProject();
        } else {
            toast.error(response.error || 'Failed to delete list');
        }
    };

    const handleCreateTask = async (data: any) => {
        if (!projectId) return;

        const response = await createTaskAction(data, projectId);

        if (response.success) {
            toast.success(response.message || 'Task created');
            setAddTaskModal(null);
            loadProject();
        } else {
            toast.error(response.error || 'Failed to create task');
            throw new Error(response.error);
        }
    };

    const handleUpdateTask = async (data: any) => {
        if (!editTaskModal || !projectId) return;

        const response = await updateTaskAction(editTaskModal.id, projectId, data);

        if (response.success) {
            toast.success(response.message || 'Task updated');
            setEditTaskModal(null);
            loadProject();
        } else {
            toast.error(response.error || 'Failed to update task');
            throw new Error(response.error);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!projectId) return;

        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        const response = await deleteTaskAction(taskId, projectId);

        if (response.success) {
            toast.success(response.message || 'Task deleted');
            loadProject();
        } else {
            toast.error(response.error || 'Failed to delete task');
        }
    };

    const handleMoveTask = async (taskId: number, newListId: number, newPosition: number) => {
        if (!projectId) return;

        const response = await moveTaskAction(taskId, newListId, newPosition, projectId);

        if (response.success) {
            toast.success('Task moved');
            loadProject();
        } else {
            toast.error(response.error || 'Failed to move task');
        }
    };

    const handleCompleteTask = async (taskId: number, completed: boolean) => {
        if (!projectId) return;

        const response = completed
            ? await completeTaskAction(taskId, projectId)
            : await uncompleteTaskAction(taskId, projectId);

        if (response.success) {
            toast.success(response.message || (completed ? 'Task completed' : 'Task reopened'));
            loadProject();
        } else {
            toast.error(response.error || 'Failed to update task');
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Loading />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        Back
                    </Link>
                    <div className={styles.projectInfo}>
                        <h1 className={styles.projectName}>{project.name}</h1>
                        {project.description && (
                            <p className={styles.projectDescription}>{project.description}</p>
                        )}
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <Button variant="primary" onClick={() => setAddListModal(true)}>
                        <Plus size={18} />
                        Add List
                    </Button>

                    <div className={styles.menuContainer}>
                        <button
                            className={styles.menuButton}
                            onClick={() => setShowProjectMenu(!showProjectMenu)}
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showProjectMenu && (
                            <div className={styles.menu}>
                                <button
                                    className={styles.menuItem}
                                    onClick={() => {
                                        setEditProjectModal(true);
                                        setShowProjectMenu(false);
                                    }}
                                >
                                    <Edit2 size={16} />
                                    Edit Project
                                </button>
                                <button
                                    className={`${styles.menuItem} ${styles.danger}`}
                                    onClick={() => {
                                        handleDeleteProject();
                                        setShowProjectMenu(false);
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Delete Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <KanbanBoard
                    taskLists={project.taskLists || []}
                    projectId={project.id}
                    onAddList={() => setAddListModal(true)}
                    onEditList={(list) => setEditListModal(list)}
                    onDeleteList={handleDeleteList}
                    onAddTask={(listId) => setAddTaskModal(listId)}
                    onEditTask={(task) => setEditTaskModal(task)}
                    onDeleteTask={handleDeleteTask}
                    onMoveTask={handleMoveTask}
                    onCompleteTask={handleCompleteTask}
                />
            </main>

            {/* Modals */}
            <Modal
                isOpen={editProjectModal}
                onClose={() => setEditProjectModal(false)}
                title="Edit Project"
                size="md"
            >
                <ProjectForm
                    project={project}
                    onSubmit={handleUpdateProject}
                    onCancel={() => setEditProjectModal(false)}
                />
            </Modal>

            <Modal
                isOpen={addListModal}
                onClose={() => setAddListModal(false)}
                title="Create Task List"
                size="sm"
            >
                <TaskListForm
                    projectId={project.id}
                    onSubmit={handleCreateList}
                    onCancel={() => setAddListModal(false)}
                />
            </Modal>

            <Modal
                isOpen={!!editListModal}
                onClose={() => setEditListModal(null)}
                title="Edit Task List"
                size="sm"
            >
                {editListModal && (
                    <TaskListForm
                        taskList={editListModal}
                        projectId={project.id}
                        onSubmit={handleUpdateList}
                        onCancel={() => setEditListModal(null)}
                    />
                )}
            </Modal>

            <Modal
                isOpen={!!addTaskModal}
                onClose={() => setAddTaskModal(null)}
                title="Create Task"
                size="lg"
            >
                {addTaskModal && (
                    <TaskForm
                        listId={addTaskModal}
                        users={users}
                        onSubmit={handleCreateTask}
                        onCancel={() => setAddTaskModal(null)}
                    />
                )}
            </Modal>

            <Modal
                isOpen={!!editTaskModal}
                onClose={() => setEditTaskModal(null)}
                title="Edit Task"
                size="lg"
            >
                {editTaskModal && (
                    <TaskForm
                        task={editTaskModal}
                        listId={editTaskModal.listId}
                        users={users}
                        onSubmit={handleUpdateTask}
                        onCancel={() => setEditTaskModal(null)}
                    />
                )}
            </Modal>
        </div>
    );
}
