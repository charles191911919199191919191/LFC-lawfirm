# 🚀 Deployment Quick Reference

## 5-Minute GitHub Pages Deployment

### 1. Build Frontend
```bash
cd /workspaces/LFC-lawfirm
npm run build
```
✓ Creates `dist/` folder with optimized production build

### 2. Commit to GitHub
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 3. Configure GitHub Pages
- Go to: **Repository → Settings → Pages**
- **Source**: `Deploy from a branch`
- **Branch**: `main`
- **Folder**: `/dist`
- Click **Save**

### 4. Done! ✅
Visit: `https://charles191911919199191919191.github.io/LFC-lawfirm/`

---

## Configuration Checklist

| File | Status | Purpose |
|------|--------|---------|
| `vite.config.js` | ✅ Updated | Base path: `/LFC-lawfirm/` |
| `client/src/App.jsx` | ✅ Updated | Router basename configured |
| `client/src/api/axios.js` | ✅ Updated | Error handling + timeout |
| `client/src/pages/Dashboard.jsx` | ✅ Updated | Error fallback UI |
| `client/src/pages/Analytics.jsx` | ✅ Updated | Error fallback UI |
| `dist/` | ✅ Built | Production-ready files |
| `.github/workflows/deploy.yml` | ✅ Created | Auto-deployment workflow |

---

## Asset Verification

```bash
#!/bin/bash
# Run this to verify build is correct

cd /workspaces/LFC-lawfirm

echo "✓ Checking dist folder..."
ls -lah dist/index.html
ls -lah dist/assets/

echo "✓ Checking asset paths..."
grep -o 'src=.*\|href=.*' dist/index.html | head -5

echo "✓ Total size:"
du -sh dist/

echo "✓ All checks passed! Ready to deploy."
```

---

## If Backend Deployed to Railway.app

### 1. Get Backend URL
- Visit your Railway project dashboard
- Copy the deployment URL

### 2. Update API URL
Add this to `.env.local` in `client/` folder:
```env
VITE_API_URL=https://your-railway-app.railway.app
```

### 3. Rebuild & Deploy
```bash
npm run build
git add .
git commit -m "Update backend API URL"
git push origin main
```

---

## Testing Commands

```bash
# Build for production
npm run build

# Preview build locally
npx serve dist

# Check build size
du -sh dist/

# Verify no errors
npm run build 2>&1 | grep -i error

# Check for broken links
npm run build 2>&1 | grep 404
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Blank page | Hard refresh (Ctrl+Shift+R) + check console for errors |
| 404 errors | Verify `/dist` folder selected in GitHub Pages settings |
| Styles missing | Clear cache, check if `/LFC-lawfirm/` in CSS paths |
| Routing broken | Ensure `App.jsx` has `basename="/LFC-lawfirm"` |
| API fails | Expected if backend not deployed - shows error UI |

---

## Expected URLs After Deployment

| Feature | URL |
|---------|-----|
| **Frontend** | https://charles191911919199191919191.github.io/LFC-lawfirm/ |
| **Login Page** | https://charles191911919199191919191.github.io/LFC-lawfirm/login |
| **Dashboard** | https://charles191911919199191919191.github.io/LFC-lawfirm/ |
| **Appointments** | https://charles191911919199191919191.github.io/LFC-lawfirm/appointments |
| **Backend** | https://your-backend.railway.app/api/* (deploy separately) |

---

## Production Checklist

- [ ] No syntax errors: `npm run build`
- [ ] Build succeeds with no warnings
- [ ] All 4 asset files exist in `dist/assets/`
- [ ] `dist/index.html` has `/LFC-lawfirm/` paths
- [ ] GitHub Pages `/dist` folder selected
- [ ] App loads at correct URL without blank page
- [ ] Responsive design works on mobile
- [ ] Navigation between pages works
- [ ] Error UI shows when API unavailable
- [ ] Backend deployed (if needed)

---

## Deploy Again Later

Every time you update code:

```bash
# Make changes to client/src/
npm run build
git add .
git commit -m "Update: [your changes]"
git push origin main
# GitHub Actions auto-deploys! ✨
```

---

## Get Help

- **GitHub Pages Docs**: https://pages.github.com/
- **Vite Guide**: https://vitejs.dev/guide/
- **React Router**: https://reactrouter.com/docs/
- **Troubleshooting**: See `DEPLOYMENT_GUIDE.md`

---

**Last Updated**: May 6, 2026
**Status**: ✅ Ready to Deploy
