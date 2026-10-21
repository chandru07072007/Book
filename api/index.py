import sys
import os

# Put backend path in sys.path so app.main can be imported
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app
