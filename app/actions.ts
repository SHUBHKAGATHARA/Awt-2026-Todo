'use server';

import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getTaskListsByProjectId,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    getTasksByListId,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    completeTask,
    uncompleteTask,
    getRecentlyCompletedTasks,
    getAllComments,
    createComment,
    getCommentsByTaskId,
    deleteComment,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getAllUserRoles,
    getUserRoleById,
    createUserRole,
    deleteUserRole,
    getTaskHistory,
} from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import type {
    CreateProjectInput,
    UpdateProjectInput,
    CreateTaskListInput,
    UpdateTaskListInput,
    CreateTaskInput,
    UpdateTaskInput,
    CreateCommentInput,
    ApiResponse,
} from '@/types';
import { revalidatePath } from 'next/cache';

// ============= PROJECTS =============

export async function getProjectsAction(): Promise<ApiResponse<any>> {
    try {
        const projects = await getAllProjects();
        return { success: true, data: projects };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getProjectAction(id: number): Promise<ApiResponse<any>> {
    try {
        const project = await getProjectById(id);
        if (!project) {
            return { success: false, error: 'Project not found' };
        }
        return { success: true, data: project };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createProjectAction(
    data: CreateProjectInput
): Promise<ApiResponse<any>> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const project = await createProject({ ...data, createdBy: user.id });
        revalidatePath('/');
        return { success: true, data: project, message: 'Project created successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateProjectAction(
    id: number,
    data: UpdateProjectInput
): Promise<ApiResponse<any>> {
    try {
        const project = await updateProject(id, data);
        revalidatePath('/');
        revalidatePath(`/project/${id}`);
        return { success: true, data: project, message: 'Project updated successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteProjectAction(id: number): Promise<ApiResponse<any>> {
    try {
        await deleteProject(id);
        revalidatePath('/');
        return { success: true, message: 'Project deleted successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============= TASK LISTS =============

export async function getTaskListsAction(projectId: number): Promise<ApiResponse<any>> {
    try {
        const taskLists = await getTaskListsByProjectId(projectId);
        return { success: true, data: taskLists };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createTaskListAction(
    data: CreateTaskListInput
): Promise<ApiResponse<any>> {
    try {
        const taskList = await createTaskList(data);
        revalidatePath(`/project/${data.projectId}`);
        return { success: true, data: taskList, message: 'List created successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTaskListAction(
    id: number,
    projectId: number,
    data: UpdateTaskListInput
): Promise<ApiResponse<any>> {
    try {
        const taskList = await updateTaskList(id, data);
        revalidatePath(`/project/${projectId}`);
        return { success: true, data: taskList, message: 'List updated successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTaskListAction(
    id: number,
    projectId: number
): Promise<ApiResponse<any>> {
    try {
        await deleteTaskList(id);
        revalidatePath(`/project/${projectId}`);
        return { success: true, message: 'List deleted successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============= TASKS =============

export async function getTasksAction(listId: number): Promise<ApiResponse<any>> {
    try {
        const tasks = await getTasksByListId(listId);
        return { success: true, data: tasks };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTaskAction(id: number): Promise<ApiResponse<any>> {
    try {
        const task = await getTaskById(id);
        if (!task) {
            return { success: false, error: 'Task not found' };
        }
        return { success: true, data: task };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createTaskAction(
    data: CreateTaskInput,
    projectId: number
): Promise<ApiResponse<any>> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const task = await createTask(data, user.id);
        revalidatePath(`/project/${projectId}`);
        return { success: true, data: task, message: 'Task created successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTaskAction(
    id: number,
    projectId: number,
    data: UpdateTaskInput
): Promise<ApiResponse<any>> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const task = await updateTask(id, data, user.id);
        revalidatePath(`/project/${projectId}`);
        return { success: true, data: task, message: 'Task updated successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTaskAction(
    id: number,
    projectId: number
): Promise<ApiResponse<any>> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        await deleteTask(id, user.id);
        revalidatePath(`/project/${projectId}`);
        return { success: true, message: 'Task deleted successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function moveTaskAction(
    taskId: number,
    newListId: number,
    newPosition: number,
    projectId: number
): Promise<ApiResponse<any>> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const task = await moveTask(taskId, newListId, newPosition, user.id);
        revalidatePath(`/project/${projectId}`);
        return { success: true, data: task, message: 'Task moved successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============= COMMENTS =============

export async function getAllCommentsAction(): Promise<ApiResponse<any>> {
    try {
        const comments = await getAllComments();
        return { success: true, data: comments };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getCommentsAction(taskId: number): Promise<ApiResponse<any>> {
    try {
        const comments = await getCommentsByTaskId(taskId);
        return { success: true, data: comments };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createCommentAction(
    data: Omit<CreateCommentInput, 'userId'>,
    projectId: number
): Promise<ApiResponse<any>> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const comment = await createComment({ ...data, userId: user.id });
        revalidatePath(`/project/${projectId}`);
        return { success: true, data: comment, message: 'Comment added successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCommentAction(
    id: number,
    projectId: number
): Promise<ApiResponse<any>> {
    try {
        await deleteComment(id);
        revalidatePath(`/project/${projectId}`);
        return { success: true, message: 'Comment deleted successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCommentGlobalAction(id: number): Promise<ApiResponse<any>> {
    try {
        await deleteComment(id);
        return { success: true, message: 'Comment deleted successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============= USERS =============

export async function getUsersAction(): Promise<ApiResponse<any>> {
    try {
        const users = await getAllUsers();
        return { success: true, data: users };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getUserAction(id: number): Promise<ApiResponse<any>> {
    try {
        const user = await getUserById(id);
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        return { success: true, data: user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createUserAction(
    data: { username: string; email: string; password: string }
): Promise<ApiResponse<any>> {
    try {
        const user = await createUser(data);
        return { success: true, data: user, message: 'User created successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUserAction(
    id: number,
    data: { username?: string; email?: string; password?: string }
): Promise<ApiResponse<any>> {
    try {
        const user = await updateUser(id, data);
        return { success: true, data: user, message: 'User updated successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUserAction(id: number): Promise<ApiResponse<any>> {
    try {
        await deleteUser(id);
        return { success: true, message: 'User deleted successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============= ROLES =============

export async function getRolesAction(): Promise<ApiResponse<any>> {
    try {
        const roles = await getAllRoles();
        return { success: true, data: roles };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRoleAction(id: number): Promise<ApiResponse<any>> {
    try {
        const role = await getRoleById(id);
        if (!role) {
            return { success: false, error: 'Role not found' };
        }
        return { success: true, data: role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createRoleAction(
    data: { roleName: string; description?: string }
): Promise<ApiResponse<any>> {
    try {
        const role = await createRole(data);
        return { success: true, data: role, message: 'Role created successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRoleAction(
    id: number,
    data: { roleName?: string; description?: string }
): Promise<ApiResponse<any>> {
    try {
        const role = await updateRole(id, data);
        return { success: true, data: role, message: 'Role updated successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRoleAction(id: number): Promise<ApiResponse<any>> {
    try {
        await deleteRole(id);
        return { success: true, message: 'Role deleted successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============= USER ROLES =============

export async function getUserRolesAction(): Promise<ApiResponse<any>> {
    try {
        const userRoles = await getAllUserRoles();
        return { success: true, data: userRoles };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getUserRoleAction(id: number): Promise<ApiResponse<any>> {
    try {
        const userRole = await getUserRoleById(id);
        if (!userRole) {
            return { success: false, error: 'User role not found' };
        }
        return { success: true, data: userRole };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createUserRoleAction(
    data: { userId: number; roleId: number }
): Promise<ApiResponse<any>> {
    try {
        const userRole = await createUserRole(data);
        return { success: true, data: userRole, message: 'User role assigned successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUserRoleAction(id: number): Promise<ApiResponse<any>> {
    try {
        await deleteUserRole(id);
        return { success: true, message: 'User role removed successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============= HISTORY =============

export async function getTaskHistoryAction(taskId: number): Promise<ApiResponse<any>> {
    try {
        const history = await getTaskHistory(taskId);
        return { success: true, data: history };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============= TASK COMPLETION =============

export async function completeTaskAction(
    taskId: number,
    projectId: number
): Promise<ApiResponse<any>> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const task = await completeTask(taskId, user.id);
        revalidatePath(`/project/${projectId}`);
        revalidatePath('/');
        return { success: true, data: task, message: 'Task marked as complete!' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function uncompleteTaskAction(
    taskId: number,
    projectId: number
): Promise<ApiResponse<any>> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const task = await uncompleteTask(taskId, user.id);
        revalidatePath(`/project/${projectId}`);
        revalidatePath('/');
        return { success: true, data: task, message: 'Task marked as incomplete' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRecentlyCompletedTasksAction(): Promise<ApiResponse<any>> {
    try {
        const tasks = await getRecentlyCompletedTasks(10);
        return { success: true, data: tasks };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
