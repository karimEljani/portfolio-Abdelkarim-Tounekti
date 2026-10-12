PORTFOLIO – USER GUIDE
======================
1) Open index.html to view the portfolio.
2) Manage projects: add ?admin to the address (index.html?admin), then click "✎ Manage projects".
   You can add / edit / delete projects and photos (main photo, thumbnails, plan, gallery).

ONLINE WITH PHP (recommended – changes are published immediately)
- Upload the whole content of the zip to your hosting.
- Open api.php and CHANGE the password (const PASSWORD).
- Make sure the data/ and uploads/ folders are writable.
- Go to https://your-site/?admin and click "Manage projects": the password is requested EVERY time.

STATIC HOSTING (no PHP) or local use
- A password is also requested: change LOCAL_PASSWORD at the top of script.js.
- Changes are kept as a draft in your browser. Click "Export (projects.js)" then replace data/projects.js on your hosting.

To change the images of the other pages (cover, about, gallery…), replace the files in img/ (same names) or edit PAGE_IMG in script.js.
ANIMATIONS: style.css (design), animations.css + animations.js (motion). Remove the 2 animation lines in index.html to disable them.
