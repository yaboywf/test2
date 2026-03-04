export type UniformCategoryField = {
    id: string;
    field_description: string;
    field_score: number;
};

export type UniformCategory = {
    id: string;
    component_name: string;
    order: number;
    total_score: number;
    components_fields: UniformCategoryField[];
};

export type UniformInspectionFormValues = {
    [email: string]: {
        fields: {
            [sectionId: string]: string[]
        };
        remarks: {
            [sectionId: string]: string
        }
    }
}