'use client';

import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, getStatusBadgeStyle, getRiskBadgeStyle } from '@/lib/formatters';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Search } from 'lucide-react';
import { TransactionDetailModal } from './TransactionDetailModal';

interface SecurityLedgerGridProps {
  transactions: Transaction[];
  onRefresh?: () => void;
}

export const SecurityLedgerGrid: React.FC<SecurityLedgerGridProps> = ({ transactions, onRefresh }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [quickFilterText, setQuickFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
    return transactions.filter(t => t.status === statusFilter);
  }, [transactions, statusFilter]);

  const onRowClicked = (event: RowClickedEvent) => {
    setSelectedTx(event.data as Transaction);
  };

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

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'APPROVED', 'REQUIRES_APPROVAL', 'BLOCKED', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                statusFilter === st
                  ? 'bg-[#003087] text-white shadow-xs'
                  : 'bg-[#F5F8FC] text-[#5E738B] hover:bg-[#EEF3F8] hover:text-[#142B4A]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
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
            rowSelection="single"
            animateRows={true}
          />
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

