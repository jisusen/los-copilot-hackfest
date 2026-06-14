---
name: CRDE Rules Reference
description: Credit Risk Decision Engine rules and scoring reference
version: 1.0.0
author: Bank Maju Bersama
trigger: crde
---

# CRDE Rules Reference

## Score Ranges
- **800-1000**: LOW RISK — Auto-approve eligible
- **600-799**: MEDIUM RISK — Standard review
- **400-599**: HIGH RISK — Committee review required
- **0-399**: VERY HIGH RISK — Auto-reject

## Decision Matrix

| Score | DBR | SLIK Kol | AML | Decision |
|-------|-----|----------|-----|----------|
| ≥800 | <35% | 1 | Clear | APPROVED |
| 600-799 | 35-40% | 1-2 | Clear | COMMITTEE REVIEW |
| 400-599 | >40% | ≥2 | Flag | REJECTED |
| <400 | Any | Any | Flag | REJECTED |

## Common Rules Triggered

### R1: DBR Exceeds Limit
- **Condition**: DTI ratio > 40%
- **Impact**: -150 points
- **Mitigation**: Reduce loan amount or extend tenor

### R2: SLIK Collectability Warning
- **Condition**: Collectability rating ≥ 2
- **Impact**: -100 points per level
- **Mitigation**: Provide explanation of past delinquency

### R3: PEP Identification
- **Condition**: Applicant is Politically Exposed Person
- **Impact**: -200 points
- **Mitigation**: Enhanced due diligence required

### R4: Sanctions Match
- **Condition**: Name matches DTTOT/UN sanctions list
- **Impact**: Auto-reject
- **Mitigation**: None — mandatory rejection

### R5: Income Inconsistency
- **Condition**: Declared income differs significantly from employer records
- **Impact**: -75 points
- **Mitigation**: Provide supporting documentation

### R6: Fraud Signals
- **Condition**: Multiple fraud indicators detected
- **Impact**: -150 points
- **Mitigation**: Manual review by fraud team

## Scoring Formula
```
Final Score = Base Score + Σ(Rule Penalties) + Σ(Rule Bonuses)

Base Score = 800 (for new applicants)
```

## Bonus Points
- Long employment tenure (>5 years): +50
- Clean SLIK history (24 months): +100
- Low DBR (<25%): +50
- Existing customer with good history: +75
