import { prisma } from './prisma';
import type {
    CreateProjectInput,
    UpdateProjectInput,
    CreateTaskListInput,
    UpdateTaskListInput,
    CreateTaskInput,
    UpdateTaskInput,
    CreateCommentInput,
} from '@/types';

// Helper function to sort tasks by priority
const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };

export function sortTasksByPriority(tasks: any[]) {
    return tasks.sort((a, b) => {
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 999;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 999;
        return priorityA - priorityB;
    });
}

// ============= PROJECTS =============

export async function getAllProjects() {
    const projects = await prisma.project.findMany({
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            taskLists: {
                orderBy: { position: 'asc' },
                include: {
                    tasks: {
                        orderBy: { position: 'asc' },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Sort tasks by priority within each list
    projects.forEach(project => {
        project.taskLists?.forEach(list => {
            if (list.tasks) {
                list.tasks = sortTasksByPriority(list.tasks);
            }
        });
    });

    return projects;
}

export async function getProjectById(id: number) {
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            taskLists: {
                orderBy: { position: 'asc' },
                include: {
                    tasks: {
                        orderBy: { position: 'asc' },
                        include: {
                            assignedUser: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    // Sort tasks by priority within each list
    if (project) {
        project.taskLists?.forEach(list => {
            if (list.tasks) {
                list.tasks = sortTasksByPriority(list.tasks);
            }
        });
    }

    return project;
}

export async function createProject(data: CreateProjectInput) {
    const project = await prisma.project.create({
        data,
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    // Verify creation
    const verified = await prisma.project.findUnique({ where: { id: project.id } });
    if (!verified) throw new Error('Project creation verification failed');

    return project;
}

export async function updateProject(id: number, data: UpdateProjectInput) {
    const project = await prisma.project.update({
        where: { id },
        data,
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    // Verify update
    const verified = await prisma.project.findUnique({ where: { id } });
    if (!verified) throw new Error('Project update verification failed');

    return project;
}

export async function deleteProject(id: number) {
    // Delete will cascade to task_lists and tasks
    await prisma.project.delete({ where: { id } });

    // Verify deletion
    const verified = await prisma.project.findUnique({ where: { id } });
    if (verified) throw new Error('Project deletion verification failed');

    return { success: true };
}

// ============= TASK LISTS =============

export async function getTaskListsByProjectId(projectId: number) {
    return await prisma.taskList.findMany({
        where: { projectId },
        include: {
            tasks: {
                orderBy: { position: 'asc' },
                include: {
                    assignedUser: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: { position: 'asc' },
    });
}

export async function createTaskList(data: CreateTaskListInput) {
    const taskList = await prisma.taskList.create({
        data,
        include: {
            tasks: true,
        },
    });

    // Verify creation
    const verified = await prisma.taskList.findUnique({ where: { id: taskList.id } });
    if (!verified) throw new Error('Task list creation verification failed');

    return taskList;
}

export async function updateTaskList(id: number, data: UpdateTaskListInput) {
    const taskList = await prisma.taskList.update({
        where: { id },
        data,
        include: {
            tasks: true,
        },
    });

    // Verify update
    const verified = await prisma.taskList.findUnique({ where: { id } });
    if (!verified) throw new Error('Task list update verification failed');

    return taskList;
}

export async function deleteTaskList(id: number) {
    // Delete will cascade to tasks
    await prisma.taskList.delete({ where: { id } });

    // Verify deletion
    const verified = await prisma.taskList.findUnique({ where: { id } });
    if (verified) throw new Error('Task list deletion verification failed');

    return { success: true };
}

// ============= TASKS =============

export async function getTasksByListId(listId: number) {
    return await prisma.task.findMany({
        where: { listId },
        include: {
            assignedUser: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
        orderBy: { position: 'asc' },
    });
}

export async function getTaskById(id: number) {
    return await prisma.task.findUnique({
        where: { id },
        include: {
            assignedUser: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            history: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });
}

export async function createTask(data: CreateTaskInput, userId: number) {
    const task = await prisma.task.create({
        data,
        include: {
            assignedUser: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    // Create history entry
    await prisma.taskHistory.create({
        data: {
            taskId: task.id,
            userId,
            action: 'created',
            newValue: JSON.stringify(task),
        },
    });

    // Verify creation
    const verified = await prisma.task.findUnique({ where: { id: task.id } });
    if (!verified) throw new Error('Task creation verification failed');

    return task;
}

export async function updateTask(id: number, data: UpdateTaskInput, userId: number) {
    // Get old task data
    const oldTask = await prisma.task.findUnique({ where: { id } });
    if (!oldTask) throw new Error('Task not found');

    // Update task
    const task = await prisma.task.update({
        where: { id },
        data,
        include: {
            assignedUser: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    // Create history entry for each changed field
    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    (Object.keys(data) as Array<keyof UpdateTaskInput>).forEach((key) => {
        if (data[key] !== undefined && oldTask[key] !== data[key]) {
            changes.push({
                field: key,
                oldValue: oldTask[key],
                newValue: data[key],
            });
        }
    });

    for (const change of changes) {
        await prisma.taskHistory.create({
            data: {
                taskId: id,
                userId,
                action: `updated_${change.field}`,
                oldValue: JSON.stringify(change.oldValue),
                newValue: JSON.stringify(change.newValue),
            },
        });
    }

    // Verify update
    const verified = await prisma.task.findUnique({ where: { id } });
    if (!verified) throw new Error('Task update verification failed');

    return task;
}

export async function deleteTask(id: number, userId: number) {
    // Get task data before deletion
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error('Task not found');

    // Create history entry before deletion
    await prisma.taskHistory.create({
        data: {
            taskId: id,
            userId,
            action: 'deleted',
            oldValue: JSON.stringify(task),
        },
    });

    // Delete task (will cascade to comments and history)
    await prisma.task.delete({ where: { id } });

    // Verify deletion
    const verified = await prisma.task.findUnique({ where: { id } });
    if (verified) throw new Error('Task deletion verification failed');

    return { success: true };
}

export async function moveTask(
    taskId: number,
    newListId: number,
    newPosition: number,
    userId: number
) {
    const oldTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!oldTask) throw new Error('Task not found');

    const task = await prisma.task.update({
        where: { id: taskId },
        data: {
            listId: newListId,
            position: newPosition,
        },
    });

    // Create history entry
    await prisma.taskHistory.create({
        data: {
            taskId,
            userId,
            action: 'moved',
            oldValue: JSON.stringify({ listId: oldTask.listId, position: oldTask.position }),
            newValue: JSON.stringify({ listId: newListId, position: newPosition }),
        },
    });

    return task;
}

// Mark task as complete
export async function completeTask(taskId: number, userId: number) {
    const task = await prisma.task.update({
        where: { id: taskId },
        data: {
            completedAt: new Date(),
            status: 'completed',
        },
        include: {
            assignedUser: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    // Create history entry
    await prisma.taskHistory.create({
        data: {
            taskId,
            userId,
            action: 'completed',
            oldValue: 'pending',
            newValue: 'completed',
        },
    });

    return task;
}

// Uncomplete task
export async function uncompleteTask(taskId: number, userId: number) {
    const task = await prisma.task.update({
        where: { id: taskId },
        data: {
            completedAt: null,
            status: 'pending',
        },
        include: {
            assignedUser: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    // Create history entry
    await prisma.taskHistory.create({
        data: {
            taskId,
            userId,
            action: 'uncompleted',
            oldValue: 'completed',
            newValue: 'pending',
        },
    });

    return task;
}

// Get recently completed tasks
export async function getRecentlyCompletedTasks(limit: number = 10) {
    return await prisma.task.findMany({
        where: {
            completedAt: {
                not: null,
            },
        },
        include: {
            assignedUser: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            taskList: {
                select: {
                    id: true,
                    name: true,
                    project: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: { completedAt: 'desc' },
        take: limit,
    });
}

// ============= COMMENTS =============

export async function getAllComments() {
    return await prisma.taskComment.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            task: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getCommentsByTaskId(taskId: number) {
    return await prisma.taskComment.findMany({
        where: { taskId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function createComment(data: CreateCommentInput) {
    const comment = await prisma.taskComment.create({
        data,
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    // Verify creation
    const verified = await prisma.taskComment.findUnique({ where: { id: comment.id } });
    if (!verified) throw new Error('Comment creation verification failed');

    return comment;
}

export async function deleteComment(id: number) {
    await prisma.taskComment.delete({ where: { id } });

    // Verify deletion
    const verified = await prisma.taskComment.findUnique({ where: { id } });
    if (verified) throw new Error('Comment deletion verification failed');

    return { success: true };
}

// ============= USERS =============

export async function getAllUsers() {
    return await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { username: 'asc' },
    });
}

export async function getUserById(id: number) {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function createUser(data: { username: string; email: string; password: string }) {
    return await prisma.user.create({
        data,
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function updateUser(id: number, data: { username?: string; email?: string; password?: string }) {
    return await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function deleteUser(id: number) {
    await prisma.user.delete({ where: { id } });
    return { success: true };
}

// ============= ROLES =============

export async function getAllRoles() {
    return await prisma.role.findMany({
        orderBy: { roleName: 'asc' },
    });
}

export async function getRoleById(id: number) {
    return await prisma.role.findUnique({
        where: { id },
    });
}

export async function createRole(data: { roleName: string; description?: string }) {
    return await prisma.role.create({
        data,
    });
}

export async function updateRole(id: number, data: { roleName?: string; description?: string }) {
    return await prisma.role.update({
        where: { id },
        data,
    });
}

export async function deleteRole(id: number) {
    await prisma.role.delete({ where: { id } });
    return { success: true };
}

// ============= USER ROLES =============

export async function getAllUserRoles() {
    return await prisma.userRole.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            role: {
                select: {
                    id: true,
                    roleName: true,
                    description: true,
                },
            },
        },
        orderBy: { assignedAt: 'desc' },
    });
}

export async function getUserRoleById(id: number) {
    return await prisma.userRole.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            role: {
                select: {
                    id: true,
                    roleName: true,
                    description: true,
                },
            },
        },
    });
}

export async function createUserRole(data: { userId: number; roleId: number }) {
    return await prisma.userRole.create({
        data,
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            role: {
                select: {
                    id: true,
                    roleName: true,
                    description: true,
                },
            },
        },
    });
}

export async function deleteUserRole(id: number) {
    await prisma.userRole.delete({ where: { id } });
    return { success: true };
}

// ============= HISTORY =============

export async function getTaskHistory(taskId: number) {
    return await prisma.taskHistory.findMany({
        where: { taskId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
