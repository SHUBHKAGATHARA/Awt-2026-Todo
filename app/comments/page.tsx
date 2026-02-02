'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRecentlyCompletedTasksAction } from '@/app/actions';
import { format } from 'date-fns';
import { CheckCircle2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';
import type { Task } from '@/types';

export default function CommentsPage() {
  const router = useRouter();
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompletedTasks();
  }, []);

  async function loadCompletedTasks() {
    const result = await getRecentlyCompletedTasksAction();
    if (result.success) {
      setCompletedTasks(result.data);
    } else {
      toast.error(result.error || 'Failed to load completed tasks');
    }
    setLoading(false);
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  if (loading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1><CheckCircle2 size={32} style={{ display: 'inline', marginRight: '12px' }} />Completed Tasks</h1>
          <p>View recently completed tasks across all projects</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>List</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {completedTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No completed tasks found
                </td>
              </tr>
            ) : (
              completedTasks.map((task: Task) => (
                <tr key={task.id} className={styles.completedRow}>
                  <td>
                    <div className={styles.taskInfo}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      {task.description && (
                        <span className={styles.taskDescription}>{task.description}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <Link href={`/project/${task.taskList?.project?.id}`} className={styles.projectLink}>
                      {task.taskList?.project?.name || 'N/A'}
                    </Link>
                  </td>
                  <td>
                    <span className={styles.listBadge}>{task.taskList?.name || 'N/A'}</span>
                  </td>
                  <td>
                    <span 
                      className={styles.priorityBadge}
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.assignedUser ? (
                      <span className={styles.userBadge}>{task.assignedUser.username}</span>
                    ) : (
                      <span className={styles.unassigned}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      <Calendar size={14} />
                      {task.completedAt 
                        ? format(new Date(task.completedAt), 'MMM d, yyyy h:mm a')
                        : 'N/A'
                      }
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
