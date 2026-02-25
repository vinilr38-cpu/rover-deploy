document.addEventListener('DOMContentLoaded', () => {
    const timestampEl = document.getElementById('camera-timestamp');
    const captureBtn = document.getElementById('capture-btn');
    const recordBtn = document.getElementById('record-btn');
    const flashEl = document.getElementById('flash');
    const detectionOverlay = document.getElementById('detection-overlay');

    // Update Timestamp
    const updateTimestamp = () => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        timestampEl.textContent = `${dateStr} ${timeStr}`;
    };

    setInterval(updateTimestamp, 1000);
    updateTimestamp();

    // Capture Photo Logic
    captureBtn.addEventListener('click', () => {
        // Flash Effect
        flashEl.style.animation = 'none';
        void flashEl.offsetWidth; // Trigger reflow
        flashEl.style.animation = 'camera-flash 0.3s ease-out';

        // Mock notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #2e7d32;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = '<i class="fas fa-check-circle"></i> Snapshot saved to gallery';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    });

    // Recording Logic
    let isRecording = false;
    recordBtn.addEventListener('click', () => {
        isRecording = !isRecording;

        if (isRecording) {
            recordBtn.classList.add('active');
            recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            recordBtn.style.color = '#f44336';
        } else {
            recordBtn.classList.remove('active');
            recordBtn.innerHTML = '<i class="fas fa-circle"></i> Start Recording';
            recordBtn.style.color = '';
            alert('Recording saved to system memory.');
        }
    });

    // Simulate AI Detection boxes
    setInterval(() => {
        const shouldShow = Math.random() > 0.7;
        if (shouldShow) {
            const randomX = Math.floor(Math.random() * 60) + 10;
            const randomY = Math.floor(Math.random() * 50) + 10;

            detectionOverlay.style.left = `${randomX}%`;
            detectionOverlay.style.top = `${randomY}%`;
            detectionOverlay.style.display = 'block';

            setTimeout(() => {
                detectionOverlay.style.display = 'none';
            }, 5000);
        }
    }, 10000);

    // CSS for notifications (adding dynamically since we don't have a separate CSS yet)
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
