document.addEventListener('DOMContentLoaded', () => {
    const logTerminal = document.getElementById('log-terminal');
    const fetchLogs = async () => {
        try {
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5000'
                : `${window.location.protocol}//${window.location.hostname}:5000`;
            const response = await fetch(`${baseUrl}/api/logs`);
            if (response.ok) {
                const realLogs = await response.json();

                // Only clear and re-render if we have new logs or it's the first run
                logTerminal.innerHTML = '';
                realLogs.forEach(log => {
                    const entry = document.createElement('div');
                    entry.className = 'log-entry';
                    entry.innerHTML = `
                        <span class="log-time">[${log.timestamp || 'N/A'}]</span>
                        <span class="log-type type-${log.level.toLowerCase()}">${log.level.toUpperCase()}</span>
                        <span class="log-msg">${log.message}</span>
                    `;
                    logTerminal.appendChild(entry);
                });
                logTerminal.scrollTop = logTerminal.scrollHeight;
            }
        } catch (error) {
            console.error("Error loading logs:", error);
        }
    };

    // Initial fetch and poll
    fetchLogs();
    setInterval(fetchLogs, 5000);
});
