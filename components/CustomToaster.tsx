'use client';

import { Toaster, ToastBar, toast, type Toast } from 'react-hot-toast';
import styles from './CustomToast.module.css';

/* ── SVG icons ─────────────────────────────────── */
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
    </svg>
);

/* ── Resolve type meta ──────────────────────────── */
function getToastMeta(t: Toast) {
    if (t.type === 'success') {
        return {
            label: 'Success',
            wrapClass: styles.successIcon,
            typeClass: styles.successType,
            barClass: styles.successBar,
            borderClass: styles.success,
            icon: <CheckIcon />,
        };
    }
    if (t.type === 'error') {
        return {
            label: 'Error',
            wrapClass: styles.errorIcon,
            typeClass: styles.errorType,
            barClass: styles.errorBar,
            borderClass: styles.error,
            icon: <ErrorIcon />,
        };
    }
    if (t.type === 'loading') {
        return {
            label: 'Working…',
            wrapClass: styles.loadingIcon,
            typeClass: styles.loadingType,
            barClass: styles.loadingBar,
            borderClass: styles.loading,
            icon: <span className={styles.spinner} />,
        };
    }
    return {
        label: 'Notice',
        wrapClass: styles.customIcon,
        typeClass: styles.customType,
        barClass: styles.customBar,
        borderClass: styles.custom,
        icon: <InfoIcon />,
    };
}

/* ── Custom Toaster ─────────────────────────────── */
export default function CustomToaster() {
    const DURATION = 4000; // ms — keep in sync with CSS drain

    return (
        <Toaster
            position="top-right"
            gutter={10}
            containerStyle={{ top: 16, right: 16 }}
            toastOptions={{ duration: DURATION }}
        >
            {(t) => {
                const meta = getToastMeta(t);

                return (
                    <ToastBar toast={t} style={{ background: 'transparent', boxShadow: 'none', padding: 0, maxWidth: 420 }}>
                        {({ message }) => (
                            <div
                                className={[
                                    styles.toast,
                                    meta.borderClass,
                                    t.visible ? styles.toastEnter : styles.toastExit,
                                ].join(' ')}
                            >
                                {/* Icon */}
                                <div className={[styles.iconWrap, meta.wrapClass].join(' ')}>
                                    {meta.icon}
                                </div>

                                {/* Text */}
                                <div className={styles.body}>
                                    <span className={[styles.type, meta.typeClass].join(' ')}>
                                        {meta.label}
                                    </span>
                                    <div className={styles.message}>{message}</div>
                                </div>

                                {/* Dismiss */}
                                {t.type !== 'loading' && (
                                    <button
                                        className={styles.dismiss}
                                        onClick={() => toast.dismiss(t.id)}
                                        aria-label="Dismiss notification"
                                    >
                                        <CloseIcon />
                                    </button>
                                )}

                                {/* Progress bar */}
                                {t.type !== 'loading' && (
                                    <div
                                        className={[styles.progressBar, meta.barClass].join(' ')}
                                        style={{
                                            animationDuration: `${DURATION}ms`,
                                            animationPlayState: t.visible ? 'running' : 'paused',
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </ToastBar>
                );
            }}
        </Toaster>
    );
}
