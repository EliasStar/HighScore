import http2 from "http2";

const client = http2.connect("https://www.dachsberg.at:443", () => console.log("[Database] Connected to Dachsberg."));
let studentList: Student[] = [];
let classes: string[] = [];

export interface Student {
    id: string;
    name: {
        first: string;
        last: string;
    };
    class: string;
    gender: "male" | "female";
}

client.on("error", err => console.error("[Database] Error from client: " + err));

export function updateStudentList() {
    const body = "request=studentList";
    let data = "";
    let status: number | undefined;

    client.request({
        ":method": "POST",
        ":path": "/services/_api/scoreService.php",
        "content-type": "application/x-www-form-urlencoded",
        "content-length": Buffer.byteLength(body)
    }).setEncoding("utf8").on("response", headers => status = headers[":status"]).on("data", chunk => data += chunk).on("end", () => {
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

        console.log("[Database] Updated student list: " + status);
    }).on("error", err => console.error("[Database] Error while updating student list: " + err)).end(body);
}

export function nameForID(id: string): string {
    for (const student of studentList) {
        if (student.id === id) {
            return `${student.name.last} ${student.name.first}`;
        }
    }

    return "";
}

export function find(gender: "male" | "female" | "both", className: "ALL" | string): Student[] {
    let result: Student[] = [];
    studentList.forEach(student => {
        if ((className === "ALL" || student.class === className) && (gender === "both" || student.gender === gender)) {
            result.push(student);
        }
    });
    return result;
}

export function findById(id: string): Student | undefined {
    for (const student of studentList) {
        if (student.id === id) {
            return student;
        }
    }
    return undefined;
}


export function getClasses(): string[] {
    return classes;
}

export function closeClient() {
    client.close();
}

export function genderFromString(gender?: string): "male" | "female" | "both" {
    if (!gender) return "both";

    switch (gender.toUpperCase()) {
        case "MALE":
        case "M": return "male";
        case "FEMALE":
        case "F": return "female";
        default: return "both"
    }
}

export function classFromString(className?: string): "ALL" | string {
    if (className) {
        for (const cls of classes) {
            if (className.toUpperCase() === cls) return cls;
        }
    }

    return "ALL";
}
