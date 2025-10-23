# Vercel Deployment Configuration

## Environment Variables Setup

To fix the API issues on Vercel, you need to configure the following environment variables in your Vercel project:

### Required Environment Variables:

1. **VITE_API_BASE_URL**
   - **Value**: `https://62.72.24.4:3000/api`
   - **Description**: Your API base URL (now using HTTPS)

2. **VITE_ADMIN_TOKEN**
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwb29seWZpLmNvbSIsImRlcGFydG1lbnRJZCI6bnVsbCwiaWF0IjoxNzU4NjI4NzY2LCJleHAiOjE3NTkyMzM1NjZ9.cstMmG4fpz697BCceyEhHzzLxnKkyw44x8batw1JQu8`
   - **Description**: Your super admin JWT token

### How to Set Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add the two variables above:
   - Click "Add New"
   - Enter the variable name (e.g., `VITE_API_BASE_URL`)
   - Enter the variable value (e.g., `https://62.72.24.4:3000/api`)
   - Select "Production" environment
   - Click "Save"
5. Repeat for the second variable
6. **Redeploy** your project after adding the environment variables

### Changes Made to Fix Vercel Deployment:

1. **✅ Updated API Base URL**: Changed from `http://` to `https://` for security
2. **✅ Added CORS Mode**: Explicitly set `mode: 'cors'` in all fetch requests
3. **✅ Enhanced Error Handling**: Added better error messages for debugging
4. **✅ Environment Variable Support**: The app now properly uses environment variables

### API Endpoints That Will Work:

- ✅ `/industries` - Fetch industries for dropdown
- ✅ `/company_sizes` - Fetch company sizes for dropdown  
- ✅ `/company` - Create and fetch companies
- ✅ `/login/superadmin` - Super admin login

### Testing After Deployment:

1. Check browser console for any CORS errors
2. Test the "Add Company" modal to see if dropdowns load
3. Verify API calls are working by checking network tab in browser dev tools

### If Still Having Issues:

1. Check that your API server supports HTTPS
2. Ensure CORS is properly configured on your backend
3. Verify the admin token is still valid and not expired
4. Check Vercel function logs for any server-side errors

## Quick Fix Summary:

The main issue was that Vercel requires HTTPS for API calls. The changes made:
- Updated fallback URL from `http://` to `https://`
- Added explicit CORS mode to all fetch requests
- Enhanced error handling for better debugging
- Created environment variable configuration guide
