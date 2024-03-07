import smpp from 'smpp';
import hyperid from 'hyperid';
import { smppCredentials } from '../shared/constants.js';

let rx_session;

const SmscServer = smpp.createServer((session) => {
  session.on('error', function (e) {
    // empty callback to catch emitted errors to prevent exit due unhandled errors
    if (e.code === 'ETIMEOUT') {
      console.log('TIMEOUT');
    } else if (e.code === 'ECONNREFUSED') {
      console.log('Connection refused');
    } else {
      console.log('Other error');
    }
  });

  // bind_transmitter
  session.on('bind_transmitter', (pdu) => {
    console.log('------------------------------------');
    console.log(
      `${
        new Date().toISOString().split('.')[0]
      }Z - bind_transmitter - new session`
    );
    console.log('------------------------------------');

    const { system_id, password, command } = pdu;
    // pause session to make sure things finish
    session.pause();

    // if the id and password is incorrect then reject the bind and close the session
    if (
      system_id !== smppCredentials.system_id ||
      password !== smppCredentials.password
    ) {
      session.send(
        pdu.response({
          command_status: smpp.ESME_RBINDFAIL,
        })
      );
      session.close();
      return;
    }

    // accept the bind and resume the session
    session.send(
      pdu.response({
        command_status: smpp.ESME_ROK,
      })
    );
    session.resume();
  });

  // bind_receiver
  session.on('bind_receiver', (pdu) => {
    console.log('------------------------------------');
    console.log(
      `${new Date().toISOString().split('.')[0]}Z - bind_receiver - new session`
    );
    console.log('------------------------------------');

    rx_session = session;
    const { system_id, password, command } = pdu;
    // pause session to make sure things finish
    session.pause();

    // if the id and password is incorrect then reject the bind and close the session
    if (
      system_id !== smppCredentials.system_id ||
      password !== smppCredentials.password
    ) {
      session.send(
        pdu.response({
          command_status: smpp.ESME_RBINDFAIL,
        })
      );
      session.close();
      return;
    }

    // accept the bind and resume the session
    session.send(
      pdu.response({
        command_status: smpp.ESME_ROK,
      })
    );
    session.resume();
  });

  // listen for 'submit_sm'
  session.on('submit_sm', (pdu) => {
    // send the pdu response back to the client with a message id
    const messageCentreId = hyperid().uuid;

    session.send(
      pdu.response({
        message_id: messageCentreId,
      })
    );

    const tlvBuf = pdu[Number(0x3005)];
    console.log( new TextDecoder().decode(tlvBuf));

    const message = pdu.short_message.message;
    let delivered = 0;
    let error = 0;
    let deliveryStatus = 'DELIVRD';
    const submitDate = new Date();
    const submitDateStr = `${submitDate
      .getFullYear()
      .toString()
      .slice(2)}${submitDate.getMonth().toString().padStart(2, '0')}${submitDate
      .getDay()
      .toString()
      .padStart(2, '0')}${submitDate
      .getHours()
      .toString()
      .padStart(2, '0')}${submitDate.getMinutes().toString().padStart(2, '0')}`;
    const statuses = [
      'SCHEDULED',
      'UNKNOWN',
      'EXPIRED',
      'DELETED',
      'UNDELIV',
      'REJECTD',
    ];
    const setStatus = statuses.filter((status) => message.includes(status));

    if (setStatus.length > 0) {
      deliveryStatus = setStatus[0];
      if (deliveryStatus === 'EXPIRED' || deliveryStatus === 'UNDELIV') {
        error = 1;
      }
    } else {
      delivered = 1;
    }

    // send delivery notification
    setTimeout(() => {
      const doneDate = new Date();
      const doneDateStr = `${doneDate
        .getFullYear()
        .toString()
        .slice(2)}${doneDate.getMonth().toString().padStart(2, '0')}${doneDate
        .getDay()
        .toString()
        .padStart(2, '0')}${doneDate
        .getHours()
        .toString()
        .padStart(2, '0')}${doneDate.getMinutes().toString().padStart(2, '0')}`;
      rx_session.deliver_sm({
        source_addr: pdu.source_addr,
        destination_addr: pdu.destination_addr,
        short_message: {
          message: `id:${messageCentreId} sub:001 dlvrd:00${delivered} submit date:${submitDateStr} done date:${doneDateStr} stat:${deliveryStatus} err:00${error} text:\\x1E+az`,
        },
      });
    }, 1000);

    // send reply
    setTimeout(() => {
      rx_session.deliver_sm({
        source_addr: pdu.destination_addr,
        destination_addr: pdu.source_addr,
        short_message: {
          message: `reply to ${messageCentreId}`,
        },
      });
    }, 5000);
  });

  // listen for 'enquire_link'
  session.on('enquire_link', (pdu) => {
    // send the pdu response back to the client
    session.send(pdu.response());
  });

  // listen for 'unbind'
  session.on('unbind', (pdu) => {
    // send the pdu response back to the client
    session.send(pdu.response());
    // close the session
    session.close();
  });

  // listen for 'pdu'
  session.on('pdu', (pdu) => {
    // console log a date in sql datetime format and a json string of the pdu
    console.log(
      `${new Date().toISOString().split('.')[0]}Z - ${JSON.stringify(pdu)}\n`
    );
  });
});

export default SmscServer;
