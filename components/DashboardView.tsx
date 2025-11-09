import React, { useMemo } from 'react';
import { JobOrder, Invoice, JobOrderStatus } from '../types';
import { CGST_RATE, SGST_RATE } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { JobOrderIcon } from './icons/JobOrderIcon';
import { InvoiceIcon } from './icons/InvoiceIcon';
import { ClientIcon } from './icons/ClientIcon';


interface DashboardViewProps {
    jobOrders: JobOrder[];
    invoices: Invoice[];
}

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start">
            <div className={`p-3 rounded-full mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};


const DashboardView: React.FC<DashboardViewProps> = ({ jobOrders, invoices }) => {
    const jobOrderStats = jobOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {} as Record<JobOrderStatus, number>);

    const totalInvoiceValue = invoices.reduce((acc, inv) => {
        const taxableAmount = inv.challanQty * inv.ratePerPiece;
        const totalAmount = taxableAmount * (1 + CGST_RATE + SGST_RATE);
        return acc + totalAmount;
    }, 0);

    const recentJobQuantities = jobOrders.slice(0, 5).map(jo => ({ name: jo.jobOrderNo, Quantity: jo.quantity, Completed: jo.completedQty }));

    const topClients = useMemo(() => {
        const clientTotals = invoices.reduce((acc, invoice) => {
            const clientName = invoice.billedTo.name;
            const taxableAmount = invoice.challanQty * invoice.ratePerPiece;
            const totalAmount = taxableAmount * (1 + CGST_RATE + SGST_RATE);
            
            acc[clientName] = (acc[clientName] || 0) + totalAmount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(clientTotals)
            .sort(([, aValue], [, bValue]) => bValue - aValue)
            .slice(0, 5);

    }, [invoices]);


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard title="Total Job Orders" value={jobOrders.length} icon={<JobOrderIcon />} color="bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300" />
                 <StatCard title="Completed Orders" value={jobOrderStats[JobOrderStatus.Completed] || 0} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300" />
                 <StatCard title="Pending Orders" value={jobOrderStats[JobOrderStatus.Pending] || 0} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300" />
                 <StatCard title="In Progress" value={jobOrderStats[JobOrderStatus.InProgress] || 0} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9a9 9 0 0114.65-4.65l1.35 1.35M20 15a9 9 0 01-14.65 4.65l-1.35-1.35" /></svg>} color="bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300" />
                 <StatCard title="Total Invoices" value={invoices.length} icon={<InvoiceIcon />} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300" />
                 {/* FIX: Corrected typo in Tailwind CSS class `text-rose-60-600` to `text-rose-600` */}
                 <StatCard title="Total Invoice Value" value={`₹${totalInvoiceValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} color="bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                     <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">Job Order Status</h3>
                     <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={Object.entries(jobOrderStats).map(([name, value]) => ({ name, count: value }))} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                             <XAxis dataKey="name" stroke="rgb(100 116 139 / var(--tw-text-opacity))" />
                             <YAxis stroke="rgb(100 116 139 / var(--tw-text-opacity))"/>
                             <Tooltip
                                 contentStyle={{
                                     backgroundColor: 'rgb(15 23 42 / 0.8)',
                                     borderColor: 'rgb(51 65 85)'
                                 }}
                                 cursor={{fill: 'rgb(51 65 85 / 0.5)'}}
                             />
                             <Legend />
                             <Bar dataKey="count" name="Job Orders" fill="#8b5cf6" />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                     <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">Recent Job Quantities</h3>
                     <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={recentJobQuantities} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                             <XAxis dataKey="name" stroke="rgb(100 116 139 / var(--tw-text-opacity))"/>
                             <YAxis stroke="rgb(100 116 139 / var(--tw-text-opacity))"/>
                             <Tooltip
                                 contentStyle={{
                                     backgroundColor: 'rgb(15 23 42 / 0.8)',
                                     borderColor: 'rgb(51 65 85)'
                                 }}
                                 cursor={{fill: 'rgb(51 65 85 / 0.5)'}}
                             />
                             <Legend />
                             <Bar dataKey="Quantity" stackId="a" fill="#8b5cf6" />
                             <Bar dataKey="Completed" stackId="a" fill="#10b981" />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <ClientIcon />
                    <span className="ml-2">Top Clients by Revenue</span>
                </h3>
                <div className="mt-4 flow-root">
                     {topClients.length > 0 ? (
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                             {topClients.map(([name, total]) => (
                                <li key={name} className="py-3 sm:py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-bold text-xs">
                                                {name.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                {name}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                             No invoice data available to show top clients.
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;