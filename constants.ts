import { JobOrderStatus, PartyDetails, Client } from './types';

export const CGST_RATE = 0.09;
export const SGST_RATE = 0.09;

export const VENDORS = [
    'ABC Textiles',
    'XYZ Garments',
    'Sewing Masters Co.',
    'Fabric World',
    'Quality Threads Ltd.',
];

export const UOM_OPTIONS = ['Pieces', 'Sets', 'Meters', 'Kg'];

export const JOB_STATUS_OPTIONS = Object.values(JobOrderStatus);

export const MOCK_PARTY_DETAILS: PartyDetails = {
    name: 'Fashion Forward Inc.',
    address: '123 Fashion Ave, Garment City, 110001',
    gstin: '29ABCDE1234F1Z5',
};

export const MOCK_CLIENTS: Client[] = [
    {
        id: '1',
        name: 'Fashion Forward Inc.',
        address: '123 Fashion Ave, Garment City, 110001',
        gstin: '29ABCDE1234F1Z5',
        contactPerson: 'John Doe',
        email: 'john.doe@fashionforward.com',
        phone: '9876543210',
    },
    {
        id: '2',
        name: 'Trendy Threads',
        address: '456 Style St, Apparel Town, 110002',
        gstin: '29FGHIJ5678K2Z6',
        contactPerson: 'Jane Smith',
        email: 'jane.smith@trendythreads.com',
        phone: '8765432109',
    },
    {
        id: '3',
        name: 'Classic Couture',
        address: '789 Elegance Blvd, Fashion District, 110003',
        gstin: '29LMNOP9012Q3Z7',
        contactPerson: 'Robert Brown',
        email: 'robert.brown@classiccouture.com',
        phone: '7654321098',
    }
];
