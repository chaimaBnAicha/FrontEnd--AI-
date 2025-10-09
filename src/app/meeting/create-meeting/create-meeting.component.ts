import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeetingService } from '../../service/meeting.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent implements OnInit {
  meetingForm: FormGroup;
  isLoading = false;
  tacheId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.meetingForm = this.fb.group({
      subject: ['', Validators.required],
      description: ['', Validators.required],
      scheduledTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tacheId']) {
        this.tacheId = +params['tacheId'];
        this.meetingForm.patchValue({
          subject: params['subject'] || '',
          description: params['description'] || ''
        });
      }
    });
  }
  onSubmit() {
    if (this.meetingForm.valid && this.tacheId) {
      this.isLoading = true;
  
      const meetingData = {
        subject: this.meetingForm.value.subject,
        description: this.meetingForm.value.description,
        scheduledTime: new Date(this.meetingForm.value.scheduledTime).toISOString(),
        tache: { id: this.tacheId }
      };
  
      this.meetingService.createMeeting(meetingData).subscribe({
        next: (response) => {
          console.log('Meeting created:', response);
          this.router.navigate(['/get-all-tache']);
        },
        error: (error) => {
          console.error('Error creating meeting:', error);
          alert('Failed to create meeting');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
  
}
