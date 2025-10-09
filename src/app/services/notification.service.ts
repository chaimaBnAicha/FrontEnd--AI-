import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notifications$ = this.notificationSubject.asObservable();

  showSuccess(message: string): void {
    this.notificationSubject.next({
      message,
      type: 'success',
      timestamp: new Date()
    });
  }

  showError(message: string): void {
    this.notificationSubject.next({
      message,
      type: 'error',
      timestamp: new Date()
    });
  }

  showWarning(message: string): void {
    this.notificationSubject.next({
      message,
      type: 'warning',
      timestamp: new Date()
    });
  }

  checkLowStock(stock: any): void {
    if (stock.quantity <= 5) {
      this.showWarning(`Attention: Le stock de ${stock.name} est bas (${stock.quantity} restants)`);
    }
  }
} 