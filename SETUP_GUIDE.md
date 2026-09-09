# School ERP - Frontend Environment Configuration

## Required Environment Variables

Copy the values below to your `.env` file in the Frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Cloudinary Configuration (for School Logo & Banner uploads)
REACT_APP_CLOUDINARY_CLOUD_NAME=dy72h2bbf
REACT_APP_CLOUDINARY_UPLOAD_PRESET=school_erp
```

## Setup Instructions

### 1. Create .env File

Create a new file named `.env` in the `Frontend` directory with the configuration above.

```bash
cd Frontend
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
echo "REACT_APP_CLOUDINARY_CLOUD_NAME=dy72h2bbf" >> .env
echo "REACT_APP_CLOUDINARY_UPLOAD_PRESET=school_erp" >> .env
```

### 2. Verify Cloudinary Configuration

- **Cloud Name**: `dy72h2bbf` ✓
- **Upload Preset**: `school_erp` (must be configured in Cloudinary dashboard)
- **Upload Type**: Unsigned (no API key/secret required on frontend)

### 3. Backend Setup

The backend `Setting.js` model has been updated to support all new fields:

- School Information (6 fields)
- Contact Information (4 fields)
- Address Information (6 fields)
- Branding & Identity (4 fields)
- Plus existing 12+ category fields

No migration needed - new fields will have default empty values.

### 4. Testing the School Profile Form

1. Navigate to **Settings** page
2. Click **"School Profile"** card
3. Fill in the form sections:
   - School Information
   - Contact Information
   - Address Information
   - Branding & Identity
4. Upload logo by:
   - Dragging and dropping into the upload area, OR
   - Clicking to select a file
5. Upload banner (same method)
6. Click **"Save Changes"** button
7. Verify success toast notification

### 5. Troubleshooting

**Issue**: Cloudinary upload fails with "Upload failed"

- **Solution**: Verify that the upload preset `school_erp` exists in your Cloudinary dashboard
- **URL**: https://cloudinary.com/console/settings/upload

**Issue**: Environment variables not loading

- **Solution**: Restart the dev server after adding .env file
- **Vite**: `npm run dev` will reload environment variables

**Issue**: Images not saving to MongoDB

- **Solution**: Verify the API endpoint is correctly configured
- **Endpoint**: `PUT /erp/settings`

## File Locations

### Frontend Changes:

- [Frontend/src/pages/Settings.jsx](../../Frontend/src/pages/Settings.jsx) - Main settings wrapper
- [Frontend/src/pages/settings/SchoolProfileSettings.jsx](../../Frontend/src/pages/settings/SchoolProfileSettings.jsx) - Enhanced school profile form
- [Frontend/.env.example](.env.example) - Environment variables template

### Backend Changes:

- [server/models/Setting.js](../server/models/Setting.js) - Updated schema with all new fields

## Data Flow

```
User uploads logo via drag-drop
         ↓
Frontend validates file (type + size)
         ↓
XHR request to Cloudinary API
         ↓
Cloudinary returns secure_url
         ↓
Frontend updates state + preview
         ↓
User clicks "Save Changes"
         ↓
PUT request to /erp/settings API
         ↓
Backend validates + saves to MongoDB
         ↓
Success notification + data persists
```

## Feature Checklist

- [x] School Information fields (6)
- [x] Contact Information fields (4)
- [x] Address Information fields (6)
- [x] Branding & Identity fields (4)
- [x] Logo upload with preview
- [x] Banner upload with preview
- [x] Drag-and-drop upload zones
- [x] Upload progress tracking
- [x] File validation (type + size)
- [x] Delete logo/banner functionality
- [x] Cloudinary integration
- [x] Toast notifications
- [x] Dark mode support
- [x] Responsive layout
- [x] Backend model updated
- [x] API integration

## Production Deployment

Before deploying to production:

1. Create Cloudinary account at https://cloudinary.com
2. Create upload preset in Cloudinary dashboard (name: `school_erp`)
3. Set environment variables in production:
   - `REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name`
   - `REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset`
4. Ensure MongoDB `Setting` collection exists
5. Test logo/banner uploads in staging environment

## Support

For Cloudinary API documentation:

- https://cloudinary.com/documentation/upload_widget_reference
- https://cloudinary.com/documentation/upload_api_reference

For this implementation's specific details, refer to the code comments in SchoolProfileSettings.jsx
