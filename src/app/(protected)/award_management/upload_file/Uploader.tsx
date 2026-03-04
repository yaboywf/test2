"use client"

import { useRef, useState } from "react";
import { showMessage } from "@/lib/message";
import styles from "./uploadFile.module.scss";

type UploaderProps = {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    onUpload: () => void;
};

const fileKey = (f: File) => `${f.name}__${f.size}__${f.lastModified}`;

export default function Uploader({ files, setFiles, onUpload }: UploaderProps) {
    const [dragging, setDragging] = useState(false);
    const dragDepth = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const MAX_BYTES = 200 * 1024;

    const addFiles = (fileList: FileList | null) => {
        const incoming = Array.from(fileList || []);
        if (incoming.length === 0) return;

        const messages: string[] = [];

        setFiles((prev) => {
            const existing = new Set(prev.map(fileKey));
            const next = [...prev];

            for (const file of incoming) {
                const dot = file.name.lastIndexOf(".");
                const ext = dot >= 0 ? file.name.toLowerCase().slice(dot) : "";

                if (![".xls", ".xlsx"].includes(ext)) {
                    messages.push(`${file.name} is invalid.`);
                    continue;
                }

                if (file.size > MAX_BYTES) {
                    messages.push(`${file.name} too large.`);
                    continue;
                }

                const key = fileKey(file);
                if (existing.has(key)) {
                    messages.push(`${file.name} already added.`);
                    continue;
                }

                existing.add(key);
                next.push(file);
            }

            return next;
        });

        for (const msg of messages) showMessage(msg);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(e.target.files);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);

        addFiles(e.dataTransfer.files);

        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className={`${styles.upload_file} ${files.length > 0 ? styles.has_file : ""}`}>
            <h2>Upload Awards Tracker from Member's Portal</h2>
            <div className={styles.instruction}>
                <p>How This Works</p>
                <ul>
                    <li>Any additional attainments found in this file will be added automatically.</li>
                    <li>Any attainments currently in the system but missing from this file will be flagged for manual review.</li>
                </ul>
            </div>
            <div className={styles.warning}>The uploaded file must be downloaded directly from the Member's Portal and must not be modified in any way.</div>

            <input
                ref={inputRef}
                type="file"
                accept=".xls"
                multiple
                onChange={handleUpload}
                id="upload"
            />

            <div
                className={`${styles.uploader} ${dragging ? styles.dragging : ""}`}
                onDragEnter={(e) => {
                    e.preventDefault();
                    dragDepth.current += 1;
                    setDragging(true);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => {
                    e.preventDefault();
                    dragDepth.current -= 1;
                    if (dragDepth.current <= 0) {
                        dragDepth.current = 0;
                        setDragging(false);
                    }
                }}
                onDrop={handleDrop}
            >
                <i className="fa-regular fa-file-arrow-up"></i>
                <div>
                    <label htmlFor="upload">Click to Upload</label> or drag and drop
                </div>
                <span>Max 200KB / File (.xls)</span>
            </div>

            <div className={styles.files}>
                {files.map((file) => (
                    <div className={styles.file} key={fileKey(file)}>
                        <i className="fa-regular fa-file"></i>
                        <p>{file.name.replace(/\.[^/.]+$/, "").toUpperCase()}</p>
                        <span>{(file.size / 1024).toFixed(2)} KB | {file.name.split(".").pop()?.toUpperCase()}</span>
                        <i className="fa-regular fa-trash" onClick={() => setFiles((prev) => prev.filter((f) => fileKey(f) !== fileKey(file)))}></i>
                    </div>
                ))}
            </div>

            {files.length > 0 && <button className={styles.button} onClick={onUpload}>Upload</button>}
        </div>
    );
}