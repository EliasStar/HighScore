import http2 from 'http2';

const client = http2.connect('https://www.dachsberg.at:443', () => console.log('[Database] Connected to Dachsberg.'));
let studentList: {};

client.on('error', err => console.error('[Database] Error from client: ' + err));

export function updateStudentList() {
    const body = 'request=studentList';
    let data: string;

    console.log('[Database] Requesting student list.');

    client.request({
        ':method': 'POST',
        ':path': '/services/_api/scoreService.php',
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': Buffer.byteLength(body)
    }).setEncoding('utf8').on('response', (headers, flags) => {
        console.log(headers);
        console.log(flags);
        console.log('[Database] Received response.');
    }).on('data', (chunk: string) => {
        data += chunk;
    }).on('end', () => {
        console.log(data);
        //studentList = JSON.parse(data);
        console.log('[Database] Updated student list.');
    }).on('error', err => console.error('[Database] Error while updating student list: ' + err)).end(body);
}

export function closeClient() {
    client.close();
}