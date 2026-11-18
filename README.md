# Rich Aura — three-page local preview

Home, Services and Contact are implemented. Run `node scripts/serve.mjs` and open http://127.0.0.1:4173. No dependency installation or build step is required.

- `/`: reference-directed Home, with two core service previews.
- `/services`: all four services, original lightweight SVG graphics, process and enquiry links.
- `/contact`: the five-field enquiry form. Service links preselect the relevant option.

Run `node scripts/check.mjs` to check structure, assets, service counts, form validation and WhatsApp message encoding.

The destination is the user's developer test number **+91 9879216262**, centrally configured in `dist/config.js`. Contact validates the fields and opens a WhatsApp link with neatly labelled text. Visitors must press Send themselves. A visible fallback link is provided if the new tab does not open. No data is stored or logged, and no message is automatically sent. Without JavaScript, the page offers email instead.

Files: `dist/index.html`, `dist/services.html`, `dist/contact.html`, shared `dist/styles.css` and `dist/app.js`, plus `dist/enquiry.js` for form validation/message preparation. The small local server supports extensionless routes and trailing slashes. Use the server to review page navigation.

Official logo, source figures and testimonial wording are retained. Fonts are self-hosted with licenses. Reduced-motion support, keyboard navigation, labels and mobile inputs are included. Preview remains noindex. About, Projects and admin are outside this milestone.

## GitHub and Netlify

Repository: https://github.com/mehulnawal/richAura-website

Import this repository into Netlify once and select the `main` branch. `netlify.toml` sets the publish directory to `dist`, runs `node scripts/check.mjs` before deployment, and supports direct Services and Contact URLs. No framework build is required.

After reviewing an update, commit and push it to `main`. Once Netlify is connected, each push triggers a deployment using the same site URL. Saving local files alone does not deploy them.

Client handoff files, palette backups and review ZIPs stay local and are excluded from Git. This deployment is a review preview with the developer WhatsApp destination; it does not change the production domain.

Current visual direction follows the client’s Digidarts reference within the three-page milestone. Rich Aura’s confirmed Gemini content, original logo, four services, two case studies and enquiry workflow remain the source of truth. The later About, Projects and project-admin milestone remains deferred.

Live preview: https://richaura-website.netlify.app/
