import client from "./client";

let studentList: Student[] = [];
let classes: string[] = [];

export async function checkForListUpdate(cookies: any) {
    return new Promise<boolean>((fullfil, reject) => {
        const body = "request=listChanged";

        const req = client.request({
            ":method": "POST",
            ":path": "/services/_api/scoreService.php",
            "Cookie": Object.keys(cookies).map(key => key + "=" + cookies[key]).join("; "),
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(body)
        });

        req.setEncoding("utf8").on("error", err => reject(err));

        req.once("response", headers => {
            switch (headers[":status"]) {
                case 205:
                    fullfil(true);
                    break;
                case 304:
                    fullfil(false);
                    break;
                default:
                    console.error("[API] Failed to check for student list update.");
                    reject();
            }
        }).end(body);
    });
}

export async function updateStudentList(cookies: any) {
    return new Promise<void>((fullfil, reject) => {
        const body = "request=studentList";
        let data: string;
        let ok: boolean;

        const req = client.request({
            ":method": "POST",
            ":path": "/services/_api/scoreService.php",
            "Cookie": Object.keys(cookies).map(key => key + "=" + cookies[key]).join("; "),
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(body)
        }).on("error", err => reject(err));

        req.setEncoding("utf8").once("response", headers => ok = headers[":status"] === 200);

        req.on("data", chunk => data += chunk).once("end", () => {
            if (!ok) {
                console.error("[API] Failed to update student list.");
                reject();
                return;
            }

            let students: {
                studentId: string,
                firstName: string,
                lastName: string,
                cls: string,
                gender: "M" | "W"
            }[] = JSON.parse(data);

            studentList = students.map(student => {
                let className = student.cls.toUpperCase();

                if (!classes.includes(className)) {
                    classes.push(className);
                }

                return {
                    id: student.studentId,
                    name: {
                        first: student.firstName,
                        last: student.lastName
                    },
                    class: className,
                    gender: student.gender === "M" ? "male" : "female"
                }
            });

            classes.sort();
            studentList.sort((a, b) => {
                if (a.class < b.class) return -1;
                if (a.class > b.class) return 1;

                const nameA = `${a.name.last} ${a.name.first}`.toUpperCase();
                const nameB = `${b.name.last} ${b.name.first}`.toUpperCase();

                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;

                return 0;
            });

            console.log("[API] Updated student list.");
            fullfil();
        }).end(body);
    });
}

export function getStudents() { return studentList };
export function getClasses() { return classes };