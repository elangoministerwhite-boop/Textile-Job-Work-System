export enum JobOrderStatus {
    Pending = 'Pending',
    InProgress = 'In Progress',
    Completed = 'Completed',
}

export interface PartyDetails {
    name: string;
    address: string;
    gstin?: string;
}

export interface JobOrder {
    id: string;
    jobOrderNo: string;
    date: string;
    vendorName: string;
    goodsDescription: string;
    color: string;
    quantity: number;
    uom: string;
    completedQty: number; // This is a calculated field based on challans.
    damageQty: number;
    status: JobOrderStatus;
    remark: string;
}

export interface DeliveryChallan {
    id: string;
    challanNo: string;
    date: string;
    poNumber: string; // This links to JobOrder's jobOrderNo
    poDate: string;
    billedTo: PartyDetails;
    shippedTo: PartyDetails;
    goodsDescription: string;
    hsnCode: string;
    finishedQty: number;
    uom: string;
    damageQty: number;
    ratePerPiece: number;
    remark: string;
}

export interface Invoice {
    id: string;
    invoiceNo: string;
    date: string;
    poNumber: string; // This links to JobOrder's jobOrderNo
    poDate: string;
    billedTo: PartyDetails;
    shippedTo: PartyDetails;
    goodsDescription: string;
    hsnCode: string;
    challanQty: number;
    uom: string;
    ratePerPiece: number;
    remark: string;
}

export interface Client {
    id: string;
    name: string;
    address: string;
    gstin?: string;
    contactPerson: string;
    email: string;
    phone: string;
}
