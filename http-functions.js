import {
    ok
} from 'wix-http-functions';
import {
    fetch
} from 'wix-fetch';

import {
    google
} from 'googleapis';

let auth, calendar;

const credentials = {
    "installed": {
        "client_id": "[REDACTED]",
        "project_id": "[REDACTED]",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "[REDACTED]",
        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
    }
};
const token = {
    "access_token": "[REDACTED]",
    "refresh_token": "[REDACTED]",
    "scope": "https://www.googleapis.com/auth/calendar",
    "token_type": "Bearer",
    "expiry_date": 0 /*[VALUE REDACTED]*/
};
const {
    client_secret,
    client_id,
    redirect_uris
} = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(token);
auth = oAuth2Client;
calendar = google.calendar({
    version: 'v3',
    auth
});


// URL to call this HTTP function from your published site looks like: 
// https://mysite.com/_functions/example/multiply?leftOperand=3&rightOperand=4

// URL to test this HTTP function from your saved site looks like: 
// https://mysite.com/_functions-dev/example/multiply?leftOperand=3&rightOperand=4

export function post_create(request) {
    const calendarID = "7qq049ioe518l0q6j34ll3edpo@group.calendar.google.com";

    request.body.json().then(json => {
        console.log({
            json
        });
        const {
            calendar: {
                end: {
                    dateTime: endDateTime,
                    timeZone: endTimeZone
                },
                start: {
                    dateTime: startDateTime,
                    timeZone: startTimeZone
                }
            },
            number,
            email,
            date,
            time,
            endTime,
            type,
            name
        } = json;
        calendar.events.insert({
            'calendarId': calendarID,
            'resource': {
                "end": {
                    "dateTime": endDateTime,
                    "timeZone": endTimeZone
                },
                "start": {
                    "dateTime": startDateTime,
                    "timeZone": startTimeZone
                },
                "description": `Email: ${email}\nPhone number: ${number}`,
                "summary": `${type} session with ${name}`
            }
        }).then(console.log, console.warn);
        fetch("https://api.sendgrid.com/v3/mail/send", {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                "Authorization": "Bearer [REDACTED]"
            },
            body: JSON.stringify({
                "from": {
                    "email": "fblatesterwebdesign@gmail.com"
                },
                "personalizations": [{
                    "to": [{
                        email
                    }],
                    "dynamic_template_data": {
                        date,
                        time,
                        endTime,
                        type,
                        name
                    }
                }],
                "template_id": "[REDACTED]"
            })
        });
        ok({});
    });
}
