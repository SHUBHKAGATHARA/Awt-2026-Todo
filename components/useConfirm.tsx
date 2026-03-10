'use client';

import { useState, useCallback, useRef } from 'react';
import ConfirmDialog from './ConfirmDialog';

interface ConfirmOptions {
    title?: string;
    message?: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning';
}

/**
 * useConfirm — drop-in replacement for window.confirm().
 *
 * Usage:
 *   const { confirm, ConfirmModal } = useConfirm();
 *
 *   // Inside the JSX:
 *   <>{ConfirmModal}</>
 *
 *   // Replace:  if (!confirm('…')) return;
 *   // With:     if (!(await confirm({ title: '…', message: '…' }))) return;
 */
export function useConfirm() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({});
    const resolveRef = useRef<(val: boolean) => void>(() => { });

    const confirm = useCallback((opts: ConfirmOptions | string): Promise<boolean> => {
        const resolved: ConfirmOptions =
            typeof opts === 'string'
                ? { title: 'Are you sure?', message: opts }
                : opts;

        return new Promise((res) => {
            resolveRef.current = res;
            setOptions(resolved);
            setOpen(true);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setOpen(false);
        resolveRef.current(true);
    }, []);

    const handleCancel = useCallback(() => {
        setOpen(false);
        resolveRef.current(false);
    }, []);

    const ConfirmModal = (
        <ConfirmDialog
            open={open}
            title={options.title ?? 'Are you sure?'}
            message={options.message ?? 'This action cannot be undone.'}
            confirmLabel={options.confirmLabel ?? 'Delete'}
            variant={options.variant ?? 'danger'}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, ConfirmModal };
}
