const ical = require('node-ical');
const fetch = require('node-fetch');

async function sync() {
    const icalUrl = "https://calendar.google.com/calendar/ical/insoumisud77%40gmail.com/private-b6531feaa35f54f9ad3a951bd85b07cb/basic.ics";
    const dbUrl = "https://sms-militants-default-rtdb.europe-west1.firebasedatabase.app";

    console.log("Téléchargement du calendrier iCal...");
    const response = await fetch(icalUrl);
    const icsData = await response.text();

    const parsedData = ical.parseICS(icsData);
    let events = [];

    for (let k in parsedData) {
        if (parsedData.hasOwnProperty(k)) {
            let ev = parsedData[k];
            if (ev.type === 'VEVENT') {
                let d = new Date(ev.start);
                let day = String(d.getDate()).padStart(2, '0');
                let month = String(d.getMonth() + 1).padStart(2, '0');
                let year = d.getFullYear();
                let formattedDate = `${day}/${month}/${year}`;

                events.push({
                    summary: ev.summary,
                    date: formattedDate,
                    timestamp: d.getTime()
                });
            }
        }
    }

    events.sort((a, b) => a.timestamp - b.timestamp);
    const upcomingEvents = events.slice(0, 15);

    console.log(`Envoi de ${upcomingEvents.length} événements vers Firebase...`);
    
    await fetch(`${dbUrl}/calendarEvents.json`, {
        method: 'PUT',
        body: JSON.stringify(upcomingEvents),
        headers: { 'Content-Type': 'application/json' }
    });

    console.log("Synchronisation terminée avec succès !");
}

sync().catch(err => {
    console.error("Erreur lors de la synchro :", err);
    process.exit(1);
});
