import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DeliveryChallan } from '../types';
import { UOM_OPTIONS, MOCK_PARTY_DETAILS } from '../constants';
import { ExportIcon } from './icons/ExportIcon';

interface DeliveryChallansViewProps {
    challans: DeliveryChallan[];
    onAddChallan: (challan: Omit<DeliveryChallan, 'id' | 'challanNo'>) => void;
    onDeleteChallans: (ids: string[]) => void;
}

const initialFormData: Omit<DeliveryChallan, 'id' | 'challanNo'> = {
    date: new Date().toISOString().split('T')[0],
    poNumber: '',
    poDate: new Date().toISOString().split('T')[0],
    billedTo: { ...MOCK_PARTY_DETAILS },
    shippedTo: { ...MOCK_PARTY_DETAILS },
    goodsDescription: '',
    hsnCode: '',
    finishedQty: 0,
    uom: UOM_OPTIONS[0],
    damageQty: 0,
    ratePerPiece: 0,
    remark: '',
};

const DeliveryChallansView: React.FC<DeliveryChallansViewProps> = ({
    challans,
    onAddChallan,
    onDeleteChallans,
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<Omit<DeliveryChallan, 'id' | 'challanNo'>>(initialFormData);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSameAsBilledTo, setIsSameAsBilledTo] = useState(true);
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

    const filteredChallans = useMemo(() => {
        return challans.filter(challan => {
            const searchLower = search.toLowerCase();
            return (
                challan.challanNo.toLowerCase().includes(searchLower) ||
                challan.poNumber.toLowerCase().includes(searchLower) ||
                challan.goodsDescription.toLowerCase().includes(searchLower)
            );
        });
    }, [challans, search]);

    const handlePartyDetailsChange = (e: React.ChangeEvent<HTMLInputElement>, party: 'billedTo' | 'shippedTo') => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newPartyDetails = { ...prev[party], [name]: value };
            if (party === 'billedTo' && isSameAsBilledTo) {
                return { ...prev, billedTo: newPartyDetails, shippedTo: newPartyDetails };
            }
            return { ...prev, [party]: newPartyDetails };
        });
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: ['finishedQty', 'damageQty', 'ratePerPiece'].includes(name) ? Number(value) : value }));
    };

    const openFormForAdd = () => {
        setFormData(initialFormData);
        setIsSameAsBilledTo(true);
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddChallan(formData);
        setIsFormOpen(false);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredChallans.map(c => c.id));
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
            onDeleteChallans(selectedIds);
            setSelectedIds([]);
        }
    };

    const handleSameAsBilledTo = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSameAsBilledTo(e.target.checked);
        if (e.target.checked) {
            setFormData(prev => ({ ...prev, shippedTo: prev.billedTo }));
        }
    }

    const handlePrint = () => {
        window.print();
        setIsExportMenuOpen(false);
    };

    const handleExportCSV = () => {
        const headers = ['Challan No', 'Date', 'PO Number', 'PO Date', 'Billed To', 'Billed To Address', 'Shipped To', 'Shipped To Address', 'Goods Description', 'HSN Code', 'Finished Qty', 'UOM', 'Damage Qty', 'Rate Per Piece', 'Amount', 'Remark'];
        const data = filteredChallans.map(c => [
            c.challanNo, c.date, c.poNumber, c.poDate,
            c.billedTo.name, c.billedTo.address,
            c.shippedTo.name, c.shippedTo.address,
            c.goodsDescription, c.hsnCode,
            c.finishedQty, c.uom, c.damageQty, c.ratePerPiece,
            c.finishedQty * c.ratePerPiece,
            c.remark
        ]);

        const csvContent = [
            headers.join(','),
            ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'delivery-challans.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportMenuOpen(false);
    };

    const inputClass = "w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Delivery Challans</h1>
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
                        Add New Challan
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg no-print">
                    <h2 className="text-xl font-semibold mb-4">Create New Delivery Challan</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Challan Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className={inputClass} required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PO Number</label><input type="text" name="poNumber" value={formData.poNumber} onChange={handleInputChange} className={inputClass} required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PO Date</label><input type="date" name="poDate" value={formData.poDate} onChange={handleInputChange} className={inputClass} required /></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <fieldset className="border p-4 rounded-md dark:border-gray-600">
                                <legend className="px-2 font-semibold">Billed To</legend>
                                <div className="space-y-4">
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label><input type="text" name="name" value={formData.billedTo.name} onChange={(e) => handlePartyDetailsChange(e, 'billedTo')} className={inputClass} required /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label><input type="text" name="address" value={formData.billedTo.address} onChange={(e) => handlePartyDetailsChange(e, 'billedTo')} className={inputClass} required /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GSTIN</label><input type="text" name="gstin" value={formData.billedTo.gstin || ''} onChange={(e) => handlePartyDetailsChange(e, 'billedTo')} className={inputClass} /></div>
                                </div>
                            </fieldset>
                            <fieldset className="border p-4 rounded-md dark:border-gray-600">
                                <legend className="px-2 font-semibold flex items-center">
                                    <span>Shipped To</span>
                                    <label className="ml-4 flex items-center text-sm font-normal">
                                        <input type="checkbox" checked={isSameAsBilledTo} onChange={handleSameAsBilledTo} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">Same as Billed To</span>
                                    </label>
                                </legend>
                                <div className="space-y-4">
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label><input type="text" name="name" value={formData.shippedTo.name} onChange={(e) => handlePartyDetailsChange(e, 'shippedTo')} className={inputClass} required disabled={isSameAsBilledTo}/></div>
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label><input type="text" name="address" value={formData.shippedTo.address} onChange={(e) => handlePartyDetailsChange(e, 'shippedTo')} className={inputClass} required disabled={isSameAsBilledTo}/></div>
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GSTIN</label><input type="text" name="gstin" value={formData.shippedTo.gstin || ''} onChange={(e) => handlePartyDetailsChange(e, 'shippedTo')} className={inputClass} disabled={isSameAsBilledTo}/></div>
                                </div>
                            </fieldset>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="md:col-span-2 lg:col-span-1"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goods Description</label><input type="text" name="goodsDescription" value={formData.goodsDescription} onChange={handleInputChange} className={inputClass} required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">HSN Code</label><input type="text" name="hsnCode" value={formData.hsnCode} onChange={handleInputChange} className={inputClass} required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Finished Qty</label><input type="number" name="finishedQty" value={formData.finishedQty} onChange={handleInputChange} className={inputClass} required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label><select name="uom" value={formData.uom} onChange={handleInputChange} className={inputClass}>{UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Damage Qty</label><input type="number" name="damageQty" value={formData.damageQty} onChange={handleInputChange} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rate/Piece</label><input type="number" name="ratePerPiece" value={formData.ratePerPiece} onChange={handleInputChange} className={inputClass} required /></div>
                        </div>
                         <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remark</label><textarea name="remark" value={formData.remark} onChange={handleInputChange} rows={2} className={inputClass}></textarea></div>

                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700">Save Challan</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md no-print">
                <input type="text" name="search" placeholder="Search by Challan No, PO No, Description..." value={search} onChange={e => setSearch(e.target.value)} className={inputClass} />
            </div>

            {selectedIds.length > 0 && (
                 <div className="bg-primary-50 dark:bg-primary-900/50 p-4 rounded-lg shadow-md flex justify-between items-center no-print">
                    <p className="text-sm font-semibold text-primary-800 dark:text-primary-200">{selectedIds.length} item(s) selected</p>
                    <button onClick={handleDelete} className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold text-sm shadow-sm hover:bg-red-700">Delete Selected</button>
                </div>
            )}

            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg printable-content">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="p-4 no-print"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === filteredChallans.length && filteredChallans.length > 0} /></th>
                            <th scope="col" className="px-6 py-3">Challan No</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">PO Number</th>
                            <th scope="col" className="px-6 py-3">Billed To</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3 text-right">Finished Qty</th>
                            <th scope="col" className="px-6 py-3 text-right">Rate</th>
                            <th scope="col" className="px-6 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredChallans.map(challan => (
                            <tr key={challan.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <td className="w-4 p-4 no-print"><input type="checkbox" checked={selectedIds.includes(challan.id)} onChange={() => handleSelectOne(challan.id)} /></td>
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{challan.challanNo}</th>
                                <td className="px-6 py-4">{challan.date}</td>
                                <td className="px-6 py-4">{challan.poNumber}</td>
                                <td className="px-6 py-4">{challan.billedTo.name}</td>
                                <td className="px-6 py-4">{challan.goodsDescription}</td>
                                <td className="px-6 py-4 text-right">{challan.finishedQty} {challan.uom}</td>
                                <td className="px-6 py-4 text-right">₹{challan.ratePerPiece.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-right font-semibold">₹{(challan.finishedQty * challan.ratePerPiece).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredChallans.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No delivery challans found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryChallansView;