module.exports = {
    apps: [
        {
            name: "agrovision-backend",
            script: "agrovision-backend/start_waitress.py",
            interpreter: ".venv/Scripts/python.exe",
            watch: false,
            env: {
                FLASK_ENV: "production",
                PYTHONPATH: "./agrovision-backend"
            },
            log_date_format: "YYYY-MM-DD HH:mm:ss",
            error_file: "agrovision-backend/error.log",
            out_file: "agrovision-backend/out.log",
            combine_logs: true
        }
    ]
};
