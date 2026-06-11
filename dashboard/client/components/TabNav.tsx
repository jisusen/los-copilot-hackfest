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
    <div className="tab-nav" style={{
      display: 'flex',
      overflowX: 'auto',
      borderRadius: '8px 8px 0 0',
      borderTop: '1px solid #d1d5db',
      borderLeft: '1px solid #d1d5db',
      borderRight: '1px solid #d1d5db',
      borderBottom: '1px solid #d1d5db',
    }}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            data-testid={tab.testId}
            onClick={() => navigate(`/loans/${loanId}?tab=${tab.key}`)}
            style={{
              flex: 1,
              height: 38,
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: isActive ? 600 : 500,
              border: 'none',
              borderBottom: isActive ? '2px solid #8B1A1A' : '2px solid transparent',
              color: isActive ? '#8B1A1A' : '#6B7280',
              background: '#ffffff',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'Open Sans, system-ui, sans-serif',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.color = '#8B1A1A';
                e.currentTarget.style.borderBottomColor = '#d8d8d8';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.color = '#6B7280';
                e.currentTarget.style.borderBottomColor = 'transparent';
              }
            }}
          >
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
