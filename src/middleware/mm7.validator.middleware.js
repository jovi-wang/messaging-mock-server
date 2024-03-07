import { parsePhoneNumber } from 'awesome-phonenumber';
import { v4 as uuidv4 } from 'uuid';
import xml2js from 'xml2js';
import { failureSubmitRsp } from '../helpers/mms.response.helper.js';
export const verifyAustralianNumber = (number) => {
  const result = parsePhoneNumber(number, { regionCode: 'AU' });
  return (
    result.valid &&
    result.typeIsMobile &&
    number.startsWith('+61') &&
    number.length === 12
  );
};

export const verifyMmsHeaderParams = (req, res, next) => {
  let responseErrors = '';
  // extract the first field from 'content-type'
  const contentType = req.headers['content-type'];

  if (!contentType.includes('multipart/related')) {
    responseErrors += 'Content-Type must be multipart/related\n';
  }

  if (!contentType.includes('type="text/xml"')) {
    responseErrors += 'Content-Type must be text/xml\n';
  }

  if (!contentType.includes('boundary=')) {
    responseErrors += 'Content-Type must have boundary\n';
  }

  if (!contentType.includes('start=')) {
    responseErrors += 'Content-Type must have start\n';
  }

  if (responseErrors.length > 0) {
    res.status(400).send(responseErrors);
  } else {
    next();
  }
};

export const verifyMmsEnvelope = async (req, res, next) => {
  // response will be a mm7 envelope
  let responseErrors = [];
  let statusCode = 1000;
  const xmlBody = req.rawBody;

  const regex =
    /<soap-env:Envelope xmlns:env="http:\/\/schemas.xmlsoap.org\/soap\/envelope\/">[\s\S]*?<\/soap-env:Envelope>/gi;
  const envelopeFound = xmlBody.match(regex);

  // to verify if the xml is valid, first verify if envelope exist, second verify if SubmitReq tags exist
  if (
    !envelopeFound ||
    !xmlBody.includes('</SubmitReq>') ||
    !xmlBody.includes('<SubmitReq')
  ) {
    responseErrors.push('Invalid MM7 envelope');
    statusCode = 4001;
  } else {
    const { to, from } = await parseMM7Envelope(envelopeFound);

    // validate body params
    if (!to) {
      responseErrors.push("Missing 'To' field");
      statusCode = 2000;
    }
    if (!from) {
      responseErrors.push("Missing 'From' field");
      statusCode = 2000;
    }
    if (!verifyAustralianNumber(to.toString())) {
      responseErrors.push("Invalid 'To' field");
      statusCode = 2002;
    }
    if (!verifyAustralianNumber(from.toString())) {
      responseErrors.push("Invalid 'From' field");
      statusCode = 2002;
    }
    if (to === from) {
      responseErrors.push("'To' and 'From' are the same");
      statusCode = 2000;
    }
  }
  if (responseErrors.length > 0) {
    res.set('Content-Type', 'text/xml; charset="utf-8"');
    res
      .status(200)
      .send(failureSubmitRsp(uuidv4(), statusCode, responseErrors));
  } else {
    next();
  }
};

const parseMM7Envelope = async (xmlBody) => {
  try {
    const options = {
      trim: true,
      mergeAttrs: true,
      explicitArray: false,
      async: true,
      normalizeTags: true,
      normalize: true,
    };
    const result = await xml2js.parseStringPromise(xmlBody, options);
    // console.dir(result, { depth: null });
    const sender =
      result['env:envelope']['env:body'].submitreq.senderidentification
        .senderaddress;
    const recipient =
      result['env:envelope']['env:body'].submitreq.recipients.to;

    const from = sender.number || sender.rfc2822address || sender;
    const to = recipient.number || recipient.rfc2822address;
    return { from: from.split('/')[0], to: to.split('/')[0] };
  } catch (error) {
    console.log(error);
  }
};
