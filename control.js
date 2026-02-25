document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const sprayOnBtn = document.getElementById('spray-on');
    const sprayOffBtn = document.getElementById('spray-off');
    const autoModeToggle = document.getElementById('auto-mode-toggle');
    const emergencyBtn = document.getElementById('emergency-stop');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmBtn = document.getElementById('confirm-spray');
    const cancelBtn = document.getElementById('cancel-spray');
    const currentModeText = document.getElementById('current-mode');
    const sprayStateText = document.getElementById('spray-state');
    const intensityOpts = document.querySelectorAll('.intensity-opt');

    let isSystemLocked = false;

    // Manual Spray Logic
    sprayOnBtn.addEventListener('click', () => {
        if (isSystemLocked) return;
        confirmModal.style.display = 'flex';
    });

    cancelBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
    });

    confirmBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        activateSpray();
    });

    sprayOffBtn.addEventListener('click', () => {
        deactivateSpray();
    });

    // Sync with Backend
    const fetchSprayStatus = async () => {
        try {
            const response = await fetch(`/api/data`);
            const data = await response.json();

            if (data.spray_status === 'ON' && !sprayOnBtn.classList.contains('active')) {
                sprayOnBtn.classList.add('active');
                sprayOffBtn.classList.remove('active');
                sprayStateText.textContent = 'Active';
                sprayStateText.style.color = '#4caf50';
            } else if (data.spray_status === 'OFF' && !sprayOffBtn.classList.contains('active') && !isSystemLocked) {
                sprayOnBtn.classList.remove('active');
                sprayOffBtn.classList.add('active');
                sprayStateText.textContent = 'Idle';
                sprayStateText.style.color = 'white';
            }
        } catch (error) {
            console.error('Error fetching spray status:', error);
            if (document.getElementById("status")) {
                document.getElementById("status").innerText = "Connection Lost";
            }
        }
    };

    const updateSprayOnBackend = async (status) => {
        try {
            await fetch(`/api/spray`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: status })
            });
        } catch (error) {
            console.error('Error updating spray status:', error);
            if (document.getElementById("status")) {
                document.getElementById("status").innerText = "Connection Lost";
            }
        }
    };

    // Initial sync and poll
    fetchSprayStatus();
    setInterval(fetchSprayStatus, 3000);

    const activateSpray = () => {
        sprayOnBtn.classList.add('active');
        sprayOffBtn.classList.remove('active');
        sprayStateText.textContent = 'Active';
        sprayStateText.style.color = '#4caf50';

        // Disable Auto Mode when Manual is active
        autoModeToggle.checked = false;
        currentModeText.textContent = 'Manual';

        updateSprayOnBackend('ON');
    };

    const deactivateSpray = () => {
        sprayOnBtn.classList.remove('active');
        sprayOffBtn.classList.add('active');
        if (!isSystemLocked) {
            sprayStateText.textContent = 'Idle';
            sprayStateText.style.color = 'white';
        }

        updateSprayOnBackend('OFF');
    };

    // Intensity Selector
    intensityOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            if (isSystemLocked) return;
            intensityOpts.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    // Auto Mode Logic
    autoModeToggle.addEventListener('change', (e) => {
        if (isSystemLocked) {
            e.target.checked = false;
            return;
        }

        if (e.target.checked) {
            currentModeText.textContent = 'Auto (AI)';
            currentModeText.style.color = '#4caf50';
            deactivateSpray(); // Ensure manual is off
        } else {
            currentModeText.textContent = 'Manual';
            currentModeText.style.color = 'white';
        }
    });

    // Emergency Stop
    emergencyBtn.addEventListener('click', () => {
        isSystemLocked = !isSystemLocked;

        if (isSystemLocked) {
            emergencyBtn.classList.add('active');
            emergencyBtn.innerHTML = '<i class="fas fa-lock"></i> SYSTEM LOCKED - RE-CLICK TO CLEAR';

            // Force Deactivate
            deactivateSpray();
            autoModeToggle.checked = false;
            currentModeText.textContent = 'LOCKED';
            currentModeText.style.color = '#f44336';
            sprayStateText.textContent = 'EMERGENCY STOP';
            sprayStateText.style.color = '#f44336';

            // Visual feedback
            const overlay = document.createElement('div');
            overlay.id = 'lock-overlay';
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(211, 47, 47, 0.1); pointer-events: none; z-index: 100;
            `;
            document.body.appendChild(overlay);
        } else {
            emergencyBtn.classList.remove('active');
            emergencyBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> EMERGENCY STOP';

            currentModeText.textContent = 'Manual';
            currentModeText.style.color = 'white';
            sprayStateText.textContent = 'Idle';
            sprayStateText.style.color = 'white';

            document.getElementById('lock-overlay')?.remove();
            alert('Emergency Lock Cleared. Manual control restored.');
        }
    });
});
