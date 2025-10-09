import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  template: `
    <div class="notifications-container">
      <div *ngFor="let notification of notifications"
           class="alert" 
           [ngClass]="{
             'alert-success': notification.type === 'success',
             'alert-warning': notification.type === 'warning',
             'alert-error': notification.type === 'error'
           }">
        {{ notification.message }}
        <button class="close-btn" (click)="removeNotification(notification)">&times;</button>
      </div>
    </div>
  `,
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  private subscription: Subscription;

  constructor(private notificationService: NotificationService) {
    this.subscription = this.notificationService.notifications$.subscribe(
      notification => {
        this.notifications.push(notification);
        setTimeout(() => {
          this.removeNotification(notification);
        }, 15000);
      }
    );
  }

  removeNotification(notification: any): void {
    this.notifications = this.notifications.filter(n => n !== notification);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 