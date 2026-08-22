<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Europe hiking

欧洲一日徒步路线与行程定制网站。

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure the Supabase values in `.env` if login and registration are needed.
3. Run the app:
   `npm run dev`

## Deployment

Use Node.js 22.5 or newer. Deploy the project with `package.json`,
`package-lock.json`, and the generated `dist` directory (or deploy directly
from the repository). Configure the platform to run `npm install`, then
`npm run build`, and start with `npm start`. The server automatically uses the
hosting platform's `PORT` value and reads the packaged route database from
`dist/data/hiking-routes.db`.
