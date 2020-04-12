import http2 from 'http2';

const client = http2.connect('https://www.dachsberg.at:443', () => console.log('[Database] Connected to Dachsberg.'));
let studentList: [{}];

client.on('error', err => console.error('[Database] Error from client: ' + err));

export function updateStudentList() {
    const body = 'request=studentList';
    let data: string;
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
                    studentList = JSON.parse(data);
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