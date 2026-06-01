import React from 'react';
import { useNavigate } from 'react-router-dom';

export type TabDef = {
  key: string;
  label: string;
  testId: string;
};

export const TABS: TabDef[] = [
  { key: 'data-summary',       label: 'Data Summary',       testId: 'tab-data-summary' },
  { key: 'permohonan-kredit',  label: 'Loan Application',   testId: 'tab-permohonan-kredit' },
  { key: 'profil-debitur',     label: 'Debtor Profile',     testId: 'tab-profil-debitur' },
  { key: 'data-keuangan',      label: 'Financials',         testId: 'tab-data-keuangan' },
  { key: 'slik-ojk',           label: 'SLIK OJK',           testId: 'tab-slik-ojk' },
  { key: 'aml-fraud',          label: 'AML & Fraud',        testId: 'tab-aml-fraud' },
  { key: 'hasil-crde',         label: 'CRDE Result',        testId: 'tab-hasil-crde' },
  { key: 'agunan',             label: 'Collateral',         testId: 'tab-agunan' },
  { key: 'audit-log',          label: 'Audit Log',          testId: 'tab-audit-log' },
  { key: 'notes',              label: 'Notes & Memo',       testId: 'tab-notes' },
];

export function TabNav({ loanId, activeTab }: { loanId: string; activeTab: string }) {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid #1a1a1a',
      gap: 0,
      overflowX: 'auto',
    }}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            data-testid={tab.testId}
            onClick={() => navigate(`/loans/${loanId}?tab=${tab.key}`)}
            style={{
              height: 36,
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 12,
              fontWeight: 500,
              border: isActive ? '1px solid #1a1a1a' : '1px solid transparent',
              borderBottom: isActive ? '1px solid #ffffff' : '1px solid transparent',
              color: isActive ? '#1a1a1a' : '#4a4a4a',
              background: isActive ? '#ffffff' : 'transparent',
              cursor: 'pointer',
              marginBottom: -1,
              whiteSpace: 'nowrap',
              fontFamily: 'Inter, system-ui, sans-serif',
              outline: 'none',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
