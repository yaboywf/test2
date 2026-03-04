'use client'

import { useEffect, useState } from 'react';
import styles from './cookieBanner.module.scss';

const CookieBanner = () => {
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        const stored = localStorage.getItem("cookie_banner_shown");
        if (stored === "true") setOpen(false);
        else setOpen(true);
    }, []);

    const handleClick = (value: boolean): void => {
        localStorage.setItem("cookie_banner_shown", "true");
        localStorage.setItem("cookie_banner_value", value.toString());
        setOpen(false);
    };

    return (
        <div className={styles.container} data-open={open}>
            <i className='fa-regular fa-cookie-bite'></i>
            <h2>Your <span>Data</span>, Your <span>Choice</span></h2>
            <p>We use essential cookies, including Google authentication, to enable secure login and ensure the site functions properly. Optional services such as language translation are only loaded with your consent.</p>
            <div className={styles.buttons}>
                <button onClick={() => handleClick(true)}>Accept</button>
                <button onClick={() => handleClick(false)}>Decline</button>
            </div>
        </div>
    );
};

export default CookieBanner;