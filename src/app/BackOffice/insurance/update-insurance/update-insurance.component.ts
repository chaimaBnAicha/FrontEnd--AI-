import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Insurance, Category } from '../insurance.interface';
import { InsuranceService } from '../insurance.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-update-insurance',
  templateUrl: './update-insurance.component.html',
  styleUrls: ['./update-insurance.component.css']
})
export class UpdateInsuranceComponent implements OnInit {
  insuranceForm: FormGroup;
  categories = Object.values(Category);
  insuranceId?: number;
  editorConfig = {
    base_url: '/tinymce',
    suffix: '.min',
    skin_url: '/tinymce/skins/ui/oxide',
    content_css: '/tinymce/skins/content/default/content.min.css',
    height: 300,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'print', 'preview', 'anchor',
      'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'paste', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic backcolor | ' +
             'alignleft aligncenter alignright alignjustify | ' +
             'bullist numlist outdent indent | removeformat | help'
,
    setup: (editor: any) => {
      editor.on('change', () => {
        const content = editor.getContent();
        this.insuranceForm.get('Description')?.setValue(content);
      });
    }
  };

  constructor(
    private fb: FormBuilder,
    private insuranceService: InsuranceService,
    private router: Router,
    private route: ActivatedRoute,
    private authService : AuthService
  ) {
    this.insuranceForm = this.fb.group({
      Description: ['', Validators.required],
      start_Date: ['', Validators.required],
      end_Date: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.insuranceId = +params['id'];
      if (this.insuranceId) {
        this.loadInsurance(this.insuranceId);
      }
    });
  }

  loadInsurance(id: number): void {
    this.insuranceService.getInsuranceById(id).subscribe({
      next: (insurance) => {
        this.insuranceForm.patchValue({
          Description: insurance.description,
          start_Date: this.formatDate(insurance.start_Date),
          end_Date: this.formatDate(insurance.end_Date),
          amount: insurance.amount,
          category: insurance.category
        });
      },
      error: (error) => {
        console.error('Error loading insurance:', error);
      }
    });
  }
  private formatDate(date: Date | string): string {
    // Handle null/undefined cases
    if (!date) return '';
    
    // If it's already a formatted string (yyyy-MM-dd), return as-is
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    
    // If it's a Date object or ISO string, convert to yyyy-MM-dd format
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Fallback for any other case
    return '';
  }
  onSubmit(): void {
    if (this.insuranceForm.valid && this.insuranceId) {
      const insuranceData: Insurance = {
        ...this.insuranceForm.value,
        description: this.insuranceForm.get('Description')?.value
      };
  
      // Include the token logic when calling updateInsurance
      const token = this.authService.getToken();  // Get the token (replace with your method)
      
      // If the token is not available, you might want to handle the case (e.g., redirect to login)
      if (!token) {
        console.error('Authentication token is missing');
        return;
      }
  
      this.insuranceService.updateInsurance(this.insuranceId, insuranceData).subscribe({
        next: () => {
          this.router.navigate(['/admin/insurance']);
        },
        error: (error: Error) => {
          console.error('Error updating insurance:', error);
        }
      });
    }
  }
  

  navigateToInsuranceList(): void {
    this.router.navigate(['/admin/insurance']);
  }
} 