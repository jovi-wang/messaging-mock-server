import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { successSubmitRsp } from '../helpers/mms.response.helper.js';
import {
  notFoundErrorHandler,
  verifyRequestMethod,
} from '../middleware/error.handler.middleware.js';
import {
  verifyMmsHeaderParams,
  verifyMmsEnvelope,
} from '../middleware/mm7.validator.middleware.js';

const mmscServer = express();
mmscServer.disable('x-powered-by');
mmscServer.use(express.text({ type: '*/*' }));

// convert xml payload into plain text, use req.rawBody to access xml
mmscServer.use((req, _, next) => {
  req.rawBody = '';
  req.setEncoding('utf8');

  req.on('data', (chunk) => {
    req.rawBody += chunk;
  });

  req.on('end', () => {
    next();
  });
});

// health check
mmscServer.get('/', (_, res) => {
  res.json('health check');
});

// POST REQUEST
mmscServer.post(
  '/',
  verifyMmsHeaderParams,
  verifyMmsEnvelope,
  async (_, res) => {
    res.set('Content-Type', 'text/xml; charset="utf-8"');
    const messageId = uuidv4();
    res.send(successSubmitRsp(messageId));
  }
);

mmscServer.use(verifyRequestMethod);
mmscServer.use(notFoundErrorHandler);

export default mmscServer;
