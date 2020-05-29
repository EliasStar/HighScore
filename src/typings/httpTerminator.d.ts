declare module "http-terminator" {
    import { Server } from "net";

    interface HttpTerminatorOptions {
        server: Server;
        gracefulTerminationTimeout?: number;
    }

    export interface HttpTerminator {
        terminate(): Promise<void>;
    }

    export function createHttpTerminator(options: HttpTerminatorOptions): HttpTerminator;
}
