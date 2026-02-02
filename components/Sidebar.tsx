'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Projects', href: '/projects', icon: '📁' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Roles', href: '/roles', icon: '🔐' },
  { name: 'User Roles', href: '/user-roles', icon: '🎭' },
  { name: 'Completed Tasks', href: '/comments', icon: '✅' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h1>TaskFlow</h1>
        <p>Project Management</p>
      </div>

      <nav className={styles.nav}>
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive ? styles.active : ''}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.text}>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <p>© 2026 TaskFlow</p>
      </div>
    </aside>
  );
}
