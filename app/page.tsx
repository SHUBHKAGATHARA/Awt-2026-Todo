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
          <div className={styles.metaRow}>
            <span className={styles.metaPill}>Workspace status: Stable</span>
            <span className={styles.metaPill}>Synced moments ago</span>
          </div>
        </div>
        <Link href="/project/new" className={styles.createBtn}>
          <span>New Project</span>
        </Link>
      </header>

      <div className={styles.dashboardLayout}>
        <div className={styles.mainContent}>
          <div className={styles.statsGrid}>
            <Link href="/projects" className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{projects.length}</div>
                <div className={styles.statLabel}>Active Projects</div>
                <div className={styles.statHint}>Across your portfolio</div>
              </div>
              <div className={styles.cardBadge}>View All</div>
            </Link>

            <Link href="/users" className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{users.length}</div>
                <div className={styles.statLabel}>Team Members</div>
                <div className={styles.statHint}>Currently collaborating</div>
              </div>
              <div className={styles.cardBadge}>Manage</div>
            </Link>

            <Link href="/roles" className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{roles.length}</div>
                <div className={styles.statLabel}>User Roles</div>
                <div className={styles.statHint}>Access guardrails</div>
              </div>
              <div className={styles.cardBadge}>Configure</div>
            </Link>

            <Link href="/comments" className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalCompletedTasks}</div>
                <div className={styles.statLabel}>Completed</div>
                <div className={styles.statHint}>Shipped this week</div>
              </div>
              <div className={styles.cardBadge}>Review</div>
            </Link>
          </div>

          <div className={styles.recentSection}>
            <h2 className={styles.sectionTitle}>
              Recent Projects
            </h2>
            {projects.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No projects yet. Create your first project to get started!</p>
                <Link href="/project/new" className={styles.createBtn}>
                  <span>Start a Project</span>
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
                    <div className={styles.projectHeader}>
                      <h3 className={styles.projectName}>{project.name}</h3>
                    </div>
                    <p className={styles.projectDescription}>
                      {project.description || 'No description provided'}
                    </p>
                    <div className={styles.projectMeta}>
                      <span className={styles.metaItem}>
                        {project.taskLists?.reduce(
                          (acc: number, list: any) => acc + (list.tasks?.length || 0),
                          0
                        ) || 0}{' '}
                        tasks
                      </span>
                      <span className={styles.metaItem}>
                        {project.taskLists?.length || 0} lists
                      </span>
                    </div>
                    <div className={styles.projectFooter}>
                      <span className={styles.viewProject}>View Project →</span>
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

