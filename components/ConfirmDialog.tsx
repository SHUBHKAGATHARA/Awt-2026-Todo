'use client';

import { createPortal } from 'react-dom';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

/* ── SVG icons ── */
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

const WarnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
);

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Delete',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null;

    const iconClass = variant === 'danger' ? styles.iconCircleDanger : styles.iconCircleWarning;
    const btnClass = variant === 'danger' ? styles.danger : styles.warning;

    const content = (
        <div className={styles.overlay} onClick={onCancel}>
            <div
                className={styles.dialog}
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-msg"
            >
                {/* Icon */}
                <div className={styles.iconStrip}>
                    <div className={[styles.iconCircle, iconClass].join(' ')}>
                        {variant === 'danger' ? <TrashIcon /> : <WarnIcon />}
                    </div>
                </div>

                {/* Text */}
                <div className={styles.content}>
                    <h2 className={styles.title} id="confirm-title">{title}</h2>
                    <p className={styles.message} id="confirm-msg">{message}</p>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        Cancel
                    </button>
                    <button className={[styles.confirmBtn, btnClass].join(' ')} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );

    // Render into document.body via a portal so it sits above everything
    if (typeof window === 'undefined') return null;
    return createPortal(content, document.body);
}
