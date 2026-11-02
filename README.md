# Pink Dose Management

Shared app for Badr and Ghita: products and revenue split, clients (gave / owes), virements (pending / sent), livraison notices, EUR/DH rate.
It is a static site (GitHub Pages) that talks to Firebase (free) for the login and the live shared data.

No password is stored in these files. The two accounts live in Firebase Authentication.

Files in this folder:

| File | What it does |
|---|---|
| `index.html` | The whole app. You paste your Firebase config at the top of its script. |
| `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Name and icon for "Add to Home Screen". |
| `firestore.rules` | Security rules: only the two accounts can read or write. |

---

## Part A. Firebase (about 10 minutes, free plan, no card)

1. Go to https://console.firebase.google.com and sign in with a Google account.
2. **Create a project** (or "Add project"). Name: `pink-dose-management`. Turn Google Analytics off. Click Create.
3. **Authentication.** Left menu: Build, then Authentication, then **Get started**. In "Sign-in method" click **Email/Password**, switch **Enable** on, click Save.
4. **Create the two accounts.** Authentication, tab **Users**, button **Add user**.
   - Email `badr@pinkdose.app` and the password Badr chose.
   - Email `ghita@pinkdose.app` and the password Ghita chose.

   The app shows a username field. It adds `@pinkdose.app` by itself, so they type only `badr` or `ghita`. The emails must be exactly these two.
5. **Firestore.** Left menu: Build, then **Firestore Database**, then **Create database**.
   - Location: pick a European one (for example `eur3` or `europe-west9`). You cannot change it later.
   - Choose **Production mode**, then Enable.
   - Open the **Rules** tab, delete everything, paste the content of `firestore.rules`, click **Publish**.
6. **Get your config.** Click the gear icon (Project settings), tab **General**, scroll to "Your apps", click the **web icon `</>`**. App nickname `pink-dose-management`. Leave "Firebase Hosting" unticked. Click Register app. Firebase shows a block called `firebaseConfig`. Keep that page open.
7. Optional but recommended: Google Cloud Console, APIs and Services, Credentials, open the "Browser key" of this project, under Application restrictions choose Websites and add `https://badrrelghazaoui.github.io/*`.

## Part B. Paste the config

Open `index.html` in a text editor (TextEdit in plain-text mode, VS Code, or the pencil icon on GitHub later). Near the bottom, find:

```js
var firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  ...
};
```

Replace each `PASTE_...` value with the values from Firebase (keep the quotes). Save. The apiKey is not a secret for web apps. The rules from step 5 are what protect your data.

## Part C. Put it on GitHub Pages

1. On https://github.com click **+**, then **New repository**. Name: `Pink-Dose-Management`. Choose **Public**. Do not tick "Add a README". Click Create repository.
2. On the empty repo page click **uploading an existing file**.
3. Unzip the folder on your Mac, then drag the files into the page: `index.html`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `firestore.rules`, `README.md`. Drag the files, not the folder. Click **Commit changes**.
4. In the repo: **Settings**, then **Pages** (left menu). Under "Build and deployment", Source = **Deploy from a branch**. Branch = `main`, folder = `/ (root)`. Click Save.
5. Wait one or two minutes and refresh the Pages screen. It shows your address:
   `https://badrrelghazaoui.github.io/Pink-Dose-Management/`
6. Open it. You should see the login screen. If sign-in complains about the domain, in Firebase go to Authentication, Settings, **Authorized domains**, Add domain `badrrelghazaoui.github.io`.

## Part D. Install on the iPhones (Badr and Ghita)

1. Open the address in **Safari**.
2. Sign in (`badr` or `ghita`). When iOS offers to save the password, accept.
3. Tap the **Share** button, scroll, tap **Add to Home Screen**, keep the name "Pink Dose", tap **Add**.
4. Open it from the new icon. It runs full screen like an app, and both phones see the same data live.

## Updating the app later

Edit a file on GitHub (open it, pencil icon, change, Commit). Pages republishes in about a minute. On the iPhone, close the app fully from the app switcher and open it again.

## Local preview

Run `npm run dev` from this folder, then open http://127.0.0.1:5173. Stop the server with Ctrl+C.

## Good to know

- Sign-in is by username. Anyone can open the web address and see the login screen, but without the right account they get no data.
- To change a password: Firebase, Authentication, Users, menu on the user, **Reset password** (sends a reset email to the fake address, so instead delete the user and add it again with a new password).
- Firebase free plan (Spark) is far above what two people need.
- The app does not send push notifications. Badr sees a livraison notice when he opens the app, and live while it is open.
- In a product form, entering Price EUR automatically calculates Price DH using the shared rate; change that rate in the Rate tab.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Firebase is not set up yet" on the login | The `PASTE_...` values are still in `index.html`. |
| "Wrong username or password" with the right password | The user was created with a different email. It must be exactly `badr@pinkdose.app` / `ghita@pinkdose.app`. |
| Signed in but "can't read the data" | Rules not published (step 5), or the signed-in email is not one of the two. |
| "Can't reach shared data yet" | No internet, or the Firestore database was not created. |
| Page is blank on GitHub Pages | Pages not enabled yet, or `index.html` is inside a sub-folder. It must be at the root of the repo. |
