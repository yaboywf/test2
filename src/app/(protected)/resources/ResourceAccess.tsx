'use client'

import { useState, useEffect } from 'react';
import styles from './resourceAccess.module.scss'
import { showMessage } from '@/lib/message';
import { api } from '@/lib/api';

type ResourceAccessProps = {
    boys: { email: string, name: string, sec: number }[],
    resource: string;
}

type ResourceAccessResponse = {
    whitelist: string[]
}

function ResourceAccess({ boys, resource }: ResourceAccessProps) {
    const [whitelist, setWhitelist] = useState<string[]>([]);

    const onSave = async (): Promise<void> => {
        try {
            if (whitelist.length === 0) return;
            await api('post', '/api/resources', { resource, emails: whitelist })
            showMessage(`Successfully saved access and control for ${resource.toUpperCase()}`, 'success')
        } catch (err) {
            console.error(err)
            showMessage(`Error saving access and control for ${resource.toUpperCase()}`)
        }
    }

    useEffect(() => {
        api<ResourceAccessResponse>('get', `/api/resources?resource=${resource}`)
            .then(data => setWhitelist(data.whitelist))
            .catch(err => {
                console.error(err)
                showMessage(`Error getting access and control for ${resource.toUpperCase()}`)
            })
    }, [resource])

    return (
        <>
            <div className={styles.header}>
                <h2>Control and Access - {resource.toUpperCase()}</h2>
                <button onClick={onSave}>
                    <i className='fa-regular fa-save'></i>
                    Save
                </button>
            </div>

            <div className={styles.table}>
                <div>
                    <p>Boy</p>
                    <p>Sec</p>
                    <p>Access</p>
                </div>
                {boys.map(boy => (
                    <div key={boy.email}>
                        <section className={styles.boy_details}>
                            <i className='fa-regular fa-user'></i>
                            <p>{boy.name}</p>
                            <p>{boy.email}</p>
                        </section>
                        <section className={styles.sec_badge}>
                            <span data-sec={boy.sec}>Sec {boy.sec}</span>
                        </section>
                        <section className={styles.switch_container}>
                            <section className={styles.switch} data-selected={whitelist.includes(boy.email)} onClick={() => setWhitelist(prev => prev.includes(boy.email) ? prev.filter(email => email !== boy.email) : [...prev, boy.email])}>
                                <span>Block</span>
                                <span>Allow</span>
                            </section>
                        </section>
                    </div>
                ))}
            </div>
        </>
    )
}

export default ResourceAccess