import client from "./client";

export async function authenticate(cookies: any) {
    return new Promise<{
        authenticated: boolean;
        teacher?: boolean;
        id?: string;
    }>((fullfil, reject) => {
        const body = "request=session";
        let data: string;
        let status: number | undefined;

        const req = client.request({
            ":method": "POST",
            ":path": "/services/_api/scoreService.php",
            "Cookie": Object.keys(cookies).map(key => key + "=" + cookies[key]).join("; "),
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(body)
        }).on("error", err => reject(err));

        req.setEncoding("utf8").once("response", headers => status = headers[":status"]);

        req.on("data", chunk => data += chunk).once("end", () => {
            switch (status) {
                case 200:
                    fullfil({
                        authenticated: true,
                        teacher: /^[A-Z][a-z]{2}[A-Z]$/.test(data),
                        id: data
                    });
                    break;

                case 401:
                    fullfil({ authenticated: false });
                    break;

                default:
                    console.error("[API] Failed to authenticate.");
                    reject();
            }
        }).end(body);
    });
}