import React, { useState } from 'react';
import { Client } from '../types';
import { MOCK_CLIENTS } from '../constants'; // For initial data

const ClientsView: React.FC = () => {
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState<Omit<Client, 'id'>>({
        name: '',
        address: '',
        gstin: '',
        contactPerson: '',
        email: '',
        phone: '',
    });

    const inputClass = "w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const openFormForAdd = () => {
        setEditingClient(null);
        setFormData({
            name: '',
            address: '',
            gstin: '',
            contactPerson: '',
            email: '',
            phone: '',
        });
        setIsFormOpen(true);
    };

    const openFormForEdit = (client: Client) => {
        setEditingClient(client);
        setFormData(client);
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClient) {
            setClients(clients.map(c => c.id === editingClient.id ? { ...formData, id: c.id } : c));
        } else {
            setClients([...clients, { ...formData, id: new Date().toISOString() }]);
        }
        setIsFormOpen(false);
    };
    
    const handleDelete = (id: string) => {
        setClients(clients.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Clients</h1>
                <button onClick={openFormForAdd} className="px-6 py-2 rounded-md bg-primary-600 text-white font-semibold shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150">
                    Add New Client
                </button>
            </div>
            
             {isFormOpen && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">{editingClient ? 'Edit Client' : 'Create New Client'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClass} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person</label><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className={inputClass} required /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label><textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className={inputClass}></textarea></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GSTIN</label><input type="text" name="gstin" value={formData.gstin} onChange={handleInputChange} className={inputClass} /></div>

                        <div className="md:col-span-2 flex justify-end space-x-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700">{editingClient ? 'Update Client' : 'Save Client'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Contact Person</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Phone</th>
                            <th scope="col" className="px-6 py-3">GSTIN</th>
                            <th scope="col" className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{client.name}</td>
                                <td className="px-6 py-4">{client.contactPerson}</td>
                                <td className="px-6 py-4">{client.email}</td>
                                <td className="px-6 py-4">{client.phone}</td>
                                <td className="px-6 py-4">{client.gstin}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => openFormForEdit(client)} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(client.id)} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientsView;
