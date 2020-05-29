declare namespace Express {
    export interface Request {
        auth: {
            authenticated?: boolean;
            teacher?: boolean;
            id?: number | string;
        };

        filter: {
            gender: "male" | "female" | "both";
            class: "ALL" | string;
        };
    }
}
