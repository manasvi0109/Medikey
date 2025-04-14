# Deploying MediKey to GitHub Pages

This guide provides step-by-step instructions for deploying the MediKey frontend to GitHub Pages while hosting the backend separately.

## Important Note

GitHub Pages can only host static websites. Your MediKey application is a full-stack application with a Node.js backend and a PostgreSQL database. This guide will help you deploy just the frontend part to GitHub Pages, while the backend needs to be deployed separately (e.g., on Render).

## Prerequisites

- GitHub account (username: manasvi0109)
- Repository already set up at https://github.com/manasvi0109/medikey
- Backend deployed on a platform like Render (follow the DEPLOYMENT_GUIDE.md for backend deployment)

## Deployment Steps

### 1. Update the Backend URL

1. Open the `client/src/config.ts` file
2. Update the `githubPagesConfig` and `prodConfig` objects with your actual backend URL:
   ```typescript
   const prodConfig: Config = {
     apiBaseUrl: 'https://medikey.onrender.com/api', // Replace with your actual backend URL
   };

   const githubPagesConfig: Config = {
     apiBaseUrl: 'https://medikey.onrender.com/api', // Replace with your actual backend URL
   };
   ```

### 2. Commit and Push Your Changes

```bash
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push
```

### 3. Deploy to GitHub Pages

Run the following commands to build and deploy the frontend to GitHub Pages:

```bash
npm run deploy
```

This will:
1. Build the frontend with the correct base path (`/medikey/`)
2. Deploy the built files to the `gh-pages` branch of your repository

### 4. Configure GitHub Pages

1. Go to your repository on GitHub (https://github.com/manasvi0109/medikey)
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. For "Source", select the `gh-pages` branch
5. Click "Save"

### 5. Access Your Frontend

Your frontend will be available at:
https://manasvi0109.github.io/medikey/

## Troubleshooting

### CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) issues:

1. Make sure your backend allows requests from your GitHub Pages domain
2. Add the following headers to your backend responses:
   ```
   Access-Control-Allow-Origin: https://manasvi0109.github.io
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

### 404 Errors on Refresh

GitHub Pages doesn't support client-side routing by default. To fix this:

1. Create a `404.html` file in the `public` directory with a script to redirect to the main page
2. Add a script to `index.html` to handle the redirect

### Authentication Issues

Since GitHub Pages and your backend are on different domains:

1. Make sure your backend uses secure cookies with the `SameSite=None` and `Secure` attributes
2. Consider implementing token-based authentication instead of cookie-based authentication

## Limitations

1. **Backend Communication**: The frontend on GitHub Pages can only communicate with your backend through API calls
2. **Real-time Features**: WebSocket connections might require additional configuration
3. **Authentication**: Cookie-based authentication across domains requires special configuration

## Maintenance

### Updating Your Frontend

To update your frontend:

1. Make changes to your code
2. Commit and push to your repository
3. Run `npm run deploy` again to update the GitHub Pages site
