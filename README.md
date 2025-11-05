<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1wxlfqkd2jU9lPvEVXE9H_9yWCxEJts1_

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure your API credentials (optional but recommended):
   ```bash
   cp .env.example .env.local # if you have an example file
   ```
   Then set the following environment variables as needed:
   - `VITE_OPENAI_API_KEY` / `VITE_OPENAI_API_URL` for the browser defaults
   - `OPENAI_API_KEY` / `OPENAI_API_URL` for server-side proxy requests
3. Run the app:
   `npm run dev`
