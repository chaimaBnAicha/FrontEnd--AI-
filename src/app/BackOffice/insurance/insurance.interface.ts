export interface Insurance {
    id_Insurance?: number;
    description: string;
    start_Date: Date | string;
    end_Date: Date | string;
    amount: number;
    category: Category;
    user?: {
        id: number;
    };
    insuranceStatus?: string; // Add this line - make it optional with ?
}

export enum Category {
    RCPro = 'RCPro',
    TRC = 'TRC',
    CIVIL_EXPLOITATION = 'CIVIL_EXPLOITATION'
}