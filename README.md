# Friendship Educational Academy — GitHub Pages + Google Sheets

This package moves the FEA frontend to GitHub Pages while keeping the existing Google Apps Script + Google Sheets backend.

## 1. Add the backend bridge

Open your existing FEA Apps Script project — the one that already contains `CONFIG`, `loginUser()`, `submitMarks()`, `getStudentResult()`, the admin functions, etc.

Create a new script file named `GitHub_API_Bridge.gs` and paste the contents of `apps-script/GitHub_API_Bridge.gs`.

Do not paste your teacher passwords, Sheet ID, or other private configuration into GitHub. They stay in Apps Script.

## 2. Deploy Apps Script as a Web App

In Apps Script:

Deploy → New deployment → Web app

Use:
- Execute as: Me
- Who has access: Anyone (or the appropriate access setting for your school)

Copy the `/exec` URL.

Google documents that web apps can execute `doPost(e)` and return JSON using Content Service. See the official documentation linked in the chat response.

## 3. Put the API URL into GitHub files

Open:

`js/bridge.js`

Replace:

`PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE`

with your Apps Script `/exec` URL.

Example:

`const FEA_API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';`

## 4. Upload to GitHub

Create a repository, for example:

`FEA-Portal`

Upload all files and folders from this package, then enable:

Settings → Pages → Deploy from branch → main → / (root)

Your site will be:

`https://YOURUSERNAME.github.io/FEA-Portal/`

## 5. Important security note

The current Apps Script source supplied for this conversion contains teacher passwords in `CONFIG.teachers`. Do NOT upload that source file to a public GitHub repository. Keep the backend private in Apps Script.

## 6. What is preserved

The supplied frontend files are reused with a compatibility bridge. Existing calls such as `google.script.run.loginUser(...)`, marks loading/submission, result lookup, admin operations, toppers, admit cards and ratings are routed to Apps Script through the API bridge.

The Google Sheet remains the database.
