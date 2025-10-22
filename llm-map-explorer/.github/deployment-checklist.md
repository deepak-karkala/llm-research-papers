# Deployment Checklist

This checklist should be completed before deploying to production.

---

## 📋 Pre-Deployment Checks (Before Merging to Main)

### Code Quality
- [ ] All unit tests passing locally: `npm run test:unit`
- [ ] All E2E tests passing locally: `npm run test:e2e`
- [ ] No linting errors: `npm run lint`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Build succeeds locally: `npm run build`
- [ ] No console errors in dev tools

### Features & Functionality
- [ ] All features manually tested
- [ ] No broken links
- [ ] Forms submit correctly
- [ ] Search functionality working
- [ ] Tours playable and complete
- [ ] Map interactive on desktop and mobile
- [ ] Accessibility features working (keyboard nav, screen reader)

### Code Review
- [ ] PR reviewed and approved by at least one reviewer
- [ ] Comments addressed and resolved
- [ ] No secrets committed to repository
- [ ] No sensitive information in code or comments

### Performance
- [ ] Lighthouse score checked: Performance ≥85
- [ ] Bundle size acceptable (<500KB gzipped)
- [ ] No memory leaks detected
- [ ] Page load time acceptable (<3s TTI)

### Documentation
- [ ] README.md updated if needed
- [ ] Code comments added for complex logic
- [ ] JSDoc comments on new functions/components
- [ ] CHANGELOG.md updated with changes

---

## 🚀 During Deployment

### Pre-Merge Verification
- [ ] PR checks all passing (CI/CD, Lighthouse, etc.)
- [ ] Vercel preview deployment created and working
- [ ] Preview URL tested in multiple browsers
- [ ] Mobile responsive behavior verified in preview
- [ ] All features work in preview environment

### Branch & Merge
- [ ] Merge to `main` branch (not force merge)
- [ ] Delete feature branch after merge
- [ ] Verify merge completed successfully

### Production Deployment
- [ ] Wait for Vercel to build production deployment
- [ ] Verify build log for any errors or warnings
- [ ] Build completed in reasonable time (<5 minutes)
- [ ] Deployment marked as "Production" in Vercel

---

## ✅ Post-Deployment Verification (First 30 Minutes)

### Site Accessibility
- [ ] Production site loads: https://terra-incognita-linguae.vercel.app (or custom domain)
- [ ] HTTPS enforced (no HTTP warnings)
- [ ] Page loads within expected time

### Feature Verification
- [ ] Home page displays correctly
- [ ] Map renders and is interactive
- [ ] Search bar works and returns results
- [ ] Clicking landmarks shows info panel
- [ ] Tours load and navigate properly
- [ ] All buttons and links functional

### Error Checking
- [ ] No 404 errors in browser console
- [ ] No JavaScript errors in browser console
- [ ] No network errors or failed requests
- [ ] No CSS styling issues

### Analytics & Monitoring
- [ ] Analytics dashboard shows traffic
- [ ] Error monitoring shows no spike
- [ ] Performance metrics acceptable
- [ ] No critical errors reported

### Mobile Testing
- [ ] Site responsive on mobile (width: 375px)
- [ ] Touch interactions work smoothly
- [ ] Info panel shows as bottom sheet on mobile
- [ ] No horizontal scroll on mobile

---

## 🔍 Ongoing Monitoring (Next 24 Hours)

### Error Rate Monitoring
- [ ] Check Vercel error logs periodically
- [ ] No spike in 5xx errors
- [ ] No spike in 4xx errors
- [ ] All reported errors investigated

### Performance Monitoring
- [ ] Lighthouse scores remain ≥85
- [ ] Core Web Vitals acceptable
- [ ] Page load times consistent
- [ ] No memory issues reported

### User Feedback
- [ ] Monitor feedback channels (GitHub issues, Discord, etc.)
- [ ] Respond to any reported bugs quickly
- [ ] Track any performance complaints

---

## 🆘 Rollback Procedure (If Issues Found)

If critical issues discovered after deployment:

1. **Assess the Issue**
   - [ ] Determine severity (critical, high, medium, low)
   - [ ] Check if hotfix possible vs. rollback needed
   - [ ] Notify team immediately

2. **Rollback Steps**
   - [ ] Go to Vercel Dashboard → Deployments
   - [ ] Find last stable deployment before current one
   - [ ] Click "Promote to Production"
   - [ ] Verify rollback successful
   - [ ] Test all features in rollback version
   - [ ] Verify error rate returns to normal

3. **Post-Rollback**
   - [ ] File GitHub issue documenting the problem
   - [ ] Create hotfix branch to fix the issue
   - [ ] Test fix thoroughly locally
   - [ ] Create PR and go through normal process
   - [ ] Deploy hotfix separately

---

## 📊 Deployment Sign-Off

### Deployment Details
- **Date:** _______________
- **Deployed By:** _______________
- **Vercel Deployment ID:** _______________
- **Git Commit Hash:** _______________
- **Branch:** main

### Sign-Off
- [ ] Lead Developer Sign-Off: _______________
- [ ] QA Sign-Off (if applicable): _______________
- [ ] Product Owner Sign-Off (if applicable): _______________

### Notes
```
[Add any notes about this deployment here]


```

---

## 📞 Quick Reference

### Important Links
- **Production URL:** https://terra-incognita-linguae.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repository:** https://github.com/deepak-karkala/llm-research-papers
- **Error Tracking:** [Configure and add link]
- **Analytics Dashboard:** [Configure and add link]

### Useful Commands
```bash
# Build production locally
npm run build

# Test production build locally
npm run start

# Check TypeScript errors
npm run type-check

# Run all tests
npm run test

# View Vercel logs
vercel logs

# Deploy manually (if needed)
vercel --prod
```

### Contact
- **On-call Developer:** [Add contact info]
- **Team Slack Channel:** [Add channel]
- **Emergency Contact:** [Add contact info]

---

**Last Updated:** October 2025
**Version:** 1.0
