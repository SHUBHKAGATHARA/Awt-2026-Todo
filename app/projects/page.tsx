'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProjectsAction, deleteProjectAction } from '@/app/actions';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function ProjectsPage() {
  const router = useRouter();
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

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
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
      <div className={styles.header}>
        <div>
          <h1>Projects</h1>
          <p>Manage all your projects</p>
        </div>
        <Link href="/project/new" className={styles.createBtn}>
          + New Project
        </Link>
      </div>

      <div className={styles.grid}>
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects found</p>
            <Link href="/project/new">Create your first project</Link>
          </div>
        ) : (
          projects.map((project: any) => (
            <div key={project.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{project.name}</h3>
                <div className={styles.cardActions}>
                  <Link href={`/project/${project.id}`} className={styles.viewBtn}>
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className={styles.deleteIconBtn}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className={styles.description}>
                {project.description || 'No description'}
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.creator}>
                  👤 {project.creator?.username}
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
