/*
# Add Loan Type and Non-Collateral Details to Applications

## Summary
Extends the applications table to support two distinct loan pathways:
- Collateral Loan: secured by property, FD, or insurance
- Non-Collateral Loan: unsecured, assessed on academic profile and co-applicant financials

## Changes to applications table
- loan_type (text): 'collateral' | 'non_collateral', default 'collateral'
- non_collateral_details (jsonb): stores university profile, admission details,
  scholarship info, estimated salary, and computed eligibility assessment data
  specific to the non-collateral loan pathway
*/

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS loan_type text NOT NULL DEFAULT 'collateral'
    CHECK (loan_type IN ('collateral', 'non_collateral'));

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS non_collateral_details jsonb;
