export enum TypeOffer {
    Insurance = 'Insurance',
    Bonus = 'Bonus',
    Compensation = 'Compensation',
    Training = 'Training'
}

export enum OfferStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface Offer {
    id_offer?: number;
    Title: string;
    Description: string;
    Start_Date: Date | string | null;
    End_Date: Date | string | null;
    Typeoffer: TypeOffer;
    Status: OfferStatus;
    user_id: number;
} 