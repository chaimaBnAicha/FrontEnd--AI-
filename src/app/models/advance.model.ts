export interface Advance {
  id: number;
  amount_request: number;
  reason: string;
  status: string;
  requestDate: string;
  user: { id: number };
} 