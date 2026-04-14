# 🏨 Hotel Management Dashboard with Google Sheets Integration

A complete hotel management system that stores all data in Google Sheets instead of localStorage.

## 🎯 Features

- ✅ **Cloud Storage**: All data stored in Google Sheets
- ✅ **Multi-Device Access**: Access from anywhere
- ✅ **Unlimited Storage**: No localStorage limits
- ✅ **Team Collaboration**: Share with your team
- ✅ **Auto Backup**: Automatic Google Drive backup
- ✅ **Offline Support**: Works offline with localStorage fallback

---

## 📦 Files Included

1. **hotel-dashboard-google-sheets.html** - Main dashboard file
2. **google-apps-script.js** - Google Apps Script for API
3. **SETUP-GUIDE-AR.md** - Detailed setup guide (Arabic)
4. **README.md** - This file

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Setup Google Sheet

1. Open your Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/1wkV0gsiWiQITZd3c-ivh_dTrgbhRwBQtxLXUgWsO5Dc/edit
   ```

2. Go to **Extensions > Apps Script**

3. Delete default code and paste content from `google-apps-script.js`

4. Save the project

### Step 2: Deploy Web App

1. Click **Deploy > New deployment**

2. Select **Web app** type

3. Configure:
   - Execute as: **Me**
   - Who has access: **Anyone**

4. Click **Deploy** and authorize

5. **Copy the Web App URL**

### Step 3: Configure Dashboard

1. Open `hotel-dashboard-google-sheets.html` in text editor

2. Find line:
   ```javascript
   API_URL: 'YOUR_WEB_APP_URL_HERE',
   ```

3. Replace with your Web App URL

4. Save and open in browser

---

## 🗂️ Google Sheets Structure

The system automatically creates these sheets:

| Sheet Name | Purpose |
|-----------|---------|
| Reservations | Hotel bookings |
| Clients | Customer database |
| Chambres | Room inventory |
| Check-ins | Check-in/out logs |
| Housekeeping | Cleaning tasks |
| Maintenance | Maintenance tickets |
| Restaurant | Restaurant bookings |
| Spa | Spa appointments |
| Personnel | Staff management |
| Finance | Financial transactions |
| Activities | Activity log |

---

## 🔧 How It Works

### Data Flow

```
Dashboard (HTML) 
    ↕
Google Apps Script (Web App)
    ↕
Google Sheets (Database)
```

### Caching

- 30-second cache for better performance
- Automatic cache invalidation on updates
- localStorage fallback if offline

---

## 🐛 Troubleshooting

### "API not configured"

**Solution**: Make sure you've replaced `YOUR_WEB_APP_URL_HERE` with actual URL

### "403 Forbidden"

**Solution**: Set "Who has access" to "Anyone" when deploying

### Data not saving

**Solution**: Check Console (F12) for errors and verify Apps Script deployment

---

## 🚀 Deployment Options

### Option 1: Local Use
- Simply open HTML file in browser
- Works completely offline after first load

### Option 2: Web Hosting
- Upload to GitHub Pages
- Or use Netlify/Vercel
- Access from any device via URL

---

## 💡 Best Practices

1. **Backup**: Google Sheets auto-saves, but export regularly
2. **Security**: Use "Anyone with Google account" for better security
3. **Performance**: Adjust CACHE_DURATION based on your needs
4. **Sharing**: Share Google Sheet with team for collaboration

---

## 📊 API Endpoints

The Google Apps Script provides these endpoints:

- `?action=health` - Check API status
- `?action=read&sheet=NAME` - Read sheet data
- `?action=write&sheet=NAME` - Write new record
- `?action=update&sheet=NAME` - Update existing record
- `?action=delete&sheet=NAME` - Delete record
- `?action=init` - Initialize all sheets

---

## 🔐 Security Notes

- Web App URL is public by default
- Change to "Anyone with Google account" for auth
- Or "Anyone within organization" for enterprise
- Never commit Web App URL to public repos

---

## 🌟 Advanced Features

### Custom Queries
You can extend the Apps Script to add:
- Complex filters
- Aggregations
- Custom reports

### Webhooks
Add notifications for:
- New reservations
- Check-ins/outs
- Urgent maintenance

---

## 📱 Mobile Support

The dashboard is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

---

## 🆘 Support

For issues:
1. Check Console (F12) for errors
2. Verify all setup steps
3. Review Apps Script deployment
4. Check Google Sheet permissions

---

## 📄 License

Free to use and modify for your hotel management needs.

---

**Happy Hotel Management! 🏨✨**
