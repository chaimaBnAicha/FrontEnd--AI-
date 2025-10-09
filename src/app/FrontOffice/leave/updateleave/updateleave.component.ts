import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveService } from 'src/app/service/leave.service';
import { LeaveType, LeaveStatus, Leave } from 'src/app/models/leave.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-updateleave',
  templateUrl: './updateleave.component.html',
  styleUrls: ['./updateleave.component.css']
})
export class UpdateleaveComponent implements OnInit {
  leaveForm!: FormGroup;
  leaveId!: number;
  leaveTypes = Object.values(LeaveType);
  minDate: string;
  currentDocument: string | undefined = undefined;
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
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService : AuthService
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.leaveId = this.route.snapshot.params['id'];
    this.initForm();
    this.loadLeave(this.leaveId);
  }

  initForm() {
    this.leaveForm = this.fb.group({
      id: [this.leaveId],
      start_date: ['', Validators.required],
      end_date: ['', [Validators.required]],
      type: ['', Validators.required],
      reason: ['', Validators.required],
      documentAttachement: [''],
      status: [LeaveStatus.PENDING]
    }, { validator: this.dateValidator });
  }
  loadLeave(id: number) {
    this.leaveService.getLeaveById(id).subscribe({
      next: (leave) => {
        // Convert dates from ISO format to yyyy-MM-dd format for the date inputs
        const startDate = leave.start_date ? new Date(leave.start_date).toISOString().split('T')[0] : '';
        const endDate = leave.end_date ? new Date(leave.end_date).toISOString().split('T')[0] : '';
        
        this.leaveForm.patchValue({
          start_date: startDate,
          end_date: endDate,
          type: leave.type,
          reason: leave.reason,
          status: leave.status
        });
        this.currentDocument = leave.documentAttachement;
      },
      error: (error) => {
        console.error('Error loading leave:', error);
      }
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Don't update form value yet - wait for successful upload
    }
  }

  private uploadDocument(): Promise<string> {
    if (!this.selectedFile) {
      return Promise.resolve(this.currentDocument || ''); // Keep existing document if no new file
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}/upload`, formData, {
        responseType: 'text'
      }).subscribe({
        next: (filename: string) => resolve(filename),
        error: (error) => reject(error)
      });
    });
  }
  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return new HttpHeaders(); // Empty headers if no token
    }
  
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  async onSubmit() {
    if (this.leaveForm.valid) {
      this.isUploading = true;
      this.uploadError = null;
  
      try {
        const documentFilename = await this.uploadDocument();
  
        const leave: Leave = {
          id: this.leaveId,
          start_date: this.leaveForm.get('start_date')?.value,
          end_date: this.leaveForm.get('end_date')?.value,
          type: this.leaveForm.get('type')?.value,
          reason: this.leaveForm.get('reason')?.value,
          documentAttachement: documentFilename || this.leaveForm.get('documentAttachement')?.value,
          status: this.leaveForm.get('status')?.value,
          user: { id: 1 }
        };
  
        const headers = this.createAuthHeaders();
  
        if (headers.keys().length === 0) {
          console.error('Authentication token missing');
          this.uploadError = 'Authentication token missing';
          return;
        }
  
        this.leaveService.updateLeave(leave, headers).subscribe({
          next: () => {
            this.router.navigate(['/leave']);
          },
          error: (error) => {
            console.error('Error updating leave:', error);
            this.uploadError = 'Failed to update leave request';
          }
        });
      } catch (error) {
        console.error('Error uploading document:', error);
        this.uploadError = 'Failed to upload document';
      } finally {
        this.isUploading = false;
      }
    }
  }
  
  onCancel() {
    this.router.navigate(['/leaves']);
  }

  get f() {
    return this.leaveForm.controls;
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

  hasDocument(): boolean {
    return !!this.currentDocument;
  }
}
