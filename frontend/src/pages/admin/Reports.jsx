import React, { useMemo, useState } from 'react';
import analyticsService from '../../utils/analyticsService';
import DashboardLayout, { GradientButton, PageHeader, SectionCard } from '../../components/dashboard/Layout';

const ReportTypes = [
  { value: 'orders', label: 'Orders' },
  { value: 'customers', label: 'Customers' },
  { value: 'payments', label: 'Payments' }
];

const ReportFormats = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' }
];

const dateRanges = [
  { label: 'Past 7 days', value: '7days' },
  { label: 'Past 30 days', value: '30days' },
  { label: 'Past 12 months', value: '12months' }
];

const isoDate = (date) => date.toISOString().slice(0, 10);

const Reports = () => {
  const [type, setType] = useState('orders');
  const [format, setFormat] = useState('csv');
  const [rangeLabel, setRangeLabel] = useState('Past 7 days');
  const [startDate, setStartDate] = useState(isoDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
  const [endDate, setEndDate] = useState(isoDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const selectedRangeText = useMemo(() => `${rangeLabel} (${startDate} → ${endDate})`, [rangeLabel, startDate, endDate]);

  const onRangeSelect = (label) => {
    const now = new Date();
    let start;

    if (label === 'Past 30 days') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (label === 'Past 12 months') {
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    } else {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    setRangeLabel(label);
    setStartDate(isoDate(start));
    setEndDate(isoDate(now));
    setMessage(null);
  };

  const downloadFile = async (fileData, filename, mimeType) => {
    const blob = new Blob([fileData], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const response = await analyticsService.exportReport({ type, startDate, endDate, format });
      if (format === 'csv') {
        const filename = `report_${type}_${startDate}_${endDate}.csv`;
        await downloadFile(response.data, filename, 'text/csv;charset=utf-8;');
      } else {
        const payload = JSON.stringify(response.data, null, 2);
        const filename = `report_${type}_${startDate}_${endDate}.json`;
        await downloadFile(payload, filename, 'application/json;charset=utf-8;');
      }
      setMessage({ type: 'success', text: `${ReportTypes.find((item) => item.value === type).label} report downloaded.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to export report.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Reports"
      subtitle="Download live order, customer, and payment reports with configurable time windows and export formats."
      actions={<GradientButton onClick={handleDownload} disabled={loading}>{loading ? 'Exporting...' : 'Download Report'}</GradientButton>}
    >
      <PageHeader
        eyebrow="Export Center"
        title="Report Downloads"
        description="Select a data set, choose a date range, and export the latest store analytics as CSV or JSON."
      />

      <SectionCard>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Report Settings</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Export configuration</h2>
              <p className="mt-2 text-sm text-slate-600">Generate a downloadable file from your live database records for orders, customers, or payments.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Report type</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {ReportTypes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${type === item.value ? 'border-blue-500 bg-blue-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-500">Live export from the admin analytics API</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {dateRanges.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onRangeSelect(item.label)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Export format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                >
                  {ReportFormats.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-between gap-3">
                <GradientButton type="button" onClick={handleDownload} disabled={loading}>{loading ? 'Exporting...' : 'Download'}</GradientButton>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{selectedRangeText}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Help</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">What this exports</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Orders: full order lines, product details, payment state, and order totals.</li>
              <li>• Customers: customer lifecycle, spend, order frequency, and segment data.</li>
              <li>• Payments: gateway transactions, user reference, amount, and settlement state.</li>
            </ul>

            <div className="mt-6 rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Pro tip</p>
              <p className="mt-2 text-sm text-slate-600">Open CSV exports in Excel or Google Sheets for immediate order and payment reconciliation.</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            {message.text}
          </div>
        )}
      </SectionCard>
    </DashboardLayout>
  );
};

export default Reports;
