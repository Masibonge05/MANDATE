'use client';

import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, getStatusBadgeStyle, getRiskBadgeStyle } from '@/lib/formatters';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Search, Download } from 'lucide-react';
import { TransactionDetailModal } from './TransactionDetailModal';

interface SecurityLedgerGridProps {
  transactions: Transaction[];
  onRefresh?: () => void;
}

export const SecurityLedgerGrid: React.FC<SecurityLedgerGridProps> = ({ transactions, onRefresh }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [quickFilterText, setQuickFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [gridApi, setGridApi] = useState<any>(null);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  const exportToCsv = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `mandate-security-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
      });
    }
  };

  // Custom Cell Renderers for AG Grid
  const statusCellRenderer = (params: any) => {
    const status = params.value;
    const style = getStatusBadgeStyle(status);
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${style.bg} ${style.text}`}>
        {status === 'PAID' && <CheckCircle2 className="w-3 h-3 text-[#0E8A44]" />}
        {status === 'BLOCKED' && <ShieldAlert className="w-3 h-3 text-[#D92D20]" />}
        {status === 'REQUIRES_APPROVAL' && <Clock className="w-3 h-3 text-[#B46500]" />}
        {style.label}
      </span>
    );
  };

  const riskCellRenderer = (params: any) => {
    const aiReview = params.data?.aiReview;
    if (!aiReview) return <span className="text-gray-400">—</span>;

    const risk = aiReview.risk_level;
    const style = getRiskBadgeStyle(risk);
    const hasInjection = aiReview.prompt_injection_detected;

    return (
      <div className="flex items-center gap-1.5">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${style.bg} ${style.text}`}>
          {risk}
        </span>
        {hasInjection && (
          <span className="text-[10px] font-extrabold bg-[#D92D20] text-white px-1.5 py-0.5 rounded tracking-wide animate-pulse">
            INJECTION
          </span>
        )}
      </div>
    );
  };

  const policyDecisionRenderer = (params: any) => {
    const decision = params.value;
    if (decision === 'APPROVED_BY_POLICY') {
      return (
        <span className="text-[#0E8A44] font-medium text-xs flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Passed Rules
        </span>
      );
    }
    if (decision === 'REQUIRES_HUMAN_APPROVAL') {
      return (
        <span className="text-[#B46500] font-medium text-xs flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Review Triggered
        </span>
      );
    }
    return (
      <span className="text-[#D92D20] font-medium text-xs flex items-center gap-1">
        <ShieldAlert className="w-3.5 h-3.5" />
        Rules Failed
      </span>
    );
  };

  const amountCellRenderer = (params: any) => {
    const val = params.value;
    const curr = params.data?.currency || 'USD';
    return (
      <span className="font-semibold text-[#142B4A]">
        {formatCurrency(val, curr)}
      </span>
    );
  };

  // AG Grid Column Definitions
  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: 'Timestamp',
      field: 'createdAt',
      width: 150,
      sort: 'desc',
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'Tx ID',
      field: 'id',
      width: 120,
      cellRenderer: (params: any) => (
        <span className="font-mono text-xs text-[#0070E0] font-medium hover:underline cursor-pointer">
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'Product Item',
      field: 'product.title',
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2 truncate py-1">
          <span className="font-medium text-gray-900 truncate">{params.value}</span>
        </div>
      ),
    },
    {
      headerName: 'Merchant',
      field: 'product.merchant',
      width: 150,
      filter: true,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      width: 110,
      cellRenderer: amountCellRenderer,
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: 'Policy Engine',
      field: 'policyDecision',
      width: 140,
      cellRenderer: policyDecisionRenderer,
    },
    {
      headerName: 'AI Risk',
      field: 'aiReview.risk_level',
      width: 130,
      cellRenderer: riskCellRenderer,
    },
    {
      headerName: 'Final Status',
      field: 'status',
      width: 160,
      cellRenderer: statusCellRenderer,
      filter: true,
    },
    {
      headerName: 'PayPal Reference',
      field: 'paypalOrderId',
      width: 150,
      cellRenderer: (params: any) => {
        if (!params.value) return <span className="text-gray-400 text-xs">—</span>;
        return (
          <span className="font-mono text-[11px] text-[#003087] bg-[#F0F4F8] px-1.5 py-0.5 rounded">
            {params.value}
          </span>
        );
      },
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  // Filtered rows by status
  const rowData = useMemo(() => {
    if (statusFilter === 'ALL') return transactions;
    if (statusFilter === 'INJECTIONS') {
      return transactions.filter(t => t.aiReview?.prompt_injection_detected);
    }
    return transactions.filter(t => t.status === statusFilter);
  }, [transactions, statusFilter]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      ALL: transactions.length,
      APPROVED: transactions.filter(t => t.status === 'APPROVED').length,
      REQUIRES_APPROVAL: transactions.filter(t => t.status === 'REQUIRES_APPROVAL').length,
      BLOCKED: transactions.filter(t => t.status === 'BLOCKED').length,
      PAID: transactions.filter(t => t.status === 'PAID').length,
      INJECTIONS: transactions.filter(t => t.aiReview?.prompt_injection_detected).length,
    };
  }, [transactions]);

  const onRowClicked = (event: RowClickedEvent) => {
    setSelectedTx(event.data as Transaction);
  };

  const filterTabs = [
    { key: 'ALL', label: 'All Records', count: counts.ALL },
    { key: 'PAID', label: 'Paid (PayPal)', count: counts.PAID },
    { key: 'APPROVED', label: 'Approved', count: counts.APPROVED },
    { key: 'REQUIRES_APPROVAL', label: 'Needs Approval', count: counts.REQUIRES_APPROVAL },
    { key: 'BLOCKED', label: 'Blocked', count: counts.BLOCKED },
    { key: 'INJECTIONS', label: 'Adversarial Injections', count: counts.INJECTIONS, isAlert: true },
  ];

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#DCE5EF] shadow-subtle">
        {/* Quick Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            placeholder="Quick search across all audit records..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F5F8FC] border border-[#DCE5EF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0070E0] text-[#142B4A]"
          />
        </div>

        {/* Status Filter Buttons with live counts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                  isActive
                    ? tab.isAlert
                      ? 'bg-[#D92D20] text-white shadow-xs'
                      : 'bg-[#003087] text-white shadow-xs'
                    : tab.isAlert && tab.count > 0
                    ? 'bg-[#FEF3F2] text-[#D92D20] border border-[#F9A8A4] hover:bg-[#FEE4E2]'
                    : 'bg-[#F5F8FC] text-[#5E738B] hover:bg-[#EEF3F8] hover:text-[#142B4A]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.isAlert && tab.count > 0
                      ? 'bg-[#D92D20] text-white animate-pulse'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          {/* Export CSV Button */}
          <button
            onClick={exportToCsv}
            title="Export filtered security ledger records to CSV"
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#DCE5EF] text-[#142B4A] hover:bg-[#F5F8FC] hover:border-[#0070E0] transition flex items-center gap-1 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#0070E0]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* AG Grid Container */}
      <div className="bg-white rounded-xl border border-[#DCE5EF] shadow-subtle overflow-hidden">
        <div className="ag-theme-quartz w-full h-[580px]">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={12}
            paginationPageSizeSelector={[12, 25, 50]}
            quickFilterText={quickFilterText}
            onRowClicked={onRowClicked}
            onGridReady={onGridReady}
            rowSelection="single"
            animateRows={true}
          />
        </div>

        {/* Security Ledger Summary Footer */}
        <div className="px-4 py-2.5 bg-[#F8FAFD] border-t border-[#EEF3F8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>Showing <strong className="text-gray-900 font-bold">{rowData.length}</strong> of <strong className="text-gray-900 font-bold">{transactions.length}</strong> ledger records</span>
            <span>•</span>
            <span>Total Evaluated Value: <strong className="text-[#003087] font-bold">{formatCurrency(rowData.reduce((acc, t) => acc + (t.amount || 0), 0))}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#5E738B]">
            <span className="w-2 h-2 rounded-full bg-[#0E8A44]" />
            <span>AG Grid Community Edition • Client-Side Filter & Sort Active</span>
          </div>
        </div>
      </div>

      {/* Detailed Lifecycle Inspection Modal */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

