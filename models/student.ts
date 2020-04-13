import http2 from 'http2';

const client = http2.connect('https://www.dachsberg.at:443', () => console.log('[Database] Connected to Dachsberg.'));
let studentList: Student[];
let classes: { [id: string]: ClassName };

type ClassName = string;

export interface Student {
    id: string,
    name: {
        first: string
        last: string
    },
    class: ClassName,
    gender: 'male' | 'female'
}

client.on('error', err => console.error('[Database] Error from client: ' + err));

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
                    let students: {
                        studentId: string,
                        firstName: string,
                        lastName: string,
                        cls: string,
                        gender: 'M' | 'W'
                    }[] = JSON.parse(data);
                    studentList = students.map(student => {
                        return {
                            id: student.studentId,
                            name: {
                                first: student.firstName,
                                last: student.lastName
                            },
                            class: student.cls,
                            gender: student.gender === 'M' ? 'male' : 'female'
                        }
                    });
                    //Sort
                    //Fill classnames
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

export function nameForID(id: string): string {
    studentList.forEach(student => {
        if (student.id === id) {
            return `${student.name.first} ${student.name.last}`;
        }
    });
    return '';
}

export function findAll(gender: 'male' | 'female' | 'both', className: 'all' | ClassName): Student[] {
    let result: Student[] = [];
    studentList.forEach(student => {
        if ((className === 'all' || student.class === className) && (gender === 'both' || student.gender === gender)) {
            result.push(student);
        }
    });
    return result;
}

export function toClass(className: string): ClassName | undefined {
    return classes[className.toUpperCase()] ? classes[className.toUpperCase()] : undefined;
}

export function getClasses(): ClassName[] {
    return [];
}

export function closeClient() {
    client.close();
}