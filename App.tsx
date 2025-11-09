import React, { useState } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import JobOrdersView from './components/JobOrdersView';
import DeliveryChallansView from './components/DeliveryChallansView';
import InvoicesView from './components/InvoicesView';
import StatusView from './components/StatusView';
import ClientsView from './components/ClientsView';
import { JobOrder, DeliveryChallan, Invoice, JobOrderStatus } from './types';
import { MOCK_CLIENTS } from './constants';

// Mock Data
const initialJobOrders: JobOrder[] = [
    { id: 'JO-001', jobOrderNo: 'JO-001', date: '2024-07-01', vendorName: 'ABC Textiles', goodsDescription: 'Cotton T-Shirts', color: 'White', quantity: 500, uom: 'Pieces', completedQty: 300, damageQty: 5, status: JobOrderStatus.InProgress, remark: '' },
    { id: 'JO-002', jobOrderNo: 'JO-002', date: '2024-07-02', vendorName: 'XYZ Garments', goodsDescription: 'Denim Jeans', color: 'Blue', quantity: 200, uom: 'Pieces', completedQty: 200, damageQty: 2, status: JobOrderStatus.Completed, remark: 'Urgent order' },
    { id: 'JO-003', jobOrderNo: 'JO-003', date: '2024-07-03', vendorName: 'Sewing Masters Co.', goodsDescription: 'Polo Shirts', color: 'Black', quantity: 300, uom: 'Pieces', completedQty: 0, damageQty: 0, status: JobOrderStatus.Pending, remark: '' },
];
const initialChallans: DeliveryChallan[] = [
    { id: 'DC-001', challanNo: 'DC-001', date: '2024-07-10', poNumber: 'JO-001', poDate: '2024-07-01', billedTo: MOCK_CLIENTS[0], shippedTo: MOCK_CLIENTS[0], goodsDescription: 'Cotton T-Shirts', hsnCode: '6109', finishedQty: 300, uom: 'Pieces', damageQty: 0, ratePerPiece: 250, remark: '' },
    { id: 'DC-002', challanNo: 'DC-002', date: '2024-07-08', poNumber: 'JO-002', poDate: '2024-07-02', billedTo: MOCK_CLIENTS[1], shippedTo: MOCK_CLIENTS[1], goodsDescription: 'Denim Jeans', hsnCode: '6203', finishedQty: 200, uom: 'Pieces', damageQty: 0, ratePerPiece: 800, remark: '' },
];
const initialInvoices: Invoice[] = [
    { id: 'INV-001', invoiceNo: 'INV-001', date: '2024-07-11', poNumber: 'JO-001', poDate: '2024-07-01', billedTo: MOCK_CLIENTS[0], shippedTo: MOCK_CLIENTS[0], goodsDescription: 'Cotton T-Shirts', hsnCode: '6109', challanQty: 300, uom: 'Pieces', ratePerPiece: 250, remark: '' },
    { id: 'INV-002', invoiceNo: 'INV-002', date: '2024-07-09', poNumber: 'JO-002', poDate: '2024-07-02', billedTo: MOCK_CLIENTS[1], shippedTo: MOCK_CLIENTS[1], goodsDescription: 'Denim Jeans', hsnCode: '6203', challanQty: 200, uom: 'Pieces', ratePerPiece: 800, remark: '' },
];

function App() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [jobOrders, setJobOrders] = useState<JobOrder[]>(initialJobOrders);
    const [challans, setChallans] = useState<DeliveryChallan[]>(initialChallans);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

    const handleAddJobOrder = (order: Omit<JobOrder, 'id'>) => {
        const newId = `JO-${String(jobOrders.length + 1).padStart(3, '0')}`;
        setJobOrders([...jobOrders, { ...order, id: newId, jobOrderNo: newId }]);
    };
    const handleUpdateJobOrder = (updatedOrder: JobOrder) => {
        setJobOrders(jobOrders.map(jo => jo.id === updatedOrder.id ? updatedOrder : jo));
    };
    const handleDeleteJobOrders = (ids: string[]) => {
        setJobOrders(jobOrders.filter(jo => !ids.includes(jo.id)));
    };
    const handleUpdateJobOrderStatus = (ids: string[], status: JobOrderStatus) => {
        setJobOrders(jobOrders.map(jo => ids.includes(jo.id) ? { ...jo, status } : jo));
    };

    const handleAddChallan = (challan: Omit<DeliveryChallan, 'id' | 'challanNo'>) => {
        const newId = `DC-${String(challans.length + 1).padStart(3, '0')}`;
        setChallans([...challans, { ...challan, id: newId, challanNo: newId }]);
        // Also update job order status to 'In Progress' if it's 'Pending'
        setJobOrders(jobOrders.map(jo => jo.jobOrderNo === challan.poNumber && jo.status === JobOrderStatus.Pending ? {...jo, status: JobOrderStatus.InProgress} : jo));
    };
    const handleDeleteChallans = (ids: string[]) => {
        setChallans(challans.filter(c => !ids.includes(c.id)));
    };

    const handleAddInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNo'>) => {
        const newId = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
        setInvoices([...invoices, { ...invoice, id: newId, invoiceNo: newId }]);
    };
    const handleDeleteInvoices = (ids: string[]) => {
        setInvoices(invoices.filter(i => !ids.includes(i.id)));
    };


    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView jobOrders={jobOrders} invoices={invoices} />;
            case 'jobOrders':
                return <JobOrdersView jobOrders={jobOrders} challans={challans} onAddJobOrder={handleAddJobOrder} onUpdateJobOrder={handleUpdateJobOrder} onDeleteJobOrders={handleDeleteJobOrders} onUpdateJobOrderStatus={handleUpdateJobOrderStatus}/>;
            case 'challans':
                return <DeliveryChallansView challans={challans} onAddChallan={handleAddChallan} onDeleteChallans={handleDeleteChallans}/>;
            case 'invoices':
                return <InvoicesView invoices={invoices} onAddInvoice={handleAddInvoice} onDeleteInvoices={handleDeleteInvoices}/>;
            case 'clients':
                 return <ClientsView />;
            case 'status':
                return <StatusView jobOrders={jobOrders} challans={challans} invoices={invoices} />;
            default:
                return <DashboardView jobOrders={jobOrders} invoices={invoices} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <Header currentView={currentView} setCurrentView={setCurrentView} />
            <main className="flex-1 p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
}

export default App;
