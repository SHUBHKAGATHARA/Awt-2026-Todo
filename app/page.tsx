import Link from 'next/link';
import ActivityFeed from '@/components/ActivityFeed';
import { getProjectsAction, getUsersAction, getRolesAction, getRecentlyCompletedTasksAction } from './actions';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [projectsResponse, usersResponse, rolesResponse, completedTasksResponse] = await Promise.all([
    getProjectsAction(),
    getUsersAction(),
    getRolesAction(),
    getRecentlyCompletedTasksAction(),
  ]);

  const projects = projectsResponse.success ? projectsResponse.data : [];
  const users = usersResponse.success ? usersResponse.data : [];
  const roles = rolesResponse.success ? rolesResponse.data : [];
  const completedTasks = completedTasksResponse.success ? completedTasksResponse.data : [];

  const totalTasks = projects.reduce(
    (acc: number, project: any) =>
      acc +
      (project.taskLists?.reduce(
        (listAcc: number, list: any) => listAcc + (list.tasks?.length || 0),
        0
      ) || 0),
    0
  );

  const totalCompletedTasks = completedTasks.length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back to your workspace</p>
        </div>
        <Link href="/project/new" className={styles.createBtn}>
          + New Project
        </Link>
      </header>

      <div className={styles.dashboardLayout}>
        <div className={styles.mainContent}>
          <div className={styles.statsGrid}>
            <Link href="/projects" className={styles.statCard}>
              <div className={styles.statIcon}>📁</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{projects.length}</div>
                <div className={styles.statLabel}>Projects</div>
              </div>
            </Link>

            <Link href="/users" className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{users.length}</div>
                <div className={styles.statLabel}>Users</div>
              </div>
            </Link>

            <Link href="/roles" className={styles.statCard}>
              <div className={styles.statIcon}>🔐</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{roles.length}</div>
                <div className={styles.statLabel}>Roles</div>
              </div>
            </Link>

            <Link href="/comments" className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalCompletedTasks}</div>
                <div className={styles.statLabel}>Completed Tasks</div>
              </div>
            </Link>
          </div>

          <div className={styles.recentSection}>
            <h2 className={styles.sectionTitle}>Recent Projects</h2>
            {projects.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No projects yet. Create your first project to get started!</p>
                <Link href="/project/new" className={styles.createBtn}>
                  Start a Project
                </Link>
              </div>
            ) : (
              <div className={styles.projectGrid}>
                {projects.slice(0, 6).map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    className={styles.projectCard}
                  >
                    <h3 className={styles.projectName}>{project.name}</h3>
                    <p className={styles.projectDescription}>
                      {project.description || 'No description provided'}
                    </p>
                    <div className={styles.projectMeta}>
                      <span>
                        {project.taskLists?.reduce(
                          (acc: number, list: any) => acc + (list.tasks?.length || 0),
                          0
                        ) || 0}{' '}
                        tasks
                      </span>
                      <span>{project.taskLists?.length || 0} lists</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className={styles.sidebarContent}>
          <ActivityFeed completedTasks={completedTasks} />
        </aside>
      </div>
    </div>
  );
}

