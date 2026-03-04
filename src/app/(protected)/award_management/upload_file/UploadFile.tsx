'use client';

import { useState } from "react";
import { showMessage } from "@/lib/message";
import styles from "./uploadFile.module.scss"
import * as XLSX from "xlsx";
import { BoyAccount } from "@/types/accounts";
import Uploader from "./Uploader";
import Summary from "./Summary";
import { StepConnector, StepIndicator } from "@/components/Step";
import stepStyles from '@/components/step.module.scss'

type UploadFileProps = {
    attained: string[];
    boys: BoyAccount[];
}

const ttd: Record<string, string> = {
    'Stage 1': "Bronze",
    'Stage 2': "Silver",
    'Stage 3': "Gold"
};

const mastery: Record<string, string> = {
    'Stage 1': 'Basic',
    'Stage 2': "Advanced",
    'Stage 3': "Master"
};

const UploadFile = ({ attained, boys }: UploadFileProps) => {
    const [files, setFiles] = useState<File[]>([]);

    const [data, setData] = useState<Record<string, Record<string, Record<string, boolean>>>>({});
    const [conflicts, setConflicts] = useState<string[]>([]);
    const [toAdd, setToAdd] = useState<string[]>([]);

    const [currentStep, setCurrentStep] = useState(1);

    const onUpload = async () => {
        const totalData: Record<string, Record<string, Record<string, boolean>>> = {};

        for (const file of files) {
            try {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: "array" });

                for (const sheetName of workbook.SheetNames) {
                    if (["Sheet7", "Sheet8", "Sheet9"].includes(sheetName)) continue;

                    const sheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(sheet, {
                        header: 1,
                        defval: "",
                        raw: false,
                        blankrows: false
                    });

                    console.log(rows);

                    const sliced = rows.slice(1);
                    const result = transformData(sliced as string[][]);

                    for (const [name, badges] of Object.entries(result)) {
                        totalData[name] = totalData[name] || {};
                        Object.assign(totalData[name], badges);
                    }
                }
            } catch (err) {
                console.error(err);
                showMessage(`Failed to parse ${file.name}`);
            }

            setData(totalData);
            setCurrentStep(2);
        }
    }

    function transformData(json: string[][]) {
        const badgeRow = [...json[0]];
        const headerRow = json[1];
        const result: Record<string, Record<string, Record<string, boolean>>> = {};

        // Step 1. Normalize badge row
        // so: ['', '', 'Adventure', '', 'Arts & Crafts', '', 'Athletics', ...]
        // becomes: ['', '', 'Adventure', 'Adventure', 'Arts & Crafts', 'Arts & Crafts', 'Athletics', 'Athletics', ...]
        for (let col = 1; col < badgeRow.length; col++) {
            if (!badgeRow[col]) {
                badgeRow[col] = badgeRow[col - 1];
            }
        }

        // Step 2. Build column metadata
        // so: ['', '', 'Adventure', 'Adventure', 'Arts & Crafts', 'Arts & Crafts', 'Athletics', 'Athletics', ...]
        // becomes: { 'Adventure': new Set(['Basic', 'Advanced', 'Master']), 'Arts & Crafts': new Set(['Basic', 'Advanced', 'Master']), 'Athletics': new Set(['Basic', 'Advanced', 'Master']) }
        const badgeStageCount: Record<string, Set<string>> = {};
        for (let col = 2; col < badgeRow.length; col++) {
            const badge = badgeRow[col];
            let stage = headerRow[col];
            if (!badge || !stage) continue;

            if (badge === "Total Defence") stage = ttd[stage]
            else stage = mastery[stage];

            badgeStageCount[badge] = badgeStageCount[badge] || new Set<string>();
            badgeStageCount[badge].add(stage);
        }

        // Step 3. Build result for each boy
        for (let i = 2; i < json.length; i++) {
            const row = json[i];
            if (!row || !row[1]) continue;

            const name = row[1];
            result[name] = {};

            for (let col = 2; col < row.length; col++) {
                const badge = badgeRow[col];
                let stage = headerRow[col];
                if (!badge || !stage) continue;

                if (badge === "Total Defence") stage = ttd[stage]
                else stage = mastery[stage];

                const val = row[col];
                if (!result[name][badge]) result[name][badge] = {};
                result[name][badge][stage] = val === "Attained";
            }
        }

        return result;
    }

    const checkMergeIssues = async () => {
        // Rule 1: If portal has Basic, but HQ has Basic + Advanced → add Advanced (don’t remove Basic).
        // Rule 2: If portal has Basic + Advanced, but HQ only has Basic (or nothing) → flag as conflict.

        let normalisedUploadedData = [];
        let normalisedLocalData = [];

        for (const [boy, badgeMap] of Object.entries(data)) {
            const boyId = boys.find(b => b.name === boy)?.email || null;
            if (!boyId) continue;

            const existingBoyAttainments = attained.filter(a => a.startsWith(`${boyId}-`));
            normalisedLocalData.push(...existingBoyAttainments);
            console.log(existingBoyAttainments);

            for (const [badgeName, masteryMap] of Object.entries(badgeMap)) {
                for (const [stage, attainedValue] of Object.entries(masteryMap)) {
                    if (!attainedValue) continue;
                    normalisedUploadedData.push(`${boyId}-${badgeName}-${stage}`);
                }
            }
        }

        const hqSet = new Set(normalisedUploadedData);
        const sysSet = new Set(normalisedLocalData);

        const toAdd = [];
        const conflicts = [];

        // Rule 1: HQ has more (Portal has missing items that HQ has)
        for (const item of hqSet) {
            if (!sysSet.has(item)) {
                toAdd.push(item);
            }
        }

        // Rule 2: If portal has more (HQ has missing items that portal has)
        for (const item of sysSet) {
            if (!hqSet.has(item)) {
                conflicts.push(item);
            }
        }

        setConflicts(conflicts);
        setToAdd(toAdd);
        console.log(conflicts, toAdd);

        if (conflicts.length === 0) setCurrentStep(4)
        else setCurrentStep(3);
    }

    function displayBadge(str: string) {
        const parts = str.split("-");
        const badgeName = parts[1];              // always exists
        const mastery = parts[2] || "";          // may not exist
        return mastery ? `${badgeName} ${mastery}` : badgeName;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();

            // const form = new FormData(e.target as HTMLFormElement);
            // const data = Object.fromEntries(form.entries());
            // if (Object.keys(data).length !== conflicts.length) return showMessage("Please resolve all conflicts before submitting");

            // if (conflicts.length > 0) {
            //     for (const [conflict, choice] of Object.entries(data)) {
            //         if (choice === "delete") await deleteDoc(doc(db, "attainments", conflict));
            //     }
            // }

            // if (toAdd.length > 0) {
            //     const batch = writeBatch(db);
            //     for (const id of toAdd) {
            //         const ref = doc(db, "attainments", id);
            //         batch.set(ref, {});
            //     }

            //     await batch.commit();
            // }

            // showMessage("Awards Tracker uploaded", "success");
            // window.location.reload();
        } catch (e) {
            console.error(e)
            showMessage("Failed to upload Awards Tracker")
        }
    }

    return (
        <div className={styles["upload-file"]}>
            <div className={stepStyles.step_indicators}>
                <StepIndicator step={1} currentStep={currentStep} />
                <StepConnector isComplete={currentStep > 1} />
                <StepIndicator step={2} currentStep={currentStep} />
                <StepConnector isComplete={currentStep > 2} />
                <StepIndicator step={3} currentStep={currentStep} />
                <StepConnector isComplete={currentStep > 3} />
                <StepIndicator step={4} currentStep={currentStep} />
            </div>

            {Object.keys(data).length === 0 && <Uploader files={files} setFiles={setFiles} onUpload={onUpload} />}

            {
                conflicts.length > 0 && <div className={styles.conflicts}>
                    <h3>{conflicts.length} Conflicts Found</h3>
                    <p>No changes will be made to the system if all conflicts are not resolved</p>

                    <form id='conflict-form' onSubmit={handleSubmit} noValidate>
                        {conflicts.map(conflict => {
                            const boyName = boys.find(b => b.email === conflict.split("-")[0])?.name;

                            return (
                                <div key={conflict}>
                                    <p>In this Portal, {boyName} is recorded as having attained {displayBadge(conflict)}, but no such record could be found in uploaded HQ Awards Tracker</p>

                                    <div>
                                        <input type="radio" name={conflict} id={`keep-${conflict}`} required defaultValue="keep" />
                                        <label htmlFor={`keep-${conflict}`}>Keep {displayBadge(conflict)}</label>
                                        <input type="radio" name={conflict} id={`delete-${conflict}`} required defaultValue="delete" />
                                        <label htmlFor={`delete-${conflict}`}>Delete {displayBadge(conflict)}</label>
                                    </div>
                                </div>
                            )
                        })}

                        {conflicts.length === 0 && <p>No conflicts found</p>}
                    </form>

                    <button form='conflict-form'>Resolve Conflicts</button>
                </div>
            }

            {Object.keys(data).length > 0 && <Summary data={data} setData={setData} checkMergeIssues={checkMergeIssues} setCurrentStep={setCurrentStep} />}
        </div >
    );
}

export default UploadFile