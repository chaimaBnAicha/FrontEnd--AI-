import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveService } from 'src/app/service/leave.service';
import { LeaveType, LeaveStatus } from 'src/app/models/leave.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { Leave } from 'src/app/models/leave.model';
import { AuthService } from 'src/app/services/auth.service';
import { lastValueFrom, throwError } from 'rxjs';

@Component({
  selector: 'app-addleave',
  templateUrl: './addleave.component.html',
  styleUrls: ['./addleave.component.css']
})
export class AddleaveComponent implements OnInit {
  leaveForm!: FormGroup;
  leaveTypes = Object.values(LeaveType);
  minDate: string;
  selectedFile: File | null = null;
  isUploading = false;
  uploadError: string | null = null;

  private apiUrl = 'http://localhost:8081/api/documents';

  editorConfig = {
    base_url: '/tinymce',
    suffix: '.min',
    height: 300,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatselect | ' +
      'bold italic forecolor backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
  };

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private router: Router,
    private authService : AuthService,
    private http: HttpClient
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.leaveForm = this.fb.group({
      start_date: ['', Validators.required],
      end_date: ['', [Validators.required]],
      type: ['', Validators.required],
      reason: ['', Validators.required],
      documentAttachement: [''],
      status: ['Pending'],
      user: [{ id: 1 }]
    }, { validator: this.dateValidator });
  }

  // Custom validator to check if end date is after start date
  dateValidator(group: FormGroup) {
    const start = group.get('start_date')?.value;
    const end = group.get('end_date')?.value;
    
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (endDate < startDate) {
        group.get('end_date')?.setErrors({ endDateInvalid: true });
        return { endDateInvalid: true };
      }
    }
    return null;
  }

  // Update end date min value when start date changes
  onStartDateChange() {
    const startDate = this.leaveForm.get('start_date')?.value;
    if (startDate) {
      this.leaveForm.get('end_date')?.setValue(''); // Reset end date
      const minEndDate = new Date(startDate);
      minEndDate.setDate(minEndDate.getDate() + 1);
      const endDateInput = document.getElementById('end_date') as HTMLInputElement;
      if (endDateInput) {
        endDateInput.min = minEndDate.toISOString().split('T')[0];
      }
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Don't set the form value yet - we'll do that after successful upload
    }
  }// In your component
  private async uploadDocument(): Promise<string> {
    if (!this.selectedFile) return '';
  
    // Check if the user is authenticated before proceeding
    if (!this.authService.isAuthenticated()) {
      throw new Error('Utilisateur non authentifié. Veuillez vous reconnecter.');
    }
  
    const token = this.authService.getToken();  // Retrieve token explicitly
  
    if (!token) {
      throw new Error('Token is missing or expired.');
    }
  
    const formData = new FormData();
    formData.append('file', this.selectedFile);
  
    try {
      // The token is manually added to the headers, overriding the interceptor if necessary
      const response = await lastValueFrom(
        this.http.post(`${this.apiUrl}/upload`, formData, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`  // Add the token to the headers
          }),
          responseType: 'text'
        })
      );
      return response;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }
  async onSubmit() {
    if (this.leaveForm.valid) {
      this.isUploading = true;
      this.uploadError = null;
  
      // Debug authentication status
      console.log('Auth status:', {
        hasToken: !!this.authService.getToken(),
        userId: this.authService.getUserIdFromToken(),
        isAuthenticated: this.authService.isAuthenticated()
      });
  
      try {
        // TEMPORARY WORKAROUND - using static ID 2
        const userId = 2; // Static ID workaround
        console.warn('Using temporary static user ID:', userId, '- Remove when backend is fixed');
  
        // Upload document if selected
        let documentFilename = '';
        if (this.selectedFile) {
          documentFilename = await this.uploadDocument();
        }
  
        // Prepare leave data
        const formattedLeave: Leave = {
          start_date: new Date(this.leaveForm.get('start_date')?.value).toISOString(),
          end_date: new Date(this.leaveForm.get('end_date')?.value).toISOString(),
          reason: this.leaveForm.get('reason')?.value,
          documentAttachement: documentFilename,
          type: this.leaveForm.get('type')?.value,
          status: 'Pending',
          user: { id: userId } // Using the static ID here
        };
  
        // Submit leave request
        this.leaveService.addLeave(formattedLeave).subscribe({
          next: () => {
            this.router.navigate(['/leave']);
          },
          error: (error) => {
            console.error('Leave submission error:', error);
            this.handleError(error);
          },
          complete: () => {
            this.isUploading = false;
          }
        });
  
      } catch (error) {
        this.handleError(error);
      }
    }
  }
  
  private handleError(error: any): void {
    this.isUploading = false;
    console.error('Error:', error);
    
    if (error.status === 401) {
      this.uploadError = 'Session expired. Please log in again.';
    } else {
      this.uploadError = error.message || 'An unexpected error occurred';
    }
  }

  onCancel() {
    this.router.navigate(['/leave']);
  }

  get f() {
    return this.leaveForm.controls;
  }
}
