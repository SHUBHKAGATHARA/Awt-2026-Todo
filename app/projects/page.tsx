'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProjectsAction, deleteProjectAction } from '@/app/actions';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/useConfirm';
import styles from './page.module.css';

function getInitials(name: string) {
  return name
    .split(/[\s._-]/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProjectsPage() {
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const result = await getProjectsAction();
    if (result.success) {
      setProjects(result.data);
    }
    setLoading(false);
  }

  async function handleDelete(id: number, name: string) {
    const ok = await confirm({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${name}"? All lists and tasks inside will be permanently removed.`,
      confirmLabel: 'Delete Project',
      variant: 'danger',
    });
    if (!ok) return;

    const result = await deleteProjectAction(id);
    if (result.success) {
      toast.success('Project deleted successfully');
      loadProjects();
    } else {
      toast.error(result.error || 'Failed to delete project');
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      {ConfirmModal}
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Projects</h1>
          <p>Manage all your projects</p>
        </div>
        <Link href="/project/new" className={styles.createBtn}>
          + New Project
        </Link>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects found</p>
            <Link href="/project/new">Create your first project</Link>
          </div>
        ) : (
          projects.map((project: any) => (
            <div key={project.id} className={styles.card}>
              {/* Card Icon */}
              <div className={styles.cardIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
                </svg>
              </div>

              <div className={styles.cardHeader}>
                <h3>{project.name}</h3>
                <div className={styles.cardActions}>
                  <Link href={`/project/${project.id}`} className={styles.viewBtn}>
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className={styles.deleteIconBtn}
                    title="Delete project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className={styles.description}>
                {project.description || 'No description provided'}
              </p>

              <div className={styles.cardFooter}>
                <span className={styles.creator}>
                  <span className={styles.creatorAvatar}>
                    {getInitials(project.creator?.username || 'U')}
                  </span>
                  {project.creator?.username}
                </span>
                <span className={styles.date}>
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
