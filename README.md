# Pink Dose Management

A lightweight, private operations app for Pink Dose, a company managed by **Ghita Sqalli** with **Badr El Ghazaoui** as associate. It brings product pricing, package tracking, customer balances, transfers, pickup notices, and a period-based internal accounting view together in one mobile-friendly interface.

The interface is optimized mobile-first: preserve phone-width layouts, safe-area spacing, readable cards, and touch targets of at least 44px when adding or changing features.

The app is a static web application. GitHub Pages serves the interface, Firebase Authentication handles sign-in, and Cloud Firestore synchronizes shared records between Ghita’s and Badr’s devices.

## What the app does

### Products and sales

- Ghita is the only account allowed to create products. This is restricted in the interface and in Firestore rules.
- Both accounts can view products and edit existing product details.
- Products can be grouped by basket/customer name. The **Coupons** section creates percentage or fixed-value coupons for one or two separately selected baskets; Marwa and Rajaa remain distinct baskets. Basket records remain available in the background, and each basket can belong to one active coupon at a time.
- Entering a product’s price in EUR calculates its DH value using the shared exchange rate. A selling price can be recorded when the product is sold.
- Product delivery is not set on the product itself; Badr records package weight and package delivery fees in **Packages**.

### Packages and delivery

- Badr records a package description and weight. The sending fee is **€1.50 per kg**, converted to DH using the app’s shared exchange rate.
- The package workflow is **Confirmed → On going → Sent → Arrived**. Badr advances the package through Confirmed, On going, and Sent; Ghita marks it Arrived.
- The delivery total is displayed separately in white under Badr’s amount in the revenue bar. Package fees are included in Badr’s revenue.
- Compta excludes an unconfirmed package and includes package accounting activity from confirmation onward.

### Revenue overview

The home screen summarizes sold-product revenue and the configured product-profit split between Ghita and Badr. For products whose brand or basket name includes **Primark**, the original EUR price is also credited directly to Badr at **11.33 DH/€**; the product-profit split remains unchanged, and Primark revenue is highlighted separately in Badr’s summary. Package delivery fees are added to Badr’s revenue and shown separately. The shared exchange rate and Ghita’s share of product profit can be changed in **Packages → Currency rate and product split**.

### Clients, transfers, and pickup notices

- **Clients** stores amounts received and still owed. Sold baskets with a customer name appear in a selector; adding a basket adds the sum of its selling prices in DH to that client’s outstanding balance, once per basket.
- **Virements** lets Badr send to Ghita and Ghita send to Badr. Recipient bank details are shown in the send form; incoming transfers appear in a separate **Receiving** list. Outgoing transfers move through **Confirmed → On going → Sent**, and each creation, edit, and status change is recorded in Compta.
- **Livraison** lets a user post a pickup notice that is shared with the other account. The notice remains available until it is marked picked up.

### Compta

Compta provides day, month, and year filters, an activity list, and a downloadable PDF. Its internal Active / Passif grouping follows the requested management view:

- **Actif:** product purchase values and confirmed package/delivery charges.
- **Passif:** product sale values and coupon reductions.

Virement creation, amount edits, and each transfer status update also appear in the period activity list; internal transfers are not added to the Active or Passif totals.

This is an internal management report, **not** a certified statutory balance sheet or a representation of legal compliance. Have a qualified accountant validate accounting classifications and reporting requirements for the applicable jurisdiction.

## Accounts and permissions

| Account | Permissions |
|---|---|
| Ghita (`ghita@pinkdose.app`) | Create products, view and edit products, manage shared records, and mark sent packages as arrived. |
| Badr (`badr@pinkdose.app`) | View and edit existing products, manage package records and progress packages through Confirmed, On going, and Sent, and manage shared records. |

Firestore security rules are the authoritative enforcement layer for product creation and package status changes. Hiding or disabling a control in the interface is not a substitute for publishing the rules.

## Technology and project files

- `index.html` — The complete app interface and client-side application logic.
- `firestore.rules` — Firestore authorization rules for the two Pink Dose accounts, product creation, package workflow, and append-only accounting events.
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — App name and icons for supported home-screen installation.
- `package.json` — Local development command. There are no npm runtime dependencies; Firebase and PDF libraries are loaded by the page.

## Configure Firebase

The app requires a Firebase project with **Email/Password Authentication** and **Cloud Firestore** enabled.

1. In Firebase Console, create or select the project that will host Pink Dose’s data.
2. Enable Email/Password sign-in in **Authentication**.
3. Create these two users:
   - `badr@pinkdose.app`
   - `ghita@pinkdose.app`
4. Create a Firestore database. Choose its region carefully; Firebase does not allow changing the database location later.
5. In the Firestore **Rules** tab, publish the contents of [`firestore.rules`](./firestore.rules).
6. Register a Firebase web app, then copy its `firebaseConfig` values into the `firebaseConfig` object in `index.html`.
7. In Firebase Authentication settings, add the deployed website domain to **Authorized domains**.

The Firebase web API key is intended to be included in a client app; it is not an authorization boundary. Protect data with Firestore rules and keep account passwords private. Do not place service-account credentials or other server-side secrets in this repository.

## Run locally

From the project directory:

```sh
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The app still needs a working Firebase configuration and internet access to authenticate and sync Firestore data. PDF libraries load on demand when you create your first report. Stop the local server with **Ctrl+C**.

## Deploy to GitHub Pages

1. Push the project files to the repository’s `main` branch.
2. In GitHub, open **Settings → Pages**.
3. Set the source to **Deploy from a branch**, select `main` and `/(root)`, and save.
4. Wait for the Pages deployment to finish, then open the published URL.
5. Add the published host to Firebase Authentication’s authorized domains.
6. Whenever `firestore.rules` changes, publish the new rules in the Firebase Console as well. A GitHub Pages deployment does not automatically update Firebase rules.

For iPhone use, open the published site in Safari and choose **Share → Add to Home Screen**.

## Data and operational notes

- The two signed-in accounts share records through Firestore; changes appear on connected devices when the app is online.
- Accounting activity is recorded as append-only events. Existing product and package records can also supply fallback activity where older records lack a corresponding ledger entry.
- Older sold products without a recorded sale date use the last product update date as an estimate for report filtering.
- PDF creation requires internet access; jsPDF and its table plugin are downloaded on demand when you create your first report.
- The app does not send push notifications.
- The account password reset flow must be managed in Firebase Authentication; the configured `@pinkdose.app` addresses are application login identities.

## Troubleshooting

| Symptom | What to check |
|---|---|
| “Firebase is not set up yet” | Confirm the `firebaseConfig` values in `index.html` are from the intended Firebase web app. |
| Sign-in fails | Check that Email/Password is enabled, the user exists with the exact account email, and the password is correct. |
| Signed in but shared data cannot load | Confirm the Firestore database exists and the latest contents of `firestore.rules` have been published. |
| Product creation is rejected for Ghita | Check the signed-in email and ensure the Ghita-only product rule has been published. |
| Package status updates are rejected | Publish the current rules and ensure the action follows the allowed status sequence and account role. |
| PDF download is unavailable | Check connectivity and reload the app so the PDF libraries can load. |
| GitHub Pages shows an error or old version | Check the Pages deployment status and reload after deployment completes. |
