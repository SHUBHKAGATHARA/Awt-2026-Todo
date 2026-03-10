'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    getProjectsAction,
    getUsersAction,
    getRolesAction,
    getRecentlyCompletedTasksAction,
} from '@/app/actions';
import styles from './GlobalSearch.module.css';

/* ── SVG helpers ──────────────────────────────────────── */
const SearchSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);
const CloseSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
    </svg>
);
const ArrowSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);
const FolderSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
    </svg>
);
const UserSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
const TaskSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const ShieldSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

/* ── Types ──────────────────────────────────────────────── */
interface SearchResult {
    id: string;
    type: 'project' | 'user' | 'task' | 'role';
    title: string;
    meta: string;
    href: string;
}

/* ── Fetch & flatten all data once ─────────────────────── */
async function fetchAll(): Promise<SearchResult[]> {
    const [projects, users, roles, tasks] = await Promise.allSettled([
        getProjectsAction(),
        getUsersAction(),
        getRolesAction(),
        getRecentlyCompletedTasksAction(),
    ]);

    const results: SearchResult[] = [];

    if (projects.status === 'fulfilled' && projects.value.success) {
        for (const p of projects.value.data) {
            results.push({
                id: `project-${p.id}`,
                type: 'project',
                title: p.name,
                meta: p.description || 'Project',
                href: `/project/${p.id}`,
            });
        }
    }

    if (users.status === 'fulfilled' && users.value.success) {
        for (const u of users.value.data) {
            results.push({
                id: `user-${u.id}`,
                type: 'user',
                title: u.username,
                meta: u.email || 'User',
                href: `/users/${u.id}`,
            });
        }
    }

    if (roles.status === 'fulfilled' && roles.value.success) {
        for (const r of roles.value.data) {
            results.push({
                id: `role-${r.id}`,
                type: 'role',
                title: r.roleName,
                meta: r.description || 'Role',
                href: `/roles/${r.id}`,
            });
        }
    }

    if (tasks.status === 'fulfilled' && tasks.value.success) {
        for (const t of tasks.value.data) {
            results.push({
                id: `task-${t.id}`,
                type: 'task',
                title: t.title,
                meta: t.taskList?.project?.name || 'Completed task',
                href: t.taskList?.project?.id ? `/project/${t.taskList.project.id}` : '/comments',
            });
        }
    }

    return results;
}

/* ── Component ──────────────────────────────────────────── */
export default function GlobalSearch() {
    const router = useRouter();

    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allData, setAllData] = useState<SearchResult[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /* Close on outside click */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Keyboard shortcut ⌘K / Ctrl+K */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    /* Load data on first focus */
    const handleFocus = useCallback(async () => {
        setOpen(true);
        if (!dataLoaded) {
            setLoading(true);
            const data = await fetchAll();
            setAllData(data);
            setDataLoaded(true);
            setLoading(false);
        }
    }, [dataLoaded]);

    /* Filter results */
    const q = query.trim().toLowerCase();
    const filtered = q
        ? allData.filter(
            (r) => r.title.toLowerCase().includes(q) || r.meta.toLowerCase().includes(q)
        )
        : [];

    /* Group by type */
    const groups: Record<string, SearchResult[]> = {};
    for (const r of filtered) {
        if (!groups[r.type]) groups[r.type] = [];
        groups[r.type].push(r);
    }

    const typeConfig: Record<string, { label: string; iconClass: string; Icon: React.FC }> = {
        project: { label: 'Projects', iconClass: styles.iconProject, Icon: FolderSVG },
        user: { label: 'Users', iconClass: styles.iconUser, Icon: UserSVG },
        task: { label: 'Completed Tasks', iconClass: styles.iconTask, Icon: TaskSVG },
        role: { label: 'Roles', iconClass: styles.iconRole, Icon: ShieldSVG },
    };

    const handleSelect = (href: string) => {
        router.push(href);
        setOpen(false);
        setQuery('');
    };

    const showDropdown = open && (loading || q.length > 0);

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <div className={styles.inputRow}>
                <span className={styles.searchIcon}><SearchSVG /></span>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.input}
                    placeholder="Search projects, users, tasks…"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={handleFocus}
                    autoComplete="off"
                />
                {query && (
                    <button className={styles.clearBtn} onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
                        <CloseSVG />
                    </button>
                )}
            </div>

            {showDropdown && (
                <div className={styles.dropdown}>
                    {loading ? (
                        <div className={styles.loading}>Loading…</div>
                    ) : filtered.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}><SearchSVG /></div>
                            No results for <strong>"{query}"</strong>
                        </div>
                    ) : (
                        <>
                            {Object.entries(groups).map(([type, items], idx) => {
                                const cfg = typeConfig[type];
                                if (!cfg) return null;
                                const { label, iconClass, Icon } = cfg;
                                return (
                                    <div className={styles.section} key={type}>
                                        {idx > 0 && <div className={styles.divider} />}
                                        <div className={styles.sectionHeader}>
                                            <Icon />
                                            {label} ({items.length})
                                        </div>
                                        {items.slice(0, 5).map((r) => (
                                            <div
                                                key={r.id}
                                                className={styles.resultItem}
                                                onClick={() => handleSelect(r.href)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSelect(r.href)}
                                                role="option"
                                                tabIndex={0}
                                                aria-selected={false}
                                            >
                                                <div className={[styles.resultIcon, iconClass].join(' ')}>
                                                    <Icon />
                                                </div>
                                                <div className={styles.resultText}>
                                                    <div className={styles.resultTitle}>{r.title}</div>
                                                    <div className={styles.resultMeta}>{r.meta}</div>
                                                </div>
                                                <span className={styles.resultArrow}><ArrowSVG /></span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                            <div className={styles.footer}>
                                Press <kbd>↵</kbd> to select · <kbd>Esc</kbd> to close
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
