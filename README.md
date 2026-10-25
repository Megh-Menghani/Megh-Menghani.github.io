# Megh Menghani: portfolio

Source for my portfolio site. I'm an Unreal Engine gameplay programmer working in C++ and Blueprints.

Live site: https://megh-menghani.github.io

## What's here

- `index.html`: the whole site, one page
- `css/style.css`, `js/main.js`: styling and the small bit of script (video playback, thumbnails, copy email)
- `resume/`: my resume as a web page; `assets/docs/resume.pdf` is generated from it with `python tools/build-resume-pdf.py`
- `assets/`: images, video clips and company logos

Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Run it locally

```bash
python -m http.server 3000
```

Then open http://localhost:3000.

## Contact

meghmenghani@gmail.com · [LinkedIn](https://www.linkedin.com/in/megh-menghani/)
