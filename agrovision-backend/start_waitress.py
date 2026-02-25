import sys
import os

# Redirect stdout and stderr to null if running without a console (pythonw)
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w")

from app import app, init_db, append_log

if __name__ == "__main__":
    init_db()
    append_log("INFO", "AgroVision backend starting via Waitress (Windowless)")
    from waitress import serve
    # No print statements here to avoid console issues on Windows
    serve(app, host='0.0.0.0', port=5000)
