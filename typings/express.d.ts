declare namespace Express {
    export interface Request {
        authenticated?: boolean,
        teacher?: boolean
    }
}
