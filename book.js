import wixLocation from 'wix-location';
import moment from 'moment';

// In hours
const timeMap = {
    "Portrait Package": 3,
    "Event Package": 5,
    "Landscape Package": 1
}

function isBusy(start, end) {
    const fStart = start.toISOString(),
        fEnd = end.toISOString(),
        calendarID = "7qq049ioe518l0q6j34ll3edpo@group.calendar.google.com";

    const request = new XMLHttpRequest();
    request.open("POST", "https://content.googleapis.com/calendar/v3/freeBusy?alt=json&key=[REDACTED on GitHub to avoid being found by reposity key searchers; key is exposed on client-side code]", false);
    request.setRequestHeader("content-type", "application/json");
    request.send(JSON.stringify({
        "items": [{
            "id": calendarID
        }],
        "timeMin": fStart,
        "timeMax": fEnd
    }));
    return JSON.parse(request.responseText).calendars[calendarID].busy.length > 0;
}

$w.onReady(function() {
    const packageName = wixLocation.query["package"];
    if (packageName) {
        $w("#dropdown1").value = packageName[0].toUpperCase() + packageName.slice(1) + " Package";
    }

    function validateDateTime(_value, reject) {
        const packageValue = $w("#dropdown1").value,
            dateValue = $w("#datePicker1").value,
            timeValue = $w("#timePicker1").value;
        if (packageValue !== null && packageValue !== "" &&
            dateValue !== null &&
            timeValue !== null && timeValue !== "") {
            const duration = timeMap[packageValue],
                startDate = new Date(dateValue.toDateString() + " " + timeValue),
                endDate = new Date(startDate.getTime() + (1000 * 60 * 60 * duration));
            const busy = isBusy(startDate, endDate);
            if (busy) {
                reject("Katarina is not available during that time. Please refer to the calendar below and select a different time.");
            }
        }
    }
    $w("#timePicker1").onCustomValidation(validateDateTime);
    $w("#dropdown1").onChange(_ => {
        $w("#timePicker1").value = $w("#timePicker1").value;
    })
    $w("#datePicker1").onChange(_ => {
        $w("#timePicker1").value = $w("#timePicker1").value;
    })
    $w("#wixForms1").onWixFormSubmitted(event => {
        const [name, number, email, , time, date, type] = event.fields.map(i => i.fieldValue);
        const realDate = new Date(date.toDateString() + " " + time),
            endDate = new Date(realDate.getTime() + (1000 * 60 * 60 * timeMap[type]));
        fetch("https://www.katarina.photos/_functions/create", {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                calendar: {
                    end: {
                        dateTime: moment(endDate).format(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    start: {
                        dateTime: moment(realDate).format(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                },
                number,
                email,
                date: realDate.toLocaleDateString(),
                time: realDate.toLocaleTimeString(),
                endTime: endDate.toLocaleTimeString(),
                type,
                name
            })
        })
    });
});
