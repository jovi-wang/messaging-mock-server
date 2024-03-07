import axios from 'axios';
import { MM7_RESPONSE_STATUS_CODES } from '../shared/mm7Errors.js';

// transactionId is the same transactionId send in SubmitReq
// TODO potentially handle partial success when StatusCode is 1100 and also has a <Details> tag
export const successSubmitRsp = (transactionId) => {
  return `<?xml version='1.0'?>    
    <soap-env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
        <soap-env:Header>
            <mm7:TransactionID xmlns:mm7="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4" env:mustUnderstand="1">${transactionId}</mm7:TransactionID>
        </soap-env:Header>
        <soap-env:Body>
          <SubmitRsp xmlns="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4">
            <MM7Version>6.8.0</MM7Version>
            <Status>
              <StatusCode>1000</StatusCode>
              <StatusText>Success</StatusText>
            </Status>
            <MessageID>${transactionId}.mmsc.telstra.com</MessageID>
          </SubmitRsp>
        </soap-env:Body>        
    </soap-env:Envelope>`;
};

export const failureSubmitRsp = (transactionId, statusCode, detail) => {
  let detailString = '';
  if (detail) {
    const length = detail.length;
    detail.forEach((element) => {
      detailString += `${element}`;
      if (length > 1 && element !== detail[length - 1]) {
        detailString += ', ';
      }
    });
  }
  return `<?xml version='1.0'?>
    <soap-env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
      <soap-env:Header>
        <mm7:TransactionID stUnderstand="1">${transactionId}</mm7:TransactionID>
      </soap-env:Header>
      <soap-env:Body>
        <SubmitRsp xmlns="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4">
          <MM7Version>6.8.0</MM7Version>
          <Status>
            <StatusCode>${statusCode}</StatusCode>
            <StatusText>${getStatusCodeText(statusCode)}</StatusText>
            <Details>${detailString}</Details>
          </Status>
          <MessageID>${transactionId}.mmsc.telstra.com</MessageID>
        </SubmitRsp>
      </soap-env:Body>
    </soap-env:Envelope>`;
};

const getStatusCodeText = (statusCode) => {
  return Object.values(MM7_RESPONSE_STATUS_CODES).find(
    (i) => i.statusCode == statusCode
  ).statusMessage;
};

export const SendDeliveryReportReq = ({ from, to, messageId }) => {
  const timeStamp = new Date().toISOString().split('.')[0];
  const deliveryReport = `<?xml version='1.0'?>
  <soap-env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Header>
      <mm7:TransactionID xmlns:mm7="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4" env:mustUnderstand="1">${messageId}</mm7:TransactionID>
    </soap-env:Header>
    <soap-env:Body>
      <DeliveryReportReq xmlns="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4">
        <MM7Version>6.8.0</MM7Version>
        <MMSRelayServerID>TARAL</MMSRelayServerID>
        <MessageID>${messageId}</MessageID>
        <Recipient>
          <RFC2822Address>${to}/TYPE=PLMN@mm7.mms.telstra.com</RFC2822Address>
        </Recipient>
        <Sender>
          <RFC2822Address>${from}/TYPE=PLMN@mm7.mms.telstra.com</RFC2822Address>
        </Sender>
        <Date>${timeStamp}</Date>
        <MMStatus>Retrieved</MMStatus>
        <StatusText>The message was retrieved by the recipient</StatusText>
        <UACapabilities UAProf="iphone_12"/>
      </DeliveryReportReq>
    </soap-env:Body>
  </soap-env:Envelope>`;

  const axiosConfig = {
    method: 'post',
    url: process.env.MMSC_CALLBACK_URL,
    // url: 'http://messaging-worker:8081/callback',
    headers: {
      'Content-Type': 'text/xml',
    },
    data: deliveryReport,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  };
  axios(axiosConfig);
};
