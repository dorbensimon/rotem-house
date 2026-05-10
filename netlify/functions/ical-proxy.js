// netlify/functions/ical-proxy.js
// Fetches an Airbnb iCal feed server-side (no CORS issues).
// Usage: GET /.netlify/functions/ical-proxy?property=greenville
//                                         OR  ?property=pendleton

const ICAL_URLS = {
  greenville: 'https://www.airbnb.com/calendar/ical/1611252745011009724.ics?t=0d7651a604d04268825c788060d98a93&locale=he',
  pendleton:  'https://www.airbnb.com/calendar/ical/1440955329892654568.ics?t=e4869dd3ec2a49b99e6e7efd97bd5834&locale=he'
};

exports.handler = async (event) => {
  const property = (event.queryStringParameters || {}).property;

  if (!property || !ICAL_URLS[property]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid property. Use ?property=greenville or ?property=pendleton' })
    };
  }

  try {
    const response = await fetch(ICAL_URLS[property], {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BHCORentals/1.0)' }
    });

    if (!response.ok) {
      throw new Error(`Airbnb returned ${response.status}`);
    }

    const icalText = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'public, max-age=900',   // cache 15 min
        'Access-Control-Allow-Origin': '*'
      },
      body: icalText
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message })
    };
  }
};
