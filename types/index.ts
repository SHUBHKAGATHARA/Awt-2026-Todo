export interface User {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Role {
    id: number;
    roleName: string;
    description?: string;
    createdAt: Date;
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
    creator?: User;
    taskLists?: TaskList[];
}

export interface TaskList {
    id: number;
    projectId: number;
    name: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    project?: Project;
    tasks?: Task[];
}

export interface Task {
    id: number;
    listId: number;
    title: string;
    description?: string;
    status: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: number;
    dueDate?: Date;
    completedAt?: Date;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    taskList?: TaskList;
    assignedUser?: User;
    comments?: TaskComment[];
    history?: TaskHistory[];
}

export interface TaskComment {
    id: number;
    taskId: number;
    userId: number;
    comment: string;
    createdAt: Date;
    task?: Task;
    user?: User;
}

export interface TaskHistory {
    id: number;
    taskId: number;
    userId: number;
    action: string;
    oldValue?: string;
    newValue?: string;
    createdAt: Date;
    task?: Task;
    user?: User;
}

export interface CreateProjectInput {
    name: string;
    description?: string;
    createdBy: number;
}

export interface UpdateProjectInput {
    name?: string;
    description?: string;
}

export interface CreateTaskListInput {
    projectId: number;
    name: string;
    position?: number;
}

export interface UpdateTaskListInput {
    name?: string;
    position?: number;
}

export interface CreateTaskInput {
    listId: number;
    title: string;
    description?: string;
    status?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: number;
    dueDate?: Date;
    position?: number;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: number;
    dueDate?: Date;
    position?: number;
    listId?: number;
}

export interface CreateCommentInput {
    taskId: number;
    userId: number;
    comment: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
