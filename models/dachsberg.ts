import http2 from 'http2';

const client = http2.connect('https://www.dachsberg.at:443', () => console.log('[Database] Connected to Dachsberg.'));

client.on('error', err => console.error('[Database] Error from client: ' + err));