export const SMSC_SYSTEM_ID = 'systemId';
export const SMSC_PASSWORD = 'password';
export const SMSC_SERVER_PORT = 3300;
export const SMSC_SERVER_URL = `smpp://localhost:${SMSC_SERVER_PORT}`;

export const MMSC_SERVER_PORT = 3301;
export const MMSC_SERVER_URL = `http://localhost:${MMSC_SERVER_PORT}`;

export const SENDER = '+61412345678';
export const RECIPIENT = '+61478945612';
export const messageId = 'riwuW8SEqClpyybNGIp1';

export const HEADER = {
  'Content-Type': `multipart/related; boundary="SOAPBoundary_${messageId}"; type="text/xml" start="SOAPContent_${messageId}"`,
  SOAPAction: '',
};

export const ERROR_HEADER = {
  'Content-Type': `multipart/mixed; boundary="SOAPBoundary_${messageId}"; type="text/html" start="SOAPContent_${messageId}"`,
  SOAPAction: '',
};

export const MMS_TEST_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAA1UlEQVR4nOzRoWpCARhH8W3csXbTYK8w1sfi4uIe4YLPYBLBYNVo9QVEjGabiBjMokG4xaxFg8/wT8cL55f/Xzh8xWvn7SlRnTfR/n88iPblqR3tX6L1AzKAZgDNAJoBNANoBtAMoD1vv67RwaW+Rfv5xzraT7r9aN/4DxhAM4BmAM0AmgE0A2gG0IrFoRcdfFfLaL+vP6P9rFxF+8Z/wACaATQDaAbQDKAZQDOAVrSmf9nBaBftj++/0X74E82b/wEDaAbQDKAZQDOAZgDNANo9AAD//wh/Gdpw2LORAAAAAElFTkSuQmCC';

export const submitReqBody = ({ messageId, from, to }) => {
  return `
<?xml version='1.0'?>
<soap-env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Header>
    <mm7:TransactionID xmlns:mm7="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4" env:mustUnderstand="1">${messageId}</mm7:TransactionID>
    </soap-env:Header>
    <soap-env:Body>
    <SubmitReq xmlns="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4">
    <MM7Version>6.8.0</MM7Version><SenderIdentification><VASPID>mmscMock</VASPID><VASID>mmscMock</VASID><SenderAddress><Number>${from}</Number></SenderAddress></SenderIdentification><Recipients><To><RFC2822Address>${to}/TYPE=PLMN</RFC2822Address></To></Recipients><MessageClass>Informational</MessageClass><DeliveryReport>false</DeliveryReport><Priority>Normal</Priority><DistributionIndicator>true</DistributionIndicator><Content href="MIMEContent_${messageId}" allowAdaptations="true"/>
    </SubmitReq>
    </soap-env:Body>
    </soap-env:Envelope>
    --SOAPBoundary_${messageId}
    Content-Type: multipart/mixed;boundary=MIMEBoundary_${messageId}
    Content-ID: MIMEContent_${messageId}
    
    --MIMEBoundary_${messageId}
    Content-Type: image/jpeg;
    Content-Transfer-Encoding: base64
    
    ${MMS_TEST_IMAGE}
    
    --MIMEBoundary_${messageId}
    Content-Type: text/plain;
    Content-Transfer-Encoding: base64
    
    SSB3YXMgZnVubnkg8J+Ygg==
    
    --MIMEBoundary_${messageId}--
    --SOAPBoundary_${messageId}--
    `;
};

export const successMm7request = submitReqBody({
  messageId,
  from: SENDER,
  to: RECIPIENT,
});

export const clientErrorMm7Envelope = submitReqBody({
  messageId,
  from: SENDER,
  to: SENDER,
});
