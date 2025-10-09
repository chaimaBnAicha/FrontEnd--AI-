export enum LeaveType {
  Sick = 'Sick',
  Unpaid = 'Unpaid',
  Emergency = 'Emergency'
}

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface Leave {
  id?: number;
  start_date: string;
  end_date: string;
  reason: string;
  documentAttachement: string;
  type: 'Sick' | 'Unpaid' | 'Emergency';
  status: 'Pending' | 'Approved' | 'Rejected';
  user: {
    id: number;
  };
  isDownloading?: boolean;
  downloadError?: boolean;
} 
 
