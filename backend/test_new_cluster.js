const net = require('net');

const host = 'cluster0-shard-00-00.xkzunmb.mongodb.net';
const port = 27017;

console.log(`Testing connection to NEW cluster: ${host}:${port}...`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on('connect', () => {
    console.log('✅ SUCCESS: Port 27017 is OPEN! Network allows MongoDB connections.');
    socket.destroy();
    process.exit(0);
});

socket.on('timeout', () => {
    console.log('❌ FAILURE: Connection timed out. Port 27017 is BLOCKED.');
    socket.destroy();
    process.exit(1);
});

socket.on('error', (err) => {
    console.log(`❌ FAILURE: ${err.message}`);
    process.exit(1);
});

socket.connect(port, host);
