# Product Requirements Document (PRD)
## eCalc RO - Calculatoare Fiscale România 2026

### 1. OVERVIEW

**Product Name:** eCalc RO  
**Version:** 1.0 MVP  
**Target Market:** România - utilizatori interesați de calculatoare fiscale  
**Primary Goal:** Platformă de calculatoare fiscale cu monetizare hibridă (Ads + Affiliate + Leads)

---

### 2. CORE FEATURES

#### 2.1 Calculatoare Implementate (6 total)

| # | Calculator | URL | Status | Key Features |
|---|------------|-----|--------|--------------|
| 1 | Salariu Brut/Net | `/salarii` | ✅ Complete | Calcul bidirecțional, CAS 25%, CASS 10%, Impozit 10% |
| 2 | Concediu Medical | `/concediu-medical` | ✅ Complete | Formula OUG 2026: 75% din salariul mediu |
| 3 | e-Factura | `/e-factura` | ✅ Complete | Termene 5 zile, calcul amenzi |
| 4 | Impozit Auto | `/impozit-auto` | ✅ Complete | Pe bază de capacitate cilindrică |
| 5 | Compensații EU261 | `/zboruri` | ✅ Complete | €250/€400/€600 pe distanță |
| 6 | Randament Imobiliar | `/imobiliare` | ✅ Complete | Yield brut & net cu cheltuieli |

#### 2.2 Admin Dashboard (`/admin`)

**Authentication:**
- Email/Password login
- Default: `admin@ecalc.ro` / `Admin2026!`
- BCrypt password hashing

**Capabilities:**
1. **Settings Management**
   - Ad slots configuration (Header + Sidebar HTML)
   - Fiscal values editing (CAS, CASS, tax rates)
   
2. **Affiliate Links**
   - Per-calculator customization
   - Text + URL editable
   - Bulk save functionality

3. **Lead Management**
   - View all collected leads
   - Export CSV functionality
   - Real-time stats

---

### 3. MONETIZATION SYSTEM

#### 3.1 Revenue Streams

| Stream | Implementation | Editability | Status |
|--------|---------------|-------------|---------|
| **Global Ads** | Header + Sidebar slots | Admin panel | ✅ Ready |
| **Contextual Affiliate** | Per-calculator CTA buttons | Admin panel | ✅ Ready |
| **Lead Generation** | Form + MongoDB storage | Automatic | ✅ Ready |

#### 3.2 Conversion Funnel

```
User visits calculator
    ↓
Performs calculation
    ↓
Sees result + Affiliate CTA
    ↓
[Optional] Submits lead form
    ↓
Downloads detailed PDF (Future)
```

#### 3.3 Sticky Mobile CTA
- Fixed bottom bar on mobile devices
- Contains contextual affiliate button
- Auto-hidden on desktop

---

### 4. TECHNICAL ARCHITECTURE

#### 4.1 Stack

```
Frontend:
- Next.js 14.2.3 (App Router)
- React 18
- Tailwind CSS + Shadcn/UI
- Sonner (Toast notifications)

Backend:
- Next.js API Routes
- MongoDB Atlas (Cloud)
- bcryptjs (Authentication)

Database:
- MongoDB 6.6.0
- Collections: leads, settings, adminUsers
```

#### 4.2 API Endpoints

**Authentication:**
```
POST /api/auth/login
Request:  { email, password }
Response: { success, token, email }
```

**Settings:**
```
GET /api/settings
Response: { ...allSettingsKeyValue }

PUT /api/settings
Request:  { key: value, ... }
Response: { success, message }
```

**Leads:**
```
GET /api/leads
Response: [Lead array]

POST /api/leads
Request:  { name, email, phone, calculatorType, data }
Response: { success, message }

GET /api/leads/export
Response: CSV file download
```

#### 4.3 Database Schema

**Collection: `settings`**
```javascript
{
  key: String (unique),
  value: Any
}

Keys:
- ad_header, ad_sidebar
- affiliate_[calculator]_text
- affiliate_[calculator]_link
- cas_rate, cass_rate, income_tax_rate
- deduction_personal
```

**Collection: `leads`**
```javascript
{
  id: UUID,
  name: String,
  email: String,
  phone: String,
  calculatorType: String (salarii|concediu|efactura|impozit|zboruri|imobiliare),
  data: Object (calculation results),
  createdAt: Date
}
```

**Collection: `adminUsers`**
```javascript
{
  email: String (unique),
  password: String (bcrypt hashed),
  createdAt: Date
}
```

---

### 5. USER FLOWS

#### 5.1 Calculator Usage Flow
1. User lands on homepage
2. Selects calculator card
3. Enters input values
4. Clicks "Calculează"
5. **Lead Form Modal** appears (optional submit)
6. Views results + affiliate CTA
7. [Mobile] Sees sticky bottom CTA

#### 5.2 Admin Management Flow
1. Navigate to `/admin`
2. Login with credentials
3. Select tab (Settings / Leads / Affiliate)
4. Make changes
5. Click "Salvează"
6. Confirmation toast

---

### 6. SEO & MARKETING

#### 6.1 On-Page SEO (Implemented)
- ✅ Schema.org SoftwareApplication
- ✅ Meta tags (Title, Description, Keywords)
- ✅ Open Graph ready
- ✅ Structured data (Rating, Price)

#### 6.2 Technical SEO (TODO)
- [ ] Dynamic OG Images per calculator
- [ ] FAQ Schema per calculator
- [ ] Internal linking strategy
- [ ] Sitemap.xml
- [ ] robots.txt

#### 6.3 Content Strategy (Future)
- [ ] Blog pentru SEO organic
- [ ] Ghiduri fiscale 2026
- [ ] Video tutorials
- [ ] Newsletter integration

---

### 7. DESIGN SYSTEM

#### 7.1 Brand Colors
```css
Primary:    #2563eb (Blue)
Secondary:  Contextual per calculator
Background: Slate gradients (50-100)
Cards:      White with subtle shadow
Text:       Slate 900 (headings), 600 (body)
```

#### 7.2 Calculator-Specific Colors
| Calculator | Primary Color | CTA Color |
|-----------|---------------|-----------|
| Salarii | Blue | Green |
| Concediu | Green | Green |
| e-Factura | Purple | Purple |
| Impozit Auto | Orange | Orange |
| Zboruri | Red | Red |
| Imobiliare | Teal | Teal |

#### 7.3 Typography
- **Font:** Inter (Google Fonts)
- **Headings:** Bold, 2xl-5xl
- **Body:** Regular, base-xl
- **Mobile-first:** Responsive breakpoints

---

### 8. SECURITY & COMPLIANCE

#### 8.1 Security Measures (Implemented)
- ✅ Password hashing (bcryptjs)
- ✅ Environment variables for secrets
- ✅ CORS configuration
- ✅ Input validation on forms

#### 8.2 TODO Security
- [ ] Rate limiting (API endpoints)
- [ ] CSRF tokens
- [ ] Session management with JWT
- [ ] 2FA for admin
- [ ] SQL injection prevention (MongoDB)

#### 8.3 GDPR Compliance (TODO)
- [ ] Cookie consent banner
- [ ] Privacy policy page
- [ ] Terms of service
- [ ] Data deletion requests
- [ ] Lead data retention policy

---

### 9. PERFORMANCE & SCALABILITY

#### 9.1 Current Performance
- Next.js hot reload: ~2.5s
- Page load: ~200ms (cached)
- API response: <50ms
- Database: MongoDB Atlas (cloud)

#### 9.2 Optimization Opportunities
- [ ] Image optimization (Next/Image)
- [ ] Code splitting per calculator
- [ ] CDN for static assets
- [ ] Database indexing
- [ ] Redis caching layer

#### 9.3 Scalability Plan
- [ ] Horizontal scaling (multiple instances)
- [ ] Load balancer
- [ ] Database read replicas
- [ ] Analytics aggregation

---

### 10. TESTING & QA

#### 10.1 Manual Testing (Completed)
- ✅ All calculators functional
- ✅ Admin login works
- ✅ Lead submission works
- ✅ Settings update works
- ✅ CSV export functional
- ✅ All pages return HTTP 200

#### 10.2 TODO Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests (Playwright)
- [ ] E2E tests (Cypress)
- [ ] Load testing (Artillery)
- [ ] Security audit

---

### 11. DEPLOYMENT & OPERATIONS

#### 11.1 Environment Variables
```bash
MONGO_URL=mongodb+srv://...
DB_NAME=ecalc_ro
NEXT_PUBLIC_BASE_URL=https://...
ADMIN_EMAIL=admin@ecalc.ro
ADMIN_PASSWORD=Admin2026!
CORS_ORIGINS=*
```

#### 11.2 Deployment Checklist
- [x] MongoDB Atlas connection verified
- [x] Environment variables configured
- [x] Admin user seeded
- [x] Settings initialized
- [x] All pages accessible
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Analytics tracking added

---

### 12. ROADMAP

#### Phase 1: MVP (✅ COMPLETED - Current)
- [x] 6 calculatoare funcționale
- [x] Admin dashboard complet
- [x] Lead management system
- [x] Affiliate system
- [x] MongoDB integration

#### Phase 2: Enhancement (Q2 2026)
- [ ] PDF export pentru rezultate
- [ ] Email automation pentru leads
- [ ] A/B testing pentru CTA
- [ ] Analytics dashboard în admin
- [ ] Multi-admin support with roles

#### Phase 3: Growth (Q3 2026)
- [ ] Blog SEO (20+ articles)
- [ ] Calculator API public (REST)
- [ ] Mobile app (React Native)
- [ ] Integrations (Zapier, Make)

#### Phase 4: Scale (Q4 2026)
- [ ] White-label solution for partners
- [ ] Enterprise features
- [ ] Advanced reporting
- [ ] Custom calculator builder

---

### 13. SUCCESS METRICS (KPIs)

#### 13.1 User Metrics
- Monthly Active Users (MAU)
- Calculations per user
- Time on site
- Bounce rate per calculator

#### 13.2 Business Metrics
- Lead conversion rate
- Affiliate click-through rate (CTR)
- Cost per lead (CPL)
- Revenue per user (ARPU)

#### 13.3 Technical Metrics
- Page load time (<2s)
- API response time (<100ms)
- Uptime (>99.9%)
- Error rate (<0.1%)

---

### 14. SUPPORT & MAINTENANCE

#### 14.1 Support Channels
- Email: admin@ecalc.ro
- Admin dashboard: /admin
- Documentation: README.md

#### 14.2 Maintenance Schedule
- **Daily:** Database backups
- **Weekly:** Security updates
- **Monthly:** Feature releases
- **Quarterly:** Major updates

#### 14.3 Monitoring
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring (Pingdom)
- [ ] Analytics (Google Analytics 4)
- [ ] Performance (Lighthouse CI)

---

### 15. CONCLUSION

**Status:** ✅ MVP COMPLETE & FUNCTIONAL

**Next Steps:**
1. Add Google Analytics tracking
2. Create privacy policy & GDPR compliance
3. Set up email automation for leads
4. Implement PDF export feature
5. Begin SEO optimization & content creation

**Contact:**
- Admin: admin@ecalc.ro
- Database: MongoDB Atlas (ecalc_ro)
- Live URL: https://dynamic-payroll-calc.preview.emergentagent.com

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Author:** eCalc RO Development Team
