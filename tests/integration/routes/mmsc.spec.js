import supertest from 'supertest';
import MmscServer from '../../../src/servers/mmsc.server';
import {
  clientErrorMm7Envelope,
  submitReqBody,
  HEADER,
  ERROR_HEADER,
  RECIPIENT,
  successMm7request,
  messageId,
} from '../../shared/constants';

const request = supertest(MmscServer);

describe('Mmsc server', () => {
  describe('200 OK', () => {
    test('Mmsc server is listening on MMSC_SERVER_PORT/health check endpoint', async () => {
      const response = await request.get('/');
      expect(response.status).toBe(200);
      expect(response.body).toBe('health check');
    });
  });

  describe('405 Method Not Allowed', () => {
    test('Mmsc server get error on anything but a post/get request', async () => {
      const response = await request.put('/');
      expect(response.status).toBe(405);
    });
  });
  describe('404 Not Found', () => {
    test('Mmsc server a failed request returns a 404 on incorrect url', async () => {
      const response = await request.post('/wrong');
      expect(response.statusCode).toBe(404);
    });
  });

  describe('400 Bad Request when wrong content-type in header', () => {
    test('Mmsc server returns a 400 error', async () => {
      const response = await request
        .post('/')
        .set(ERROR_HEADER)
        .send(successMm7request);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        'Content-Type must be multipart/related\nContent-Type must be text/xml\n'
      );
    });
  });
  describe('200 with 1000 Success', () => {
    test('Mmsc server response.text envelope contains <StatusCode>1000</StatusCode> and <StatusText>Success</StatusText>', async () => {
      const response = await request
        .post('/')
        .set(HEADER)
        .send(successMm7request);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<StatusCode>1000</StatusCode>');
      expect(response.text).toContain('<StatusText>Success</StatusText>');
    });
  });

  describe('invalidMmsEnvelope 200x Errors', () => {
    test('Mmsc server returns a 4001 Client Error', async () => {
      const response = await request.post('/').set(HEADER).send('');
      expect(response.statusCode).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<StatusCode>4001</StatusCode>');
      expect(response.text).toContain(
        '<StatusText>Invalid transaction ID</StatusText>'
      );
      expect(response.text).toContain(
        '<Details>Invalid MM7 envelope</Details>'
      );
    });
    test('Mmsc server returns a 2000 Client Error', async () => {
      const response = await request
        .post('/')
        .set(HEADER)
        .send(clientErrorMm7Envelope);
      expect(response.statusCode).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<StatusCode>2000</StatusCode>');
      expect(response.text).toContain('<StatusText>Client Error</StatusText>');
      expect(response.text).toContain(
        "<Details>'To' and 'From' are the same</Details>"
      );
    });
    // test address error (2002)
    test('Mmsc server returns a 2002 Address Error', async () => {
      const response = await request
        .post('/')
        .set(HEADER)
        .send(
          submitReqBody({
            messageId,
            from: 'wrong',
            to: RECIPIENT,
          })
        );
      expect(response.statusCode).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<StatusCode>2002</StatusCode>');
      expect(response.text).toContain('<StatusText>Address Error</StatusText>');
      expect(response.text).toContain(
        "<Details>Invalid 'From' field</Details>"
      );
    });
  });
});
