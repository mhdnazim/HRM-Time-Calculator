<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="https://res.cloudinary.com/dmpun7unq/image/upload/v1759304400/break-time-text-button-break-time-sign-icon-label-sticker-web-buttons-vector_jvbrto.png" type="image/png">
<title>Break Time Calculator</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background: #f0f2f5;
        color: #333;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
    }

    h2 {
        margin-bottom: 20px;
    }

    textarea {
        width: 100%;
        max-width: 400px;
        height: 180px;
        padding: 10px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 6px;
        resize: none;
    }

    button {
        margin-top: 15px;
        padding: 10px 25px;
        font-size: 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    button:hover {
        background-color: #45a049;
    }

    #results {
        margin-top: 20px;
        padding: 15px 20px;
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        font-size: 16px;
        color: #333;
        max-width: 400px;
        width: 100%;
        word-wrap: break-word;
    }

    label {
        font-weight: bold;
        margin-bottom: 5px;
        display: block;
    }

    .over-limit {
        color: red;
        font-weight: bold;
    }
    .within-limit {
        color: green;
        font-weight: bold;
    }

    .exit-time {
        font-weight: bold;
        color: #0077cc;
    }

    .productive-good {
        color: green;
        font-weight: bold;
    }

    .productive-bad {
        color: red;
        font-weight: bold;
    }

    ::placeholder {
        color: #aaa;
    }

    /* Dark theme styles */
    body.dark-mode {
        background: #121212;
        color: #e0e0e0;
    }

    body.dark-mode textarea {
        background: #1e1e1e;
        color: #e0e0e0;
        border: 1px solid #333;
    }

    body.dark-mode #results {
        background: #1e1e1e;
        color: #e0e0e0;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    }

    body.dark-mode button {
        background-color: #4CAF50;
        color: white;
    }

    body.dark-mode button:hover {
        background-color: #45a049;
    }

    body.dark-mode .over-limit {
        color: #ff4d4d;
    }

    body.dark-mode .within-limit {
        color: #4CAF50;
    }

    body.dark-mode .exit-time {
        color: #66b3ff;
    }

    body.dark-mode .productive-good {
        color: #4CAF50;
    }

    body.dark-mode .productive-bad {
        color: #ff4d4d;
    }
</style>
</head>
<body>

<h2>Break/Out Time Calculator</h2>

<label>Enter time logs line by line (HH:MM:SS AM/PM [tab] In/Out)</label>
<textarea id="timelogs" placeholder="08:40:01 AM	In
10:38:43 AM	Out
10:43:02 AM	In"></textarea><br>

<button onclick="calculateBreaks()">Calculate Break Time</button>

<div id="results"></div>

<script>
function parseTime(t) {
    const [time, meridiem] = t.split(' ');
    let [h, m, s] = time.split(':').map(Number);
    if(meridiem === 'PM' && h < 12) h += 12;
    if(meridiem === 'AM' && h === 12) h = 0;
    return h*3600 + m*60 + s;
}

function formatTime(sec) {
    if (sec < 0) sec = 0;
    const h = Math.floor(sec / 3600);
    sec %= 3600;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
}

function formatClockTime(sec) {
    sec = sec % (24*3600);
    const h24 = Math.floor(sec / 3600);
    sec %= 3600;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const meridiem = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${meridiem}`;
}

function calculateBreaks() {
    const lines = document.getElementById('timelogs').value.trim().split('\n');
    let events = lines.map(l => l.split('\t').map(s => s.trim()));

    let totalBreak = 0;
    let firstInTime = null;

    for(let i = 0; i < events.length; i++) {
        if(events[i][1].toLowerCase() === "in" && !firstInTime) {
            firstInTime = parseTime(events[i][0]);
        }
        if(events[i][1].toLowerCase() === "out" && i+1 < events.length && events[i+1][1].toLowerCase() === "in") {
            const outTime = parseTime(events[i][0]);
            const inTime = parseTime(events[i+1][0]);
            totalBreak += inTime - outTime;
        }
    }

    const allowedBreak = 45 * 60; 
    const warningThreshold = allowedBreak + 15 * 60; 
    const remaining = allowedBreak - totalBreak;

    let remainingMsg = "";
    if (totalBreak <= warningThreshold) {
        remainingMsg = `<span class="within-limit">Remaining break time: ${remaining >= 0 ? formatTime(remaining) : '0h 0m 0s'}</span>`;
    } else {
        remainingMsg = `<span class="over-limit">Exceeded break time by: ${formatTime(totalBreak - allowedBreak)}</span>`;
    }

    let exitTime = 'N/A';
    if (firstInTime !== null) {
        if (totalBreak <= allowedBreak) {
            exitTime = formatClockTime(firstInTime + (8*3600 + 45*60));
        } else {
            exitTime = formatClockTime(firstInTime + (8*3600) + totalBreak);
        }
    }

    // Productive hours + time left for 8h (value colors only)
    let productiveMsg = '';
    let timeLeftMsg = '';
    if (firstInTime !== null) {
        const now = new Date();
        const nowSec = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
        const productive = (nowSec - firstInTime) - totalBreak;

        if (productive < 8*3600) {
            productiveMsg = `Productive hours: <span class="productive-bad">${formatTime(productive)}</span>`;
            timeLeftMsg = `Time left for 8h: <span class="productive-bad">${formatTime((8*3600) - productive)}</span>`;
        } else {
            productiveMsg = `Productive hours: <span class="productive-good">${formatTime(productive)}</span>`;
            timeLeftMsg = `<span class="productive-good">✅ 8h productive time completed</span>`;
        }
    }

    document.getElementById('results').innerHTML = `
        <strong>Total break/out time:</strong> ${formatTime(totalBreak)}<br>
        ${remainingMsg}<br>
        <strong class="exit-time">Expected exit time:</strong> ${exitTime}<br>
        ${productiveMsg}<br>
        ${timeLeftMsg}
    `;
}

// Check URL param for dark mode
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}
</script>

</body>
</html>
