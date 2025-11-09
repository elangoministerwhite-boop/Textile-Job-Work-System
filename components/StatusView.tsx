import React, { useMemo, useState, useRef, useEffect } from 'react';
import { JobOrder, DeliveryChallan, Invoice, JobOrderStatus } from '../types';
import { CGST_RATE, SGST_RATE, JOB_STATUS_OPTIONS } from '../constants';
import { ExportIcon } from './icons/ExportIcon';

interface StatusViewProps {
    jobOrders: JobOrder[];
    challans: DeliveryChallan[];
    invoices: Invoice[];
}

const StatusView: React.FC<StatusViewProps> = ({ jobOrders, challans, invoices }) => {
    const [filters, setFilters] = useState({ search: '', vendor: '', status: '' });
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    const uniqueVendors = useMemo(() => [...new Set(jobOrders.map(jo => jo.vendorName))], [jobOrders]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const columns = [
        { key: 'date', label: 'Date' },
        { key: 'jobOrderNo', label: 'Job Order No' },
        { key: 'vendorName', label: 'Vendor' },
        { key: 'goodsDescription', label: 'Goods Description' },
        { key: 'color', label: 'Color' },
        { key: 'uom', label: 'Unit' },
        { key: 'quantity', label: 'Total Quantity' },
        { key: 'completedQty', label: 'Completed Qty' },
        { key: 'damageQty', label: 'Damage Qty (Job)' },
        { key: 'pendingQty', label: 'Pending Qty' },
        { key: 'status', label: 'Status' },
        { key: 'challanNo', label: 'Challan No' },
        { key: 'challanDate', label: 'Challan Date' },
        { key: 'challanFinishedQty', label: 'Finished Qty (Challan)' },
        { key: 'challanDamageQty', label: 'Damage Qty (Challan)' },
        { key: 'invoiceDate', label: 'Invoice Date' },
        { key: 'invoiceNo', label: 'Invoice No' },
        { key: 'invoiceChallanQty', label: 'Challan Qty (Inv)' },
        { key: 'invoiceRatePerPiece', label: 'Rate/Piece' },
        { key: 'billedTo', label: 'Billed To' },
        { key: 'taxableAmount', label: 'Taxable Amount' },
        { key: 'cgst', label: 'CGST' },
        { key: 'sgst', label: 'SGST' },
        { key: 'totalAmount', label: 'Total Amount' },
    ];

    const mergedData = useMemo(() => {
        const filteredOrders = jobOrders.filter(order => {
            const searchLower = filters.search.toLowerCase();
            return (
                (filters.vendor === '' || order.vendorName === filters.vendor) &&
                (filters.status === '' || order.status === filters.status) &&
                (
                    filters.search === '' ||
                    order.jobOrderNo.toLowerCase().includes(searchLower) ||
                    order.vendorName.toLowerCase().includes(searchLower) ||
                    order.goodsDescription.toLowerCase().includes(searchLower)
                )
            );
        });

        return filteredOrders.map(order => {
            const allRelatedChallans = challans.filter(c => c.poNumber === order.jobOrderNo);
            const relatedInvoice = invoices.find(i => i.poNumber === order.jobOrderNo);

            const totalChallanFinishedQty = allRelatedChallans.reduce((sum, c) => sum + c.finishedQty, 0);
            const totalChallanDamageQty = allRelatedChallans.reduce((sum, c) => sum + c.damageQty, 0);
            const pendingQty = order.quantity - totalChallanFinishedQty;

            let invoiceCalculations = {
                taxableAmount: undefined,
                cgst: undefined,
                sgst: undefined,
                totalAmount: undefined,
            };

            if (relatedInvoice) {
                const taxableAmount = relatedInvoice.challanQty * relatedInvoice.ratePerPiece;
                const cgst = taxableAmount * CGST_RATE;
                const sgst = taxableAmount * SGST_RATE;
                const totalAmount = taxableAmount + cgst + sgst;
                invoiceCalculations = { taxableAmount, cgst, sgst, totalAmount };
            }

            return {
                ...order,
                completedQty: totalChallanFinishedQty,
                pendingQty,
                challanNo: allRelatedChallans.length > 0 ? allRelatedChallans.map(c => c.challanNo).join(', ') : undefined,
                challanDate: allRelatedChallans.length > 0 ? allRelatedChallans.map(c => c.date).join(', ') : undefined,
                challanFinishedQty: allRelatedChallans.length > 0 ? totalChallanFinishedQty : undefined,
                challanDamageQty: allRelatedChallans.length > 0 ? totalChallanDamageQty : undefined,
                invoiceDate: relatedInvoice?.date,
                invoiceNo: relatedInvoice?.invoiceNo,
                invoiceChallanQty: relatedInvoice?.challanQty,
                invoiceRatePerPiece: relatedInvoice?.ratePerPiece,
                billedTo: relatedInvoice?.billedTo.name,
                ...invoiceCalculations
            };
        });
    }, [jobOrders, challans, invoices, filters]);
    
    const handlePrint = () => {
        window.print();
        setIsExportMenuOpen(false);
    };

    const handleExportCSV = () => {
        const headers = columns.map(c => c.label);
        const data = mergedData.map(item => {
            return columns.map(col => {
                const value = (item as any)[col.key];
                return value !== undefined && value !== null ? value : '';
            });
        });

        const csvContent = [
            headers.join(','),
            ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'status-report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportMenuOpen(false);
    };

    const getStatusBadge = (status: JobOrderStatus) => {
        switch (status) {
            case JobOrderStatus.Completed:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case JobOrderStatus.InProgress:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case JobOrderStatus.Pending:
            default:
                return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    const renderCellContent = (item: any, columnKey: string) => {
        const value = item[columnKey];
        
        if (value === undefined || value === null) return <span className="text-gray-400">N/A</span>;
        
        if (columnKey === 'status') {
            return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>{value}</span>;
        }

        if (['taxableAmount', 'cgst', 'sgst', 'totalAmount', 'invoiceRatePerPiece'].includes(columnKey)) {
             return `₹${Number(value).toLocaleString('en-IN')}`;
        }
        
        return value.toString();
    }
    
    const inputClass = "w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Comprehensive Status Report</h1>
                 <div className="relative mt-4 sm:mt-0" ref={exportMenuRef}>
                    <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="px-4 py-2 flex items-center rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold border dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150">
                       Export <ExportIcon/>
                    </button>
                     {isExportMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20 border dark:border-gray-600">
                            <button onClick={handlePrint} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Print</button>
                            <button onClick={handleExportCSV} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Export as CSV</button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md no-print">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="search" placeholder="Search by Order No, Vendor, Desc..." value={filters.search} onChange={handleFilterChange} className={inputClass} />
                    <select name="vendor" value={filters.vendor} onChange={handleFilterChange} className={inputClass}>
                        <option value="">All Vendors</option>
                        {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                     <select name="status" value={filters.status} onChange={handleFilterChange} className={inputClass}>
                        <option value="">All Statuses</option>
                        {JOB_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg printable-content status-page-print">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-slate-300">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} scope="col" className="px-6 py-3 whitespace-nowrap">{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {mergedData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                {columns.map(col => (
                                     <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                                        {renderCellContent(item, col.key)}
                                     </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {mergedData.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 no-print">
                        No data found for the selected filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusView;