import React from 'react';
import { DashboardIcon } from './icons/DashboardIcon';
import { JobOrderIcon } from './icons/JobOrderIcon';
import { ChallanIcon } from './icons/ChallanIcon';
import { InvoiceIcon } from './icons/InvoiceIcon';
import { StatusIcon } from './icons/StatusIcon';
import { ClientsIcon } from './icons/ClientsIcon';


interface HeaderProps {
    currentView: string;
    setCurrentView: (view: string) => void;
}

const NavItem: React.FC<{
    label: string,
    viewName: string,
    currentView: string,
    onClick: (view: string) => void,
    children: React.ReactNode
}> = ({ label, viewName, currentView, onClick, children }) => {
    const isActive = currentView === viewName;
    return (
        <button
            onClick={() => onClick(viewName)}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isActive 
                ? 'bg-primary-600 text-white shadow-lg' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
            {children}
            <span className="ml-3">{label}</span>
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    return (
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-xl flex flex-col no-print">
            <div className="px-6 py-4 border-b dark:border-gray-700">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-300">ERP System</h2>
                <p className="text-xs text-slate-500">Garment Industry</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <NavItem label="Dashboard" viewName="dashboard" currentView={currentView} onClick={setCurrentView}>
                    <DashboardIcon />
                </NavItem>
                <NavItem label="Job Orders" viewName="jobOrders" currentView={currentView} onClick={setCurrentView}>
                    <JobOrderIcon />
                </NavItem>
                <NavItem label="Delivery Challans" viewName="challans" currentView={currentView} onClick={setCurrentView}>
                    <ChallanIcon />
                </NavItem>
                <NavItem label="Invoices" viewName="invoices" currentView={currentView} onClick={setCurrentView}>
                    <InvoiceIcon />
                </NavItem>
                <NavItem label="Clients" viewName="clients" currentView={currentView} onClick={setCurrentView}>
                    <ClientsIcon />
                </NavItem>
                <NavItem label="Status Report" viewName="status" currentView={currentView} onClick={setCurrentView}>
                    <StatusIcon />
                </NavItem>
            </nav>
            <div className="p-4 border-t dark:border-gray-700 text-center">
                 <p className="text-xs text-gray-500 dark:text-gray-400">&copy; 2024 ERP Solutions</p>
            </div>
        </aside>
    );
};

export default Header;
