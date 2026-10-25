"""Build assets/docs/resume.pdf from resume/index.html with headless Chrome.

The phone number is kept out of the public page: it lives in _raw/private.json
(git-ignored) and is only inserted into a temporary copy used for printing.

    python tools/build-resume-pdf.py
"""
import json
import pathlib
import subprocess

root = pathlib.Path(__file__).resolve().parent.parent
page = root / "resume" / "index.html"
tmp = root / "resume" / "_print.html"
out = root / "assets" / "docs" / "resume.pdf"
chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

phone = json.loads((root / "_raw" / "private.json").read_text(encoding="utf-8"))["phone"]
html = page.read_text(encoding="utf-8")
assert "<!-- phone -->" in html, "phone marker missing from resume/index.html"
tmp.write_text(html.replace("<!-- phone -->", f"<span>{phone}</span>"), encoding="utf-8")
try:
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    "--virtual-time-budget=8000", f"--print-to-pdf={out}", tmp.as_uri()],
                   check=True, capture_output=True, timeout=120)
finally:
    tmp.unlink(missing_ok=True)
print("wrote", out)
