import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvanceService } from 'src/app/service/advance.service';
import { Advance } from 'src/app/models/advance.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-update-advance',
  templateUrl: './update-advance.component.html',
  styleUrls: ['./update-advance.component.css']
})
export class UpdateAdvanceComponent implements OnInit {
  updateAdvanceForm!: FormGroup;
  advanceId!: number;

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
    private advanceService: AdvanceService,
    private router: Router,
    private route: ActivatedRoute,
    private authService : AuthService
  ) {}

  ngOnInit() {
    this.updateAdvanceForm = this.fb.group({
      amount_request: ['', [Validators.required, Validators.min(0)]],
      reason: ['', Validators.required],
      status: ['Pending']
    });

    // Get the advance ID from the route parameters
    this.route.params.subscribe(params => {
      this.advanceId = +params['id'];
      this.loadAdvance();
    });
  }

  loadAdvance() {
    this.advanceService.getAdvanceById(this.advanceId).subscribe({
      next: (advance: Advance) => {
        const cleanReason = this.stripHtmlTags(advance.reason);
        this.updateAdvanceForm.patchValue({
          amount_request: advance.amount_request,
          reason: cleanReason,
          status: advance.status
        });
      },
      error: (error) => {
        console.error('Error loading advance:', error);
      }
    });
  }
  
  onSubmit() {
    if (this.updateAdvanceForm.valid) {
      const formValue = {
        ...this.updateAdvanceForm.value,
        id: this.advanceId,
        requestDate: new Date().toISOString(),
        user: { id: 1 }
      };
  
      const token = this.authService.getToken(); // Ensure you have the token
  
      if (!token) {
        console.error('Token manquant pour la mise à jour de l\'avance');
        return;
      }
  
      this.advanceService.updateAdvance(formValue).subscribe({
        next: () => {
          this.router.navigate(['/advance']);
        },
        error: (error) => {
          console.error('Error updating advance:', error);
        }
      });
    }
  }
  

  onCancel() {
    this.router.navigate(['/advance']);
  }

  // Helper function to strip HTML tags
  private stripHtmlTags(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
}
