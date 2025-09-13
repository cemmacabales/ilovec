# Spotify Integration Setup Guide

This guide will help you set up Spotify integration for the iLoveC application.

## Prerequisites

- A Spotify account (free or premium)
- Access to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Step 1: Create a Spotify App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create App"**
4. Fill in the app details:
   - **App Name**: `iLoveC Web Player` (or any name you prefer)
   - **App Description**: `Web music player for iLoveC application`
   - **Website**: Your website URL (can be `http://localhost:5173` for development)
   - **Redirect URI**: `http://localhost:5173` (for development) or your production domain
5. Check the boxes for the terms of service
6. Click **"Save"**

## Step 2: Get Your Client ID

1. After creating the app, you'll be redirected to the app dashboard
2. Copy the **Client ID** (it looks like: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`)
3. Keep this safe - you'll need it for the next step

## Step 3: Configure Redirect URIs

1. In your app dashboard, click **"Edit Settings"**
2. In the **"Redirect URIs"** section, add:
   - For development: `http://localhost:5173`
   - For production: Your actual domain (e.g., `https://yourdomain.com`)
3. Click **"Add"** and then **"Save"**

## Step 4: Update Your Environment Variables

1. Open the `.env` file in your project root
2. Replace `your_spotify_client_id_here` with your actual Client ID:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_actual_client_id_here
   ```
3. Save the file

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Open the application in your browser
3. Click on the Spotify/Music section
4. Click **"Connect to Spotify"**
5. You should be redirected to Spotify's authorization page
6. Grant the necessary permissions
7. You should be redirected back to your app with a successful connection

## Troubleshooting

### "INVALID_CLIENT" Error
- Double-check that your Client ID is correct in the `.env` file
- Make sure there are no extra spaces or quotes around the Client ID
- Verify that your redirect URI matches exactly what's configured in the Spotify app settings

### "Invalid Redirect URI" Error
- Ensure the redirect URI in your Spotify app settings matches your current domain
- For development, use `http://localhost:5173`
- For production, use your actual domain with HTTPS

### Connection Issues
- Make sure you have a stable internet connection
- Check that your Spotify account is in good standing
- Try clearing your browser cache and cookies

## Required Spotify Scopes

The application requests the following permissions:
- `streaming` - Control playback on your devices
- `user-read-email` - Access your email address
- `user-read-private` - Access your subscription details
- `user-read-playback-state` - Read your currently playing track
- `user-modify-playback-state` - Control playback
- `user-read-currently-playing` - Read your currently playing track

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already added to `.gitignore` to prevent accidental commits
- For production deployments, set environment variables through your hosting platform's dashboard
- Consider using different Spotify apps for development and production environments

## Need Help?

If you're still experiencing issues:
1. Check the browser console for error messages
2. Verify all steps above have been completed correctly
3. Ensure your Spotify app is not in "Development Mode" restrictions if you're deploying to production

For more information, visit the [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/).