# Mimmir Founder's Console v0.1

This is an installable Progressive Web App (PWA) starter shell designed to run on an iPhone without Xcode or a Mac.

## What it includes
- Founder Gate with SHA-256 local password hash
- Founder identity/personality configuration
- Authority and permission toggles
- Private Brain endpoint placeholder
- Local Founder note
- Emergency lock
- Local factory reset
- Exportable configuration JSON
- Offline app shell via service worker
- iPhone Home Screen / standalone display support

## Important security note
This is a prototype control shell, not yet a hardened security product.
LocalStorage is not an encrypted vault. A production build should use:
- server-side authentication
- passkeys / WebAuthn
- encrypted database storage
- device-bound keys
- TLS
- server-held API secrets
- audit logs
- role-based access controls

Never place permanent AI provider API keys directly in app.js.

## Install on iPhone
A PWA must be served over HTTPS (or localhost during development). Do not open index.html directly from Files and expect installation/offline features to work.

Easy deployment choices:
- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

After deployment:
1. Open the HTTPS address in Safari on the iPhone.
2. Tap Share.
3. Tap "Add to Home Screen".
4. Launch Mimmir from the new icon.
5. Create your Founder Key on first launch.

## Private Brain API
Set the endpoint in the Founder Console after you build a private backend.
A recommended API shape is:

GET /health
POST /v1/chat
POST /v1/memory
GET /v1/memory/search
POST /v1/device/action

The browser-facing app should authenticate to your own backend. Your backend should hold provider credentials.

## Native iOS phase
For deeper iPhone capabilities such as Siri/App Intents, background tasks, Keychain, Bluetooth, HomeKit/Matter, push notifications, and tighter local-device access, wrap or rebuild this shell as a native Swift/SwiftUI app when a Mac/Xcode or cloud iOS build pipeline is available.
