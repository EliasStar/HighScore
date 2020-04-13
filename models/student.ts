let classes: string[];

interface StudentListEntry {
    studentId: string,
    firstName: string,
    lastName: string,
    cls: string,
    gender: 'M' | 'W'
}

export function updateStudentList() {
    const body = 'request=studentList';
    let data = '';
    let status: number | undefined;

    client.request({
        ':method': 'POST',
        ':path': '/services/_api/scoreService.php',
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': Buffer.byteLength(body)
    }).setEncoding('utf8').on('response', headers => status = headers[":status"]).on('data', chunk => data += chunk).on('end', () => {
        if (typeof status === 'number') {
            switch (status) {
                case 200:
                    let students: [] = JSON.parse(data);
                    studentList = students.map(student => {
                        let cls = student.cls.toUpperCase();
                        if (classes.indexOf(cls) === -1) {
                            classes.push(cls);
                        }
                        return {
                            id: student.studentId,
                            name: {
                                first: student.firstName,
                                last: student.lastName
                            },
                            class: cls,
                            gender: student.gender === 'M' ? 'male' : 'female'
                        }
                    });
                    //Sort
                    console.log('[Database] Updated student list.');
                    break;

                case 304:
                    console.log('[Database] Student list did not change.');
                    break;

                default:
                    console.error('[Database] Unexpected status while updating student list: ' + status);
            }
        } else {
            console.error('[Database] Could not get status while updating student list.');
        }
    }).on('error', err => console.error('[Database] Error while updating student list: ' + err)).end(body);
}

export function closeClient() {
    client.close();
}

export default class Student {
    studentList: Student[];
    readonly _id: number;
    readonly id: number;
    readonly name: string;
    readonly class: string;
    readonly gender: 'male' | 'female';

    private constructor(student: StudentListEntry) {
        this.id = this._id = parseInt(student.studentId, 10);
        this.name = `${student.lastName} ${student.firstName}`;
        this.class = student.cls.toUpperCase();
        this.gender = student.gender === 'M' ? 'male' : 'female'
    }

    static find(filter: Object): Student[] {


        let result: Student[] = [];
        studentList.forEach(student => {
            if ((className === 'all' || student.class === className) && (gender === 'both' || student.gender === gender)) {
                result.push(student);
            }
        });
        return result;
    }

    static findById(id: number): Student | undefined {
        studentList.forEach(student => {
            if (student.id === id) {
                return student;
            }
        });

        return undefined;
    }

    static nameForId(id: number): string {
        studentList.forEach(student => {
            if (student.id === id) {
                return student.name;
            }
        });

        return '';
    }

    static getClasses(): string[] {
        return classes;
    }
}