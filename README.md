# Ekene Frank (Young Digital) - Student Portfolio & Academic Planner

COS 106 Introduction to Web Technologies - Term Project (MIVA Open University)

A responsive, multi-page website built with plain HTML, CSS and JavaScript (no frameworks).

## Pages

| Page | File | What it does |
|------|------|--------------|
| Home | `index.html` | Name, photo, welcome message, bio, navigation |
| About | `about.html` | Education timeline, career aspirations, skills table, hobbies, video |
| Projects | `projects.html` | Three study guides (BMB 202, ANA 201, ENT 211) with infographics, descriptions and links, plus the planner |
| Planner | `planner.html` | Add, complete and delete tasks (saved in the browser) |
| Contact | `contact.html` | Form with JavaScript validation |

## Project structure

```
index.html  about.html  projects.html  planner.html  contact.html
css/style.css          one external stylesheet
js/main.js             mobile menu, active link, demo-link notes, footer year
js/effects.js          count-up numbers, typing effect, scroll progress bar, back-to-top button
js/planner.js          task planner (arrays, functions, DOM, events, localStorage)
js/contact.js          form validation (empty fields, email format, digits-only phone)
images/                photo, study-guide infographics, planner screenshot, video poster
media/smart-campus.mp4 video on the About page
```

## Requirements checklist

- **HTML:** semantic elements (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`), forms, tables, images, hyperlinks, lists, video
- **CSS:** external stylesheet, CSS variables for one colour scheme, Flexbox and Grid, styled navigation, transitions and animations, responsive and mobile-friendly
- **JavaScript:** event handling, DOM manipulation, form validation, dynamic updates, arrays and functions, interactive task manager

## Run it on your computer

Open `index.html` in a browser. That's all. (An internet connection is needed once to load the Google Fonts; without it the site falls back to Georgia and system fonts.)

## Put it online with GitHub Pages

1. Go to github.com, sign in as **Youngdigital38**, click **New repository**, name it `portfolio`, keep it **Public**, then **Create repository**.
2. Click **uploading an existing file**. Open the unzipped folder and drag in **everything inside it** (`index.html` must be at the top level of the repository, not inside another folder). Click **Commit changes**.
3. Go to **Settings > Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose branch **main** and folder **/ (root)**, then **Save**.
4. Wait one to two minutes. Your site will be at:
   `https://youngdigital38.github.io/portfolio/`
5. Submit **two links**: the site above and the repository `https://github.com/Youngdigital38/portfolio`.

## Things to update later

- **Facebook link:** the Facebook links currently open a search for "Onyenwaa Frank". Replace them with your real profile URL (search for `facebook.com` in each `.html` file).
- **Project links:** each study-guide card has a real "View full infographic" link (it opens the picture in `images/`) and a simulated "Open quiz (demo link)" button that shows a short note when clicked. Once a quiz is hosted, replace `href="#"` with its address in `projects.html` and delete `data-simulated="true"`.
- **Video:** `media/smart-campus.mp4` is the video on the About page (20 seconds, about 8 MB). To swap it, replace the file keeping the same name. GitHub's web upload accepts files up to 25 MB.
- **Contact form:** it validates in the browser but doesn't send messages anywhere. A service such as Formspree can be added later.

## Test it before you submit

1. Planner: add a task, tick it, refresh the page (it should still be there), delete it.
2. Contact: submit empty (4 errors), type `abc` in the phone box (digits-only error), type `bad@email` (email error), then fill it correctly (success message).
3. Phone: shrink the browser window or open the site on your phone. The menu should become a hamburger button.
