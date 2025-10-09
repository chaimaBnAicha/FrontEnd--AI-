export type StockCategory = 'MATERIALS' | 'TOOLS' | 'ELECTRICAL_PLUMBING';

export interface Stock {
    id_stock: number;
    name: string;
    quantity: number;
    unitPrice: number;
    description: string;
    category: StockCategory;
    bills: any[];
} 