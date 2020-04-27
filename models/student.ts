import http2 from 'http2';

const client = http2.connect('https://www.dachsberg.at:443', () => console.log('[Database] Connected to Dachsberg.'));
let studentList: Student[] = [];
let classes: string[] = [];

export interface Student {
    id: number,
    name: {
        first: string
        last: string
    },
    class: string,
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
        let students: {
            studentId: string,
            firstName: string,
            lastName: string,
            cls: string,
            gender: 'M' | 'W'
        }[] = JSON.parse(data);

        studentList = students.map(student => {
            let className = student.cls.toUpperCase();

            if (!classes.includes(className)) {
                classes.push(className);
            }

            return {
                id: parseInt(student.studentId, 10),
                name: {
                    first: student.firstName,
                    last: student.lastName
                },
                class: className,
                gender: student.gender === 'M' ? 'male' : 'female'
            }
        });

        classes.sort();
        console.log('[Database] Updated student list: ' + status);
    }).on('error', err => console.error('[Database] Error while updating student list: ' + err)).end(body);
}

export function nameForID(id: number): string {
    studentList.forEach(student => {
        if (student.id === id) {
            return `${student.name.last} ${student.name.first}`;
        }
    });
    return '';
}

export function find(gender: 'male' | 'female' | 'both', className: 'ALL' | string): Student[] {
    let result: Student[] = [];
    studentList.forEach(student => {
        if ((className === 'ALL' || student.class === className) && (gender === 'both' || student.gender === gender)) {
            result.push(student);
        }
    });
    return result;
}

export function findById(id: number): Student | undefined {
    studentList.forEach(student => {
        if (student.id === id) {
            return student;
        }
    });
    return undefined;
}


export function getClasses(): string[] {
    return classes;
}

export function closeClient() {
    client.close();
}