# Mock message centers

Enclosed is a SMSC and MMSC mock servers to be used for testing

run these servers from the folder using

```
> npm install
> npm run dev
```

Servers will be hosted on 3300 (SMS) and 3301 (MMS)

MMSC can be interacted with directly using standard HTTP Post requests with XML Soap envelopes.

SMSC must be interacted with standard node net sessions or more explicitly the [node smpp]('https://www.npmjs.com/package/smpp') package. Target your tests at the message-worker application which will send smpp pdu payloads to the mock.

## Example MM7 envelope

```xml
    <?xml version='1.0'?>
    <soap-env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
        <soap-env:Header>
        <mm7:TransactionID xmlns:mm7="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4" env:mustUnderstand="1">riwuW8SEqClpyybNGIp1</mm7:TransactionID>
        </soap-env:Header>
        <soap-env:Body>
        <SubmitReq xmlns="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4">
        <MM7Version>6.8.0</MM7Version><SenderIdentification><VASPID>mmscMock</VASPID><VASID>mmscMock</VASID><SenderAddress><Number>+61412345999</Number></SenderAddress></SenderIdentification><Recipients><To><RFC2822Address>+61412345678/TYPE=PLMN</RFC2822Address></To></Recipients><MessageClass>Informational</MessageClass><TimeStamp>2022-04-28T22:58:52</TimeStamp><ExpiryDate>2022-04-28T22:58:52</ExpiryDate><DeliveryReport>false</DeliveryReport><ReadReply>false</ReadReply><Priority>Normal</Priority><Subject>test</Subject><DistributionIndicator>true</DistributionIndicator><Content href="MIMEContent_riwuW8SEqClpyybNGIp1" allowAdaptations="true"/>
        </SubmitReq>
        </soap-env:Body>
        </soap-env:Envelope>
        --SOAPBoundary_riwuW8SEqClpyybNGIp1
        Content-Type: multipart/mixed;boundary=MIMEBoundary_riwuW8SEqClpyybNGIp1
        Content-ID: MIMEContent_riwuW8SEqClpyybNGIp1

        --MIMEBoundary_riwuW8SEqClpyybNGIp1
        Content-Type: image/jpeg;
        Content-Transfer-Encoding: base64

        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

        --MIMEBoundary_riwuW8SEqClpyybNGIp1
        Content-Type: text/plain;
        Content-Transfer-Encoding: base64

        SSB3YXMgZnVubnkg8J+Ygg==

        --MIMEBoundary_riwuW8SEqClpyybNGIp1--
        --SOAPBoundary_riwuW8SEqClpyybNGIp1--
```

---

### WIP

not all cases are covered and more will need to be added.
