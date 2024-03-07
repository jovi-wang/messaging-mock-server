// tests for smsc server

import smpp from 'smpp';
import SmscServer from '../../../src/servers/smsc.server';
import {
  SMSC_PASSWORD,
  SMSC_SYSTEM_ID,
  SMSC_SERVER_PORT,
  SMSC_SERVER_URL,
} from '../../shared/constants';

let smscServer;
let session;
beforeAll((done) => {
  smscServer = SmscServer.listen(SMSC_SERVER_PORT);
  done();
});

afterAll((done) => {
  session.destroy();
  smscServer.close();
  done();
});

beforeEach((done) => {
  if ((!session || session.closed) && smscServer.listening) {
    session = smpp.connect({
      url: SMSC_SERVER_URL,
      auto_enquire_link_period: 10000,
      key: '',
      cert: '',
    });
  }
  done();
});

afterEach((done) => {
  if (!session.closed) {
    session.close();
  }
  done();
});

describe('Connectivity', () => {
  test('Smsc server is listening on SMSC_SERVER_PORT', async () => {
    const port = smscServer.address().port;
    expect(port).toBe(SMSC_SERVER_PORT);
  });

  test('Smsc server sends bind_receiver response', async () => {
    let pduResponse = await session.bind_receiver(
      {
        system_id: SMSC_SYSTEM_ID,
        password: SMSC_PASSWORD,
        system_type: 'MHS',
      },
      async (pdu) => {
        await expect(pdu.command).toBe('bind_receiver_resp');
        await expect(pdu.command_status).toBe(smpp.ESME_ROK);
      }
    );
  });

  test('Smsc server sends enquire_link response', () => {
    session.enquire_link({}, (pdu) => {
      expect(pdu.command).toBe('enquire_link_resp');
      expect(pdu.command_status).toBe(smpp.ESME_ROK);
    });
  });

  test('Smsc server sends submit_sm response', () => {
    session.submit_sm({}, (pdu) => {
      expect(pdu.command).toBe('submit_sm_resp');
      expect(pdu.command_status).toBe(smpp.ESME_ROK);
    });
  });
});

describe('Credentials', () => {
  test('Smsc server throws an error on wrong system_id', async () => {
    const response = await session.bind_receiver(
      {
        system_id: 'thisiswrong',
        password: SMSC_PASSWORD,
        system_type: 'MHS',
      },
      (pdu) => {
        expect(pdu.command).toBe('bind_receiver_resp');
        expect(pdu.command_status).toBe(smpp.ESME_RBINDFAIL);
      }
    );
  });

  test('Smsc server throws an error on incorrect password', async () => {
    const response = await session.bind_receiver(
      {
        system_id: SMSC_SYSTEM_ID,
        password: 'wrongpassword',
        system_type: 'MHS',
      },
      (pdu) => {
        expect(pdu.command).toBe('bind_receiver_resp');
        expect(pdu.command_status).toBe(smpp.ESME_RBINDFAIL);
      }
    );
  });
});
