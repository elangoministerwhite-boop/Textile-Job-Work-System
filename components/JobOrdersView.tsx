import React, { useState, useMemo, useEffect, useRef } from 'react';
import { JobOrder, JobOrderStatus, DeliveryChallan } from '../types';
import { VENDORS, UOM_OPTIONS, JOB_STATUS_OPTIONS } from '../constants';
import { ExportIcon } from './icons/ExportIcon';

interface JobOrdersViewProps {
    jobOrders: JobOrder[];
    challans: DeliveryChallan[];
    onAddJobOrder: (order: Omit<JobOrder, 'id'>) => void;
    onUpdateJobOrder: (order: JobOrder) => void;
    onDeleteJobOrders: (ids: string[]) => void;
    onUpdateJobOrderStatus: (ids:string[], status: JobOrderStatus) => void;
}

const JobOrdersView: React.FC<JobOrdersViewProps> = ({
    jobOrders,
    challans,
    onAddJobOrder,
    onUpdateJobOrder,
    onDeleteJobOrders,
    onUpdateJobOrderStatus,
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<JobOrder | null>(null);
    const [formData, setFormData] = useState<Omit<JobOrder, 'id'>>({
        jobOrderNo: '',
        date: new Date().toISOString().split('T')[0],
        vendorName: '',
        goodsDescription: '',
        color: '',
        quantity: 0,
        uom: UOM_OPTIONS[0],
        completedQty: 0,
        damageQty: 0,
        status: JobOrderStatus.Pending,
        remark: '',
    });

    const [filters, setFilters] = useState({ search: '', vendor: '', status: '' });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredJobOrders = useMemo(() => {
        return jobOrders.filter(order => {
            const searchLower = filters.search.toLowerCase();
            return (
                (filters.vendor === '' || order.vendorName === filters.vendor) &&
                (filters.status === '' || order.status === filters.status) &&
                (
                    order.jobOrderNo.toLowerCase().includes(searchLower) ||
                    order.goodsDescription.toLowerCase().includes(searchLower) ||
                    order.color.toLowerCase().includes(searchLower)
                )
            );
        });
    }, [jobOrders, filters]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'quantity' || name === 'completedQty' || name === 'damageQty' ? Number(value) : value }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const openFormForAdd = () => {
        setEditingOrder(null);
        setFormData({
             jobOrderNo: '',
            date: new Date().toISOString().split('T')[0],
            vendorName: VENDORS[0],
            goodsDescription: '',
            color: '',
            quantity: 0,
            uom: UOM_OPTIONS[0],
            completedQty: 0,
            damageQty: 0,
            status: JobOrderStatus.Pending,
            remark: '',
        });
        setIsFormOpen(true);
    };

    const openFormForEdit = (order: JobOrder) => {
        setEditingOrder(order);
        const totalChallanFinishedQty = challans
            .filter(c => c.poNumber === order.jobOrderNo)
            .reduce((sum, c) => sum + c.finishedQty, 0);
        setFormData({ ...order, completedQty: totalChallanFinishedQty });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOrder) {
            onUpdateJobOrder({ ...formData, id: editingOrder.id });
        } else {
            onAddJobOrder(formData);
        }
        setIsFormOpen(false);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredJobOrders.map(o => o.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = () => {
        if (selectedIds.length > 0) {
            onDeleteJobOrders(selectedIds);
            setSelectedIds([]);
        }
    };
    
    const handleStatusUpdate = (status: JobOrderStatus) => {
        if (selectedIds.length > 0) {
            onUpdateJobOrderStatus(selectedIds, status);
            setSelectedIds([]);
        }
    };
    
    const handlePrint = () => {
        window.print();
        setIsExportMenuOpen(false);
    };

    const handleExportCSV = () => {
        const headers = ['Job Order No', 'Date', 'Vendor', 'Description', 'Color', 'Total Qty', 'UOM', 'Completed Qty', 'Damage Qty', 'Pending Qty', 'Status', 'Remark'];
        const data = filteredJobOrders.map(order => {
            const totalChallanFinishedQty = challans
                .filter(c => c.poNumber === order.jobOrderNo)
                .reduce((sum, c) => sum + c.finishedQty, 0);
            const pendingQty = order.quantity - totalChallanFinishedQty;
            return [
                order.jobOrderNo,
                order.date,
                order.vendorName,
                order.goodsDescription,
                order.color,
                order.quantity,
                order.uom,
                totalChallanFinishedQty,
                order.damageQty,
                pendingQty,
                order.status,
                order.remark
            ];
        });

        const csvContent = [
            headers.join(','),
            ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'job-orders.csv');
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

    const inputClass = "w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Job Orders</h1>
                 <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <div className="relative" ref={exportMenuRef}>
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
                    <button onClick={openFormForAdd} className="px-6 py-2 rounded-md bg-primary-600 text-white font-semibold shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150">
                        Add New Order
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg no-print">
                    <h2 className="text-xl font-semibold mb-4">{editingOrder ? 'Edit Job Order' : 'Create New Job Order'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {/* Form fields */}
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Order No</label><input type="text" name="jobOrderNo" value={formData.jobOrderNo} onChange={handleInputChange} className={inputClass} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className={inputClass} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor</label><select name="vendorName" value={formData.vendorName} onChange={handleInputChange} className={inputClass} required>{VENDORS.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goods Description</label><input type="text" name="goodsDescription" value={formData.goodsDescription} onChange={handleInputChange} className={inputClass} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label><input type="text" name="color" value={formData.color} onChange={handleInputChange} className={inputClass} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Quantity</label><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className={inputClass} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label><select name="uom" value={formData.uom} onChange={handleInputChange} className={inputClass}>{UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Completed Qty</label><input type="number" name="completedQty" value={formData.completedQty} onChange={handleInputChange} className={inputClass + " bg-gray-100 dark:bg-gray-800"} readOnly /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Damage Qty</label><input type="number" name="damageQty" value={formData.damageQty} onChange={handleInputChange} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label><select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>{JOB_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                        <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remark</label><textarea name="remark" value={formData.remark} onChange={handleInputChange} rows={2} className={inputClass}></textarea></div>
                        
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700">{editingOrder ? 'Update Order' : 'Save Order'}</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md no-print">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input type="text" name="search" placeholder="Search by Order No, Desc, Color..." value={filters.search} onChange={handleFilterChange} className={inputClass} />
                    <select name="vendor" value={filters.vendor} onChange={handleFilterChange} className={inputClass}>
                        <option value="">All Vendors</option>
                        {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                     <select name="status" value={filters.status} onChange={handleFilterChange} className={inputClass}>
                        <option value="">All Statuses</option>
                        {JOB_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {selectedIds.length > 0 && (
                 <div className="bg-primary-50 dark:bg-primary-900/50 p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 no-print">
                    <p className="text-sm font-semibold text-primary-800 dark:text-primary-200">{selectedIds.length} item(s) selected</p>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-primary-800 dark:text-primary-200">Update status to:</span>
                        {JOB_STATUS_OPTIONS.map(status => (
                             <button key={status} onClick={() => handleStatusUpdate(status)} className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm hover:opacity-80 transition-opacity ${getStatusBadge(status)}`}>{status}</button>
                        ))}
                         <button onClick={handleDelete} className="px-3 py-1 rounded-md bg-red-600 text-white font-semibold text-sm shadow-sm hover:bg-red-700">Delete</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg printable-content">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="p-4 no-print"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === filteredJobOrders.length && filteredJobOrders.length > 0} /></th>
                            <th scope="col" className="px-6 py-3">Job Order No</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Vendor</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Qty</th>
                            <th scope="col" className="px-6 py-3 text-right">Pending Qty</th>
                            <th scope="col" className="px-6 py-3 text-right">Damage Qty</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                            <th scope="col" className="px-6 py-3 no-print"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobOrders.map(order => {
                             const totalChallanFinishedQty = challans
                                .filter(c => c.poNumber === order.jobOrderNo)
                                .reduce((sum, c) => sum + c.finishedQty, 0);
                            const pendingQty = order.quantity - totalChallanFinishedQty;
                            return (
                                <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                    <td className="w-4 p-4 no-print"><input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => handleSelectOne(order.id)} /></td>
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{order.jobOrderNo}</th>
                                    <td className="px-6 py-4">{order.date}</td>
                                    <td className="px-6 py-4">{order.vendorName}</td>
                                    <td className="px-6 py-4">{order.goodsDescription} ({order.color})</td>
                                    <td className="px-6 py-4 text-right">{order.quantity} {order.uom}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-blue-600 dark:text-blue-400">{pendingQty} {order.uom}</td>
                                    <td className={`px-6 py-4 text-right font-semibold ${order.damageQty > 0 ? 'text-red-500' : ''}`}>{order.damageQty} {order.uom}</td>
                                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                                    <td className="px-6 py-4 text-right no-print"><button onClick={() => openFormForEdit(order)} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Edit</button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                 {filteredJobOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No job orders found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobOrdersView;