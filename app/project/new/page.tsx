'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProjectForm from '@/components/ProjectForm';
import { createProjectAction } from '@/app/actions';
import styles from './page.module.css';

export default function NewProjectPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: { name: string; description?: string }) => {
        setIsSubmitting(true);

        const response = await createProjectAction(data);

        if (response.success) {
            toast.success(response.message || 'Project created successfully');
            router.push(`/project/${response.data.id}`);
        } else {
            toast.error(response.error || 'Failed to create project');
            setIsSubmitting(false);
            throw new Error(response.error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={20} />
                    Back to Projects
                </Link>
            </div>

            <main className={styles.main}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title}>Create New Project</h1>
                    <p className={styles.description}>
                        Start organizing your tasks by creating a new project
                    </p>

                    <div className={styles.formCard}>
                        <ProjectForm
                            onSubmit={handleSubmit}
                            onCancel={() => router.push('/')}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
