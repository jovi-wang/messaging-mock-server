import express from 'express';
import SmscServer from './src/servers/smsc.server.js';
import MmscServer from './src/servers/mmsc.server.js';

const port = process.env.PORT || 8080;
const smscPort = process.env.SMSC_PORT || 3300;
const mmscPort = process.env.MMSC_PORT || 3301;

// start smpp server
SmscServer.listen(smscPort, () => {
  console.log(`Smsc server listening on port ${smscPort}`);
});

// start mmsc server
MmscServer.listen(mmscPort, () => {
  console.log(`Mmsc server listening on port ${mmscPort}`);
});

const app = express();
app.disable('x-powered-by');
app.get('/', (req, res) => {
  res.json('heath check');
});

app.listen(port, () => {
  console.log(`health check app running on port ${port}`);
});
