export interface Schema {
    flat?: boolean;
    inlineStyle?: boolean;
    inlineTemplate?: boolean;
    module?: string;
    name: string;
    path?: string;
    prefix?: string;
    project?: string;
    selector?: string;
    skipImport?: boolean;
    skipSelector?: boolean;
    skipTests?: boolean;
    type?: string;
}

