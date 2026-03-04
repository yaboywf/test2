import styles from './form.module.scss'
import { BoyAccount } from '@/types/accounts'
import { UniformCategory, UniformInspectionFormValues } from '@/types/inspection'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { showMessage } from '@/lib/message'

type FromProps = {
    boys: BoyAccount[]
    components: UniformCategory[]
    submitInspection: (data: UniformInspectionFormValues) => void,
    back: () => void,
    inspectionData: UniformInspectionFormValues | null
}

const Form = ({ boys, components, submitInspection, back, inspectionData }: FromProps) => {
    const [currentForm, setCurrentForm] = useState<string>(boys[0].name);
    const [currentSection, setCurrentSection] = useState<string>(components[0].id);
    const [inspectionDone, setInspectionDone] = useState<boolean>(false);
    const fields = components.find(c => c.id === currentSection)?.components_fields;

    const defaultValues = useMemo(() => {
        if (inspectionData) return inspectionData;
        return boys.reduce((acc, boy) => {
            acc[boy.name] = {
                fields: components.reduce((f, comp) => {
                    f[comp.id] = [];
                    return f;
                }, {} as Record<string, string[]>),
                remarks: components.reduce((r, comp) => {
                    r[comp.id] = "";
                    return r;
                }, {} as Record<string, string>)
            };
            return acc;
        }, {} as UniformInspectionFormValues);
    }, [boys, components]);

    const { register, watch } = useForm<UniformInspectionFormValues>({ defaultValues, shouldUnregister: false });
    const formValues = watch();

    const getIsSectionComplete = (boyName: string, sectionId: string) => {
        const checkedFields = formValues?.[boyName]?.fields?.[sectionId] || [];
        return checkedFields.length > 0;
    };

    const getIsBoyComplete = (boyName: string) => {
        return components.every(comp => getIsSectionComplete(boyName, comp.id));
    };

    useEffect(() => {
        const allBoysDone = boys.every(boy => getIsBoyComplete(boy.name));
        if (allBoysDone) {
            setInspectionDone(true);
            showMessage("All boys have been inspected. Click 'next' to continue", "success")
        };
    }, [formValues]);

    return (
        <div className={styles.form}>
            <div className={styles.boys}>
                <h3>Boys to Inspect</h3>
                {boys.map(boy => {
                    const isBoyComplete = getIsBoyComplete(boy.name);
                    return (
                        <Fragment key={boy.name}>
                            <input type="radio" id={boy.name} checked={currentForm === boy.name} onChange={() => setCurrentForm(boy.name)} name="boy" />
                            <label htmlFor={boy.name} className={isBoyComplete ? styles.complete : ""}>{boy.rank} {boy.name}</label>
                        </Fragment>
                    );
                })}
                <button className={styles.back} onClick={back}>
                    <i className="fa-regular fa-arrow-left"></i>
                    Back
                </button>
                {inspectionDone && <button className={styles.next} onClick={() => submitInspection(formValues)}>
                    <i className="fa-regular fa-arrow-right"></i>
                    Submit
                </button>}
            </div>

            <div className={styles.sections}>
                <h3>Inspection Sections</h3>
                {components.map(component => {
                    const isSectionComplete = getIsSectionComplete(currentForm, component.id);
                    return (
                        <Fragment key={component.id}>
                            <input type="radio" id={component.id} checked={currentSection === component.id} onChange={() => setCurrentSection(component.id)} name="section" />
                            <label htmlFor={component.id} className={isSectionComplete ? styles.complete : ""}>{component.component_name}</label>
                        </Fragment>
                    );
                })}
            </div>

            {currentForm != null && (
                <div className={styles.fields}>
                    <h3>Fields</h3>
                    {fields?.map((field) => (
                        <Fragment key={`${currentForm}-${currentSection}-${field.id}`}>
                            <input
                                type="checkbox"
                                id={`${currentForm}-${currentSection}-${field.id}`}
                                value={field.id}
                                {...register(`${currentForm}.fields.${currentSection}`)}
                                className={field.field_description.includes("Missing") || field.field_description.includes("None of the criterias") ? styles.missing : ""}
                            />
                            <label htmlFor={`${currentForm}-${currentSection}-${field.id}`}>{field.field_description}</label>
                        </Fragment>
                    ))}

                    <h3>Remarks</h3>
                    <textarea
                        key={`${currentForm}-${currentSection}`}
                        {...register(`${currentForm}.remarks.${currentSection}`)}
                        placeholder={`Remarks for ${components.find(c => c.id === currentSection)?.component_name}`}
                    />
                </div>
            )}
        </div>
    )
}

export default Form