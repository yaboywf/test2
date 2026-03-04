import { useState, useMemo, useRef, useEffect } from "react";
import { Controller, Control, FieldValues, Path, } from "react-hook-form";
import styles from "./select.module.scss";

type SelectProps<T extends FieldValues> = {
    name: Path<T>;
    control: Control<T>;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
};

type SelectOption = {
    value: string;
    label: string;
};

const Select = <T extends FieldValues>({
    name,
    control,
    options,
    placeholder = "Select an option",
    error
}: SelectProps<T>) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const triggerRef = useRef<HTMLParagraphElement | null>(null);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const [disableTransition, setDisableTransition] = useState(false);

    const filteredOptions = useMemo(
        () => options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())),
        [options, search]
    );

    const updatePos = () => {
        if (!triggerRef.current) return;

        setDisableTransition(true);

        const r = triggerRef.current.getBoundingClientRect();
        setPos({
            top: r.bottom,
            left: r.left,
            width: r.width
        });

        requestAnimationFrame(() => {
            setDisableTransition(false);
        });
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!open) return;

        updatePos();

        const onScroll = () => updatePos();
        const onResize = () => updatePos();

        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onResize);
        };
    }, [open]);

    return (
        <Controller
            name={name}
            control={control}
            rules={{ required: error }}
            render={({ field }) => {
                const selected = options.find(o => o.value === field.value);

                return (
                    <>
                        <div className={styles.select_container}>
                            <p
                                ref={triggerRef}
                                className={styles.selected}
                                data-open={open}
                                onClick={() => setOpen(o => !o)}
                            >
                                {selected?.label || placeholder}
                            </p>
                        </div>

                        <div
                            className={`${styles.select} ${open ? styles.open : styles.closed} ${disableTransition ? styles.noTransition : ""}`}
                            style={{
                                position: "fixed",
                                top: pos.top + 10,
                                left: pos.left,
                                width: pos.width
                            }}
                        >
                            <div className={styles.search}>
                                <i className="fa-regular fa-search"></i>
                                <input
                                    type="search"
                                    autoComplete="off"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search"
                                />
                                <i className="fa-regular fa-xmark" onClick={() => setSearch("")}></i>
                            </div>

                            {filteredOptions.map(opt => (
                                <p
                                    key={opt.value}
                                    data-selected={opt.value === field.value}
                                    onClick={() => {
                                        field.onChange(opt.value);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    {opt.label}
                                </p>
                            ))}
                        </div>
                    </>
                )
            }}
        />
    );
};

export default Select;