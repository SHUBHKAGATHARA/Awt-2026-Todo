'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRecentlyCompletedTasksAction } from '@/app/actions';
import { format } from 'date-fns';
import { CheckCircle2, Calendar, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';
import type { Task } from '@/types';

export default function CommentsPage() {
  const router = useRouter();
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadCompletedTasks(); }, []);

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

  /** Client-side search filtering */
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return completedTasks;
    return completedTasks.filter((task) => {
      return (
        task.title?.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.taskList?.project?.name?.toLowerCase().includes(q) ||
        task.taskList?.name?.toLowerCase().includes(q) ||
        task.priority?.toLowerCase().includes(q) ||
        task.assignedUser?.username?.toLowerCase().includes(q)
      );
    });
  }, [completedTasks, searchQuery]);

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loadingState}>Loading completed tasks...</div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Completed Tasks</h1>
          <p className={styles.subtitle}>Track your team's accomplishments across all projects</p>
        </div>
        <div className={styles.statsBox}>
          <span className={styles.statsNumber}>{completedTasks.length}</span>
          <span className={styles.statsLabel}>Tasks Done</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by task, project, assignee, priority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => setSearchQuery('')} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
        {searchQuery && (
          <span className={styles.resultCount}>
            {filtered.length} of {completedTasks.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <CheckCircle2 size={40} strokeWidth={1.5} />
                  </div>
                  <p>
                    {searchQuery
                      ? `No tasks match "${searchQuery}"`
                      : 'No completed tasks yet. Finish a task to see it here.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((task: Task) => (
                <tr key={task.id} className={styles.completedRow}>
                  <td>
                    <div className={styles.taskInfo}>
                      <CheckCircle2 size={15} className={styles.checkIcon} />
                      <div>
                        <span className={styles.taskTitle}>{task.title}</span>
                        {task.description && (
                          <span className={styles.taskDescription}>{task.description}</span>
                        )}
                      </div>
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
                      <div className={styles.userCell}>
                        <span className={styles.userAvatar}>
                          {task.assignedUser.username.charAt(0).toUpperCase()}
                        </span>
                        <span className={styles.userBadge}>{task.assignedUser.username}</span>
                      </div>
                    ) : (
                      <span className={styles.unassigned}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      <Calendar size={13} />
                      {task.completedAt
                        ? format(new Date(task.completedAt), 'MMM d, yyyy · h:mm a')
                        : '—'}
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
