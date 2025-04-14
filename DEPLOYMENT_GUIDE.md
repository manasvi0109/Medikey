# MediKey Deployment Guide

This guide provides step-by-step instructions for deploying the MediKey application to Render.

## Prerequisites

- GitHub account (username: manasvi0109)
- Render account
- OpenAI API key

## Deployment Steps

### 1. GitHub Repository

Your code has already been pushed to GitHub at:
https://github.com/manasvi0109/medikey

### 2. Render Deployment

#### 2.1. Create a Render Account

1. Go to [render.com](https://render.com/)
2. Sign up for an account (you can use your GitHub account for easier integration)

#### 2.2. Create a PostgreSQL Database

1. In Render dashboard, click on "New" and select "PostgreSQL"
2. Fill in the following details:
   - Name: medikey-db
   - Database: medikey
   - User: medikey
   - Region: Choose the region closest to your users
   - Instance Type: Free (for testing) or Basic (for production)
3. Click "Create Database"
4. After creation, go to the "Info" tab
5. Copy the "Internal Database URL" (it should look like: `postgres://medikey:password@medikey-db.internal:5432/medikey`)
6. Save this URL for the next step

#### 2.3. Create a Web Service

1. In Render dashboard, click on "New" and select "Web Service"
2. Choose "Build and deploy from a Git repository"
3. Connect your GitHub account if you haven't already
4. Find and select the repository `manasvi0109/medikey`
5. Fill in the following details:
   - Name: medikey
   - Environment: Node
   - Region: Choose the same region as your database
   - Branch: main
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free (for testing) or Basic (for production)
6. Scroll down to the "Environment Variables" section
7. Add the following variables:
   - `NODE_ENV`: production
   - `SESSION_SECRET`: medikey-production-secret
   - `DATABASE_URL`: [Paste the Internal Database URL from step 2.2]
   - `OPENAI_API_KEY`: [Your OpenAI API key]
8. Click "Create Web Service"

#### 2.4. Initialize the Database

1. Wait for the initial deployment to complete
2. Go to the "Shell" tab in your Web Service
3. Run the following command to initialize your database:
   ```
   npm run db:push
   ```
4. Wait for the command to complete

#### 2.5. Access Your Application

1. Go to the "Overview" tab in your Web Service
2. Click on the URL provided by Render (e.g., https://medikey.onrender.com)
3. Your MediKey application should now be accessible

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify that the `DATABASE_URL` environment variable is correctly set
2. Check if the database is running in the Render dashboard
3. Try restarting the web service

### Build Failures

If the build fails:

1. Check the build logs for specific errors
2. Verify that all dependencies are correctly listed in package.json
3. Make sure the build command is correct

### Application Errors

If the application shows errors after deployment:

1. Check the logs in the Render dashboard
2. Verify that all environment variables are correctly set
3. Try restarting the web service

## Maintenance

### Updating Your Application

To update your application:

1. Push changes to your GitHub repository
2. Render will automatically detect the changes and redeploy your application

### Database Backups

Render automatically creates daily backups of your PostgreSQL database. To create a manual backup:

1. Go to your database in the Render dashboard
2. Click on the "Backups" tab
3. Click "Create Backup"

### Custom Domain

To use a custom domain:

1. Go to your web service in the Render dashboard
2. Click on the "Settings" tab
3. Scroll down to the "Custom Domain" section
4. Follow the instructions to add your domain
