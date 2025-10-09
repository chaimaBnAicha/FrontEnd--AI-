import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-meeting-details-dialog',
  template: `
    <h2 mat-dialog-title>{{data.title}}</h2>
    <mat-dialog-content>
      <p>{{data.description}}</p>
      <p>Date: {{data.start | date:'medium'}}</p>
      <a *ngIf="data.meetingLink" [href]="data.meetingLink" target="_blank" mat-raised-button color="primary">
        <mat-icon>video_call</mat-icon>
        Join Meeting
      </a>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-height: 100px;
    }
    a {
      margin-top: 15px;
      text-decoration: none;
    }
  `]
})
export class MeetingDetailsDialog {
  constructor(
    public dialogRef: MatDialogRef<MeetingDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}