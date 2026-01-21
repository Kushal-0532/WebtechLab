let activityLog = [];
const logDisplay = document.getElementById('log-display');
const alertBox = document.getElementById('suspicious-alert');
let clickCount = 0;
let clickTimer = null;

// 1. & 3. Event Listeners with Bubbling/Capturing consideration
// We attach to window/document to capture everything in the playground
document.addEventListener('click', (e) => {
    // Ignore clicks inside the monitor panel itself to avoid loops/clutter
    if (e.target.closest('.monitor-panel')) return;
    
    trackEvent('click', e.target);
    checkSuspiciousClicks();
});

document.addEventListener('keydown', (e) => {
    trackEvent('keydown', e.target, `Key: ${e.key}`);
});

// Focus/Blur do not bubble, so we use capture phase or specific listeners
// Here we use capture phase on document to catch all focus events
document.addEventListener('focus', (e) => {
    if (e.target.closest('.monitor-panel')) return;
    trackEvent('focus', e.target);
}, true);

document.addEventListener('blur', (e) => {
    if (e.target.closest('.monitor-panel')) return;
    trackEvent('blur', e.target);
}, true);


// 2. Log Activity
function trackEvent(type, target, details = '') {
    const entry = {
        timestamp: new Date().toLocaleTimeString(),
        type: type,
        target: target.tagName + (target.id ? `#${target.id}` : '') + (target.className ? `.${target.className}` : ''),
        details: details
    };

    activityLog.push(entry);
    renderLogEntry(entry);
}

// 4. Dynamically Display Log
function renderLogEntry(entry) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `
        <span class="log-time">[${entry.timestamp}]</span>
        <span class="log-type type-${entry.type}">${entry.type.toUpperCase()}</span>
        <span>${entry.target}</span>
        <span>${entry.details}</span>
    `;
    logDisplay.prepend(div); // Newest top
}

// 5. Suspicious Activity (Rate Limiting logic)
function checkSuspiciousClicks() {
    clickCount++;
    
    if (!clickTimer) {
        clickTimer = setTimeout(() => {
            if (clickCount > 5) {
                triggerAlert();
            }
            clickCount = 0;
            clickTimer = null;
        }, 1000); // 1 second window
    } else if (clickCount > 5) {
        triggerAlert();
    }
}

function triggerAlert() {
    alertBox.classList.remove('hidden');
    // Hide after 3 seconds
    setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 3000);
    
    // Log the warning too
    trackEvent('WARNING', document.body, 'Suspicious rapid clicking detected!');
}

// 6. Reset & Export
window.resetLog = function() {
    activityLog = [];
    logDisplay.innerHTML = '';
};

window.exportLog = function() {
    if (activityLog.length === 0) {
        alert("Log is empty.");
        return;
    }
    const text = activityLog.map(e => `[${e.timestamp}] ${e.type.toUpperCase()} on ${e.target} ${e.details}`).join('\n');
    
    // Create a Blob and download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity_log.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};