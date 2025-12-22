<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1A4rcrX-mBEmXF0S2YtCiCr644qHi-h5J

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run with Docker

**Prerequisites:** Docker and Docker Compose

### Using Docker Compose (Recommended)

1. Set your `GEMINI_API_KEY` environment variable:
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```
2. Build and run the container:
   ```bash
   docker-compose up --build
   ```
3. Access the app at `http://localhost:3000`

> **Note:** If the Docker build fails due to network timeouts during `npm install`, try building again or use the local build approach below.

### Using Docker directly

1. Build the Docker image:
   ```bash
   docker build -t riseleads-app .
   ```
   
   If the build fails due to network issues, retry the command or use:
   ```bash
   docker build --network=host -t riseleads-app .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 -e GEMINI_API_KEY=your_api_key_here riseleads-app
   ```
3. Access the app at `http://localhost:3000`

### Alternative: Local Build + Docker

If you experience persistent network issues during Docker build:

1. Install dependencies locally:
   ```bash
   npm install
   ```
2. Build locally:
   ```bash
   npm run build
   ```
3. Build Docker image (will use local build):
   ```bash
   docker build -t riseleads-app .
   ```
4. Run the container:
   ```bash
   docker run -p 3000:3000 riseleads-app
   ```
