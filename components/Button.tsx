import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    iconPosition?: 'left' | 'right';
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    className = '',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
            {...props}
        >
            {icon && iconPosition === 'left' && <span className={styles.btnIcon}>{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className={styles.btnIcon}>{icon}</span>}
        </button>
    );
}
