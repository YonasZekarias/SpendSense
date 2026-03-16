# Backend setup

## Virtual environment (venv)

If you see **bad interpreter** or `spendsense-backend/venv/bin/python3: no such file or directory`, the venv was created when the project lived at a different path. Recreate it:

```bash
cd spendsense-server
rm -rf venv
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

**Note:** Use **`-r`** (read from file). Without it, `pip install requirements.txt` tries to install a package literally named "requirements.txt" and fails.

## Don’t install into system Python

If you see **externally-managed-environment**, you’re using the system Python (e.g. Homebrew). Always activate the project venv first, then install:

```bash
cd spendsense-server
source venv/bin/activate
pip install -r requirements.txt
```

Never use `pip install` (or `python3 -m pip install`) without activating the venv unless you intend to install globally.
