'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import styles from './TopBar.module.css';

export default function TopBar() {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { data: session, status } = useSession();
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    const handleSignOut = async () => {
        setShowProfileMenu(false);
        await signOut({ callbackUrl: '/login' });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const displayName = session?.user?.name || (session?.user as any)?.username || 'User';
    const userRoles = (session?.user as any)?.roles || [];
    const primaryRole = userRoles[0] || 'Member';

    return (
        <header className={styles.topBar}>
            <div className={styles.searchContainer}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    placeholder="Search projects, tasks, or users..."
                    className={styles.searchInput}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                />
            </div>

            <div className={styles.actions}>
                <button className={styles.iconBtn} aria-label="Notifications">
                    🔔
                    <span className={styles.notificationBadge}></span>
                </button>
                <button className={styles.iconBtn} aria-label="Settings">
                    ⚙️
                </button>

                {status === 'authenticated' && session?.user && (
                    <div className={styles.profileWrapper} ref={profileMenuRef}>
                        <button
                            className={styles.profile}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className={styles.avatar}>{getInitials(displayName)}</div>
                            <div className={styles.profileInfo}>
                                <p className={styles.profileName}>{displayName}</p>
                                <p className={styles.profileRole}>{primaryRole}</p>
                            </div>
                        </button>
                        
                        {showProfileMenu && (
                            <div className={styles.profileMenu}>
                                <div className={styles.menuItem}>
                                    <span className={styles.menuIcon}>👤</span>
                                    <div>
                                        <p className={styles.menuTitle}>{displayName}</p>
                                        <p className={styles.menuSubtitle}>{session.user.email}</p>
                                    </div>
                                </div>
                                <div className={styles.menuDivider}></div>
                                <button 
                                    className={styles.menuButton}
                                    onClick={handleSignOut}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <span className={styles.menuIcon}>🚪</span>
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {status === 'loading' && (
                    <div className={styles.profile}>
                        <div className={styles.avatar}>...</div>
                    </div>
                )}
            </div>
        </header>
    );
}
