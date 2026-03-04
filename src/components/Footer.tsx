"use client";

import styles from "./footer.module.scss";
import { ServerSession } from "@/types/accounts";
import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
    interface Window {
        google: unknown;
        googleTranslateElementInit: () => void;
    }
}

const Footer = ({ user }: { user: ServerSession | null }) => {
    const [accepted, setAccepted] = useState<boolean>(false);

    useEffect(() => {
        const stored = localStorage.getItem("cookie_banner_value");
        if (stored === "true") setAccepted(true);
        else setAccepted(false);
    }, []);

    return (
        <footer className={styles.footer}>
            <div className={styles.top}>
                <div className={styles.about}>
                    <div className={styles.logo} translate="no">
                        <img src="/bb-crest.png" alt="BB Logo" width={60} height={60} />
                        <div>
                            <p>The boys' brigade</p>
                            <span>21st Singapore Company</span>
                        </div>
                    </div>

                    <p>
                        BB 21st Portal streamlines repetitive tasks like parade notices,
                        attendance, awards tracking, uniform inspections, and 32A result
                        generation.
                    </p>

                    <a
                        href="https://www.instagram.com/bb21coy/"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                    >
                        <i className="fa-brands fa-instagram" />
                    </a>
                </div>

                <div className={styles.links}>
                    <p>Quick Links</p>
                    <Link href={user?.type ? "/home" : "/login"}>{user?.type ? "Dashboard" : "Login"}</Link>
                    <Link href="/parade_notice">Parade Notice</Link>
                    <Link href="/calendar">Calendar</Link>
                </div>

                <div className={styles.links}>
                    <p>Affiliated With</p>
                    <Link href="https://www.geylangmethodistsec.moe.edu.sg" target="_blank">Geylang Methodist School (Secondary)</Link>
                    <Link href="https://www.cmch.sg" target="_blank">Christalite Methodist Chapel</Link>
                </div>

                <div className={styles.links}>
                    <p>Associated Websites</p>
                    <Link href="https://www.bb.org.sg" target="_blank">BB Singapore</Link>
                    <Link href="https://members.bb.org.sg" target="_blank">BB Members Portal</Link>
                </div>
            </div>

            <hr />

            <div className={styles.middle}>
                <div>
                    <p data-icon style={{ "--icon": "'\\f3c5'" } as React.CSSProperties}>Location</p>
                    <Link href="https://maps.app.goo.gl/gNWas7A5sUHMQJsm9" target="_blank">2 Geylang East Central, Singapore 389705</Link>
                </div>

                <div>
                    <p data-icon style={{ "--icon": "'\\f121'" } as React.CSSProperties}>Inspired and Developed by</p>
                    <p>
                        <Link href="https://github.com/BryanL2303" target="_blank" translate="no">Bryan Lee,</Link>{" "}
                        <Link href="https://github.com/yaboywf" target="_blank" translate="no">Dylan Yeo,</Link>{" "}
                        <Link href="https://github.com/yorhagengyue" target="_blank" translate="no">Geng Yue</Link>
                    </p>
                </div>

                {accepted && <div>
                    <div id="google_translate_element" />
                    <span>Translation accuracy is not guaranteed.</span>
                </div>}
            </div>

            <hr />

            <div className={styles.bottom}>
                <div>
                    <p>&copy; {new Date().getFullYear()} The Boys' Brigade 21<sup>st</sup> Singapore Company. All rights reserved.</p>
                    <span>Version {process.env.NEXT_PUBLIC_GIT_HASH}</span>
                </div>
                <div>
                    <p>
                        This hope we have as an anchor of the soul, a hope both{" "}
                        <strong>sure and stedfast</strong> and one which enters within the
                        veil where Jesus has entered as a forerunner for us...
                        <br />
                        Hebrews 6:19–20a
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
