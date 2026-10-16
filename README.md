# Nearby Folk Landing Page

Production-ready static landing and hosting site for Nearby Folk.

## What This Folder Includes

- New Nearby Folk landing page design.
- Legal pages for Privacy Policy, Terms of Service, Community Guidelines, and Account Deletion.
- Firebase account action handler at the neutral `/account-action` route.
- Razorpay checkout redirect page at `/premium-checkout`.
- Live Google Play download links and App Store buttons that show a themed "Coming soon.." popup.
- Netlify redirects, headers, robots, sitemap, favicon, logo, and 404 page.

## Important Routes

- `/` - landing page
- `/privacy-policy` - Privacy Policy
- `/terms` - Terms of Service
- `/community-guidelines` - Community Guidelines
- `/account-deletion` - Account Deletion
- `/reset-password` - direct password-reset handler
- `/account-action` - shared Firebase action-link handler for password resets and email verification
- `/__/auth/action` - legacy Firebase action-link handler
- `/premium-checkout` - Razorpay checkout bridge

Legacy routes from the old hosting folder are redirected:

- `/privacy` and `/privacy.html` -> `/privacy-policy`
- `/terms.html` -> `/terms`
- `/community`, `/community.html`, and `/guidelines` -> `/community-guidelines`
- `/account-deletion.html` -> `/account-deletion`

## Run Locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy To Netlify

### Drag And Drop

1. Go to `https://app.netlify.com/drop`.
2. Drag this entire folder into the page.
3. Netlify deploys instantly.

### Git-Based Deploy

1. Push this folder to GitHub.
2. In Netlify, choose Add new site -> Import an existing project.
3. Build command: leave empty.
4. Publish directory: `.`
5. Deploy.

## Connect `nearbyfolk.com`

1. In Netlify, open Domain settings -> Add custom domain -> `nearbyfolk.com`.
2. Follow Netlify's DNS instructions.
3. Typical setup:
   - Apex `nearbyfolk.com` -> A record `75.2.60.5`
   - `www.nearbyfolk.com` -> CNAME to your Netlify site
4. Enable HTTPS in Netlify after DNS propagates.

## Firebase Auth Links

After Netlify is live, set the Firebase Authentication custom action URL to the neutral shared handler:

```text
https://nearbyfolk.com/account-action
```

`ActionCodeSettings.url` remains the per-flow continue URL (`/reset-password`
or `/verify-email`); it does not replace Firebase's shared action-handler URL.

Also add these authorized domains in Firebase Authentication:

- `nearbyfolk.com`
- `www.nearbyfolk.com`

## Verify After Deploy

- Landing page loads and phone previews stay clipped inside frames.
- Google Play buttons open the live Nearby Folk listing, and App Store buttons show the "Coming soon.." popup.
- `/reset-password?mode=resetPassword&oobCode=...` opens the password-reset UI.
- `/account-action?mode=verifyEmail&oobCode=...` opens the shared handler and completes email verification without flashing password-reset content.
- `/premium-checkout?session=...` opens the Razorpay checkout bridge.
- `/privacy`, `/terms`, `/community`, and their old `.html` paths redirect correctly.
- `/account-deletion` opens the account deletion information page.
- `robots.txt` and `sitemap.xml` are reachable.
- Favicon and logo load.

## Notes

- Do not copy the old `index.html`, `styles.css`, or `script.js` over this folder unless you intentionally want to replace the new landing page design.
