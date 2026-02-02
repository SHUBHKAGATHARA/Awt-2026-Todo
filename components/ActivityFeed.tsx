import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import styles from './ActivityFeed.module.css';
import type { Task } from '@/types';

interface ActivityFeedProps {
    completedTasks: Task[];
}

export default function ActivityFeed({ completedTasks }: ActivityFeedProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#eab308';
            case 'low': return '#22c55e';
            default: return '#6b7280';
        }
    };

    return (
        <div className={styles.feedContainer}>
            <div className={styles.header}>
                <h3 className={styles.title}>Recently Completed</h3>
                <Link href="/comments" className={styles.viewAll}>
                    View All
                </Link>
            </div>

            <div className={styles.list}>
                {completedTasks.length === 0 ? (
                    <div className={styles.emptyState}>
                        <CheckCircle2 size={48} style={{ opacity: 0.3 }} />
                        <p>No completed tasks yet</p>
                    </div>
                ) : (
                    completedTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className={styles.item}>
                            <div className={styles.avatarContainer}>
                                <div
                                    className={styles.avatar}
                                    style={{ backgroundColor: `${getPriorityColor(task.priority)}20` }}
                                >
                                    ✅
                                </div>
                            </div>
                            <div className={styles.content}>
                                <p className={styles.text}>
                                    {task.assignedUser && (
                                        <span className={styles.highlight}>{task.assignedUser.username}</span>
                                    )}
                                    {task.assignedUser ? ' completed ' : 'Completed '}
                                    <span className={styles.highlight}>{task.title}</span>
                                    {task.taskList?.project && (
                                        <>
                                            {' in '}
                                            <Link 
                                                href={`/project/${task.taskList.project.id}`}
                                                className={styles.projectLink}
                                            >
                                                {task.taskList.project.name}
                                            </Link>
                                        </>
                                    )}
                                </p>
                                <span className={styles.time}>
                                    {task.completedAt 
                                        ? formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })
                                        : 'Recently'
                                    }
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
