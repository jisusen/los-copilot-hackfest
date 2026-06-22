---
name: KTA Credit Policy Rules
description: User-defined business rules for KTA (Kredit Tanpa Agunan) credit decisions
version: 1.0.0
author: Bank Maju Bersama
trigger: memo
product: KTA
source: manual
active: true
---

# KTA Credit Policy Rules — Bank Maju Bersama

> **User-defined business rules** for KTA product credit decisions.
> Agent uses these rules as guidelines when generating memos and recommendations.

---

## 1. Product Overview

| Attribute | KTA (Kredit Tanpa Agunan) |
|-----------|---------------------------|
| Type | Unsecured personal loan |
| Minimum Amount | Rp 5,000,000 |
| Maximum Amount | Rp 200,000,000 |
| Tenor Range | 12 - 60 months |
| Interest Rate | 10.5% - 14.0% p.a. |
| Processing Fee | 0.5% - 1.5% of loan amount |
| Insurance | Optional (life credit insurance recommended) |

---

## 2. Eligibility Criteria

### 2.1 Applicant Requirements

| Criterion | Requirement | Notes |
|-----------|-------------|-------|
| **Age** | 21 - 55 years | At application date; must not exceed 60 at tenor maturity |
| **Citizenship** | WNI (Indonesian citizen) | KTP required |
| **Marital Status** | Any | Married applicants: spouse as joint applicant or written consent |
| **Education** | SMA/Sederajat minimum | Higher education preferred |
| **Employment** | Minimum 1 year current employment | 2+ years preferred |
| **Minimum Income** | Rp 5,000,000 gross/month | Verified via payslip + bank statement |

### 2.2 Employment Types

| Type | Eligible | Risk Level | Additional Requirements |
|------|----------|------------|------------------------|
| Civil Servant (PNS/ASN) | Yes | Low | SK Pangkat + SKP |
| Private Employee | Yes | Medium | Payslip + employment letter |
| SOE Employee | Yes | Low | SK Pengangkatan |
| Self-Employed | Yes | High | Business license + 2-year financial statements |
| Freelance/Contract | Conditional | High | 12-month bank statements + tax return |
| Entrepreneur | Conditional | High | Business registration + 2-year audited statements |

---

## 3. Credit Assessment Rules

### 3.1 Debt Burden Ratio (DBR)

| DBR Range | Action | Notes |
|-----------|--------|-------|
| **≤ 35%** | Auto-approve eligible | Ideal range |
| **35% - 40%** | Standard review | Acceptable with justification |
| **40% - 45%** | Committee review required | Must provide mitigation factors |
| **> 45%** | Auto-reject | Insufficient repayment capacity |

**DBR Formula:**
```
DBR = (Existing Obligations + New Installment) / Net Monthly Income × 100%
```

**Calculation Notes:**
- Use **net income** for DBR calculation
- Include all existing obligations from SLIK + verified external debts
- New installment = proposed KTA monthly payment

### 3.2 SLIK Collectability Rules

| Current Kol | History 24 months | Action |
|-------------|-------------------|--------|
| **1 (Current)** | Clean | Auto-approve eligible |
| **1 (Current)** | 1-2 late payments (< 30 days) | Standard review |
| **2 (Special Mention)** | Clean history | Committee review |
| **2 (Special Mention)** | Multiple late payments | Reject or committee with mitigation |
| **3 (Substandard)** | Any | Auto-reject |
| **4 (Doubtful)** | Any | Auto-reject |
| **5 (Loss)** | Any | Auto-reject |

**SLIK Assessment Rules:**
- Check **worst Kol in last 12 months** — if ≥3, reject
- Check **total existing facilities** — if >5, flag for review
- Check **total credit utilization** — if >80%, flag
- Check **recent inquiries** — if >3 in last 3 months, flag

### 3.3 Income Verification

| Verification Method | Weight | Notes |
|--------------------|--------|-------|
| Payslip (3 months) | High | Primary verification |
| Bank statement (6 months) | High | Cross-reference with payslip |
| Tax return (SPT) | Medium | For self-employed/entrepreneur |
| Employment letter | Low | Supporting document only |

**Income Consistency Rules:**
- Bank deposits should correlate with declared income (±20% tolerance)
- Large unexplained deposits (> 30% of monthly income) require explanation
- Irregular income patterns require additional documentation

---

## 4. Risk Assessment Rules

### 4.1 Risk Scoring Matrix

| Factor | Weight | Low Risk | Medium Risk | High Risk |
|--------|--------|----------|-------------|-----------|
| **DBR** | 30% | ≤ 35% | 35% - 45% | > 45% |
| **SLIK Kol** | 25% | 1 | 2 | ≥ 3 |
| **Employment** | 15% | Civil Servant/SOE | Private (2+ yr) | Self-Employed/Contract |
| **Income** | 15% | > Rp 15M | Rp 8M - 15M | < Rp 8M |
| **AML** | 15% | Clear | PEP (with EDD) | DTTOT/Fraud |

### 4.2 Decision Matrix

| Total Score | Risk Level | Decision |
|-------------|------------|----------|
| 80 - 100 | LOW | Auto-approve |
| 60 - 79 | MEDIUM | Standard review |
| 40 - 59 | HIGH | Committee review |
| 0 - 39 | VERY HIGH | Auto-reject |

---

## 5. AML & Fraud Rules

### 5.1 Mandatory Checks

| Check | Source | Action |
|-------|--------|--------|
| **PEP Status** | PPATK Database | If PEP → EDD required before approval |
| **DTTOT Match** | DTTOT List | If match → Auto-reject |
| **UN Sanctions** | UN Sanctions List | If match → Auto-reject |
| **Income Consistency** | Bank Statement | If inconsistent → Flag for review |
| **Address Verification** | KTP vs Utility Bill | If mismatch → Additional verification |

### 5.2 Fraud Signals

| Signal | Action |
|--------|--------|
| Income discrepancy > 30% | Require additional documentation |
| Multiple recent applications (> 3 in 3 months) | Flag for fraud review |
| Employer verification failed | Reject application |
| Address not verifiable | Additional verification required |
| Phone number not matching records | Flag for review |

---

## 6. Loan Purpose Rules

### 6.1 Eligible Purposes

| Purpose | Risk Level | Additional Requirements |
|---------|------------|------------------------|
| Home renovation | Low | Invoice/quote from contractor |
| Education | Low | Enrollment proof |
| Medical emergency | Low | Hospital estimate |
| Debt consolidation | Medium | Existing loan statements |
| Vehicle purchase | Medium | Vehicle quote |
| Working capital | High | Business plan + financials |
| Wedding | Medium | Vendor contracts |

### 6.2 Restricted Purposes

| Purpose | Action |
|---------|--------|
| Cryptocurrency/Speculative investment | Reject |
| Gambling | Reject |
| Illegal activities | Reject |
| Refinancing high-interest debt without clear benefit | Committee review |

---

## 7. Loan Amount Rules

### 7.1 Amount Limits by Income

| Monthly Gross Income | Maximum Loan Amount | Maximum Tenor |
|----------------------|---------------------|---------------|
| Rp 5M - 8M | Rp 50,000,000 | 24 months |
| Rp 8M - 15M | Rp 100,000,000 | 36 months |
| Rp 15M - 25M | Rp 150,000,000 | 48 months |
| > Rp 25M | Rp 200,000,000 | 60 months |

### 7.2 Amount Limits by Employment

| Employment Type | Maximum Multiplier | Notes |
|-----------------|-------------------|-------|
| Civil Servant | 15x monthly income | Stable employment premium |
| Private (2+ yr) | 12x monthly income | Standard |
| Private (< 2 yr) | 8x monthly income | Limited tenure |
| Self-Employed | 10x monthly income | Based on average monthly revenue |
| Contract/Freelance | 6x monthly income | Higher risk |

---

## 8. Documentation Requirements

### 8.1 Required Documents

| Document | Purpose | Validity |
|----------|---------|----------|
| KTP | Identity | Must be valid |
| NPWP | Tax ID | Required for loan > Rp 50M |
| Payslip (3 months) | Income verification | Recent |
| Bank statement (6 months) | Income verification | Recent |
| Employment letter | Employment verification | Within 3 months |

### 8.2 Additional Documents (if applicable)

| Situation | Required Document |
|-----------|-------------------|
| Married applicant | Spouse's KTP + marriage certificate |
| Self-employed | Business license + 2-year financial statements |
| Existing homeowner | Property tax (PBB) receipt |
| Multiple obligations | All existing loan statements |

---

## 9. Decision Rules Summary

### 9.1 Auto-Approve Conditions (ALL must be met)

- [ ] DBR ≤ 35%
- [ ] SLIK Kol = 1 (Current)
- [ ] SLIK worst 12 months = 1
- [ ] No AML flags (PEP, DTTOT, fraud)
- [ ] Employment ≥ 2 years
- [ ] Income verified
- [ ] Purpose eligible
- [ ] CRDE decision = APPROVED

### 9.2 Auto-Reject Conditions (ANY triggers reject)

- [ ] DBR > 45%
- [ ] SLIK Kol ≥ 3
- [ ] DTTOT match
- [ ] UN sanctions match
- [ ] Fraud signals confirmed
- [ ] CRDE score < 400

### 9.3 Committee Review Conditions (ANY triggers review)

- [ ] DBR 40% - 45%
- [ ] SLIK Kol = 2
- [ ] PEP identified
- [ ] Self-employed with < 2 years in business
- [ ] High-risk purpose
- [ ] CRDE score 400 - 599
- [ ] Multiple risk factors (≥ 2 medium risks)

---

## 10. Memo Writing Guidelines

### 10.1 Required Sections

1. **Executive Summary** — 2-3 sentences, key decision
2. **Applicant Profile** — personal data, employment, income
3. **Credit Analysis** — DBR calculation, SLIK assessment
4. **Risk Assessment** — AML screening, fraud check
5. **Recommendation** — decision with justification

### 10.2 Decision Format

| Decision | Format |
|----------|--------|
| Approve | `**Rekomendasi: SETUJU**` |
| Committee Review | `**Rekomendasi: RUJUK KOMITE KREDIT**` |
| Reject | `**Rekomendasi: TOLAK**` |

### 10.3 Key Metrics to Highlight

- **DBR** — always state percentage vs 40% limit
- **SLIK Kol** — current status + worst 12 months
- **Risk flags** — list each concern as bullet point
- **Mitigating factors** — if overriding CRDE, state reason

---

## 11. Override Rules

### 11.1 CRDE Override Conditions

Analyst may override CRDE decision **ONLY** if:
- CRDE says REJECTED but analyst identifies strong mitigating factors
- CRDE says APPROVED but analyst identifies significant risks not captured

### 11.2 Override Documentation Requirements

- State reason for override explicitly
- List mitigating factors
- Require supervisor approval for override of auto-reject
- Document in memo: *"Override CRDE karena [reason]"*

---

## 12. Special Cases

### 12.1 First-Time Borrower

- No SLIK history → check alternative income verification
- Require 12-month bank statements
- Consider lower loan amount limit (50% of standard)

### 12.2 Existing Customer

- Check historical payment behavior with BMS
- Good history (> 2 years on-time) → favorable consideration
- Past delinquency → apply standard rules strictly

### 12.3 Refinancing

- Existing BMS loan → must be in good standing (Kol 1)
- Other bank refinancing → check reason
- Cash-out refinancing → additional documentation required

---

## 13. Compliance Notes

- **OJK Regulation**: Must comply with POJK No. 11/POJK.03/2022 on Consumer Credit
- **PPATK**: Report suspicious transactions per PPATK regulations
- **Data Protection**: Handle personal data per UU PDP (Personal Data Protection Law)
- **Fair Lending**: No discrimination based on gender, religion, ethnicity

---

## 14. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-22 | Initial KTA credit policy rules |
