import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-meeting-dialog',
  template: `
  
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin-bottom: 15px;
    }
  `]
})
export class CreateMeetingDialog {
  meetingForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateMeetingDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.meetingForm = this.fb.group({
      subject: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.meetingForm.valid) {
      this.dialogRef.close({
        ...this.meetingForm.value,
        scheduledTime: this.data.start
      });
    }
  }
}