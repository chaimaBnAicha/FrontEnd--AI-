// Renamed to match backend - Status is for payment method (CASH, TRANSFER, etc.)
export enum Status {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CHECK = 'CHECK',
  BANK_CARD = 'BANK_CARD'
}

// Renamed to match backend - PaymentMode is for payment status (PAID, PENDING, etc.)
export enum PaymentMode {
  PAID = 'PAID',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED'
}

export interface StockReference {
  id_stock?: number;
  name?: string;
}

export interface Bill {
  id_Bill?: number;
  num_Bill: string;
  date: string; // Nous utiliserons string pour la date et gérerons la conversion
  total_Amount: number;
  status: Status; // Changed from BillStatus to Status
  paymentMode: PaymentMode;
  stock?: StockReference;
}
