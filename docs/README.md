# Sage Green Clinical Management System (CMS) — Documentation Index

Welcome to the technical documentation repository for the **Sage Green Clinical Management System (CMS)**.

This folder contains the official audit reports, architectural evaluation, bug documentation, and strategic roadmap prepared for the **ProEduvate CMS Certification Process**.

---

## Documentation Directory

| Document | Description |
|---|---|
| 📋 [**BUGS_AND_ISSUES.md**](./BUGS_AND_ISSUES.md) | Exhaustive, technical bug and vulnerability audit report covering HIPAA privacy gaps, backend schema issues, database concurrency limitations, and frontend routing omissions. |
| 🚀 [**IMPROVEMENTS_AND_RECOMMENDATIONS.md**](./IMPROVEMENTS_AND_RECOMMENDATIONS.md) | Strategic, prioritized enhancement roadmap spanning 6 core pillars: AI & HIPAA Fortification, Database Scalability, UX Modernization, RBAC Auth, Pharmacy Intelligence, and CI/CD DevSecOps. |

---

## Quick Reference: Key Audit Findings & Immediate Action Items

1. **HIPAA Context Leakage:** In `chat.py`, raw database queries must not be appended un-sanitized into LLM prompts.
2. **Re-Identification Implementation:** Complete the 3rd step of the HIPAA gateway architecture by mapping surrogate tokens back to original values before delivering to doctors.
3. **Register Orphaned Router:** Connect `backend/app/routers/ai_risk.py` into `backend/app/main.py`.
4. **Route Orphaned Pages:** Add routes and sidebar links for `PrintLabel.jsx` (Module 10) and `RetailSelling.jsx`.
5. **Dashboard KPIs:** Restore the 3rd and 4th KPI metric cards on the Executive Dashboard.
6. **Automated Testing:** Introduce a standard `pytest` suite for backend API contract verification.

---
*Maintained for ProEduvate CMS Certification & Governance.*
