import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Insurance, Category } from '../insurance.interface';
import { InsuranceService } from '../insurance.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-insurance',
  templateUrl: './add-insurance.component.html',
  styleUrls: ['./add-insurance.component.css']
})
export class AddInsuranceComponent implements OnInit {
  insuranceForm: FormGroup;
  categories = Object.values(Category);
  editorConfig = {
    base_url: '/tinymce', // Make sure this matches your assets path
    suffix: '.min',
    height: 300,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'print', 'preview', 'anchor',
      'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'paste', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic backcolor | ' +
             'alignleft aligncenter alignright alignjustify | ' +
             'bullist numlist outdent indent | removeformat | help',
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
    private router: Router
  ) {
    this.insuranceForm = this.fb.group({
      Description: ['', Validators.required],
      start_Date: ['', Validators.required],
      end_Date: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required]
    });

    // Subscribe to form value changes for debugging
    this.insuranceForm.valueChanges.subscribe(value => {
      console.log('Form value:', value);
      console.log('Form valid:', this.insuranceForm.valid);
      console.log('Form errors:', this.insuranceForm.errors);
      Object.keys(this.insuranceForm.controls).forEach(key => {
        const control = this.insuranceForm.get(key);
        console.log(`${key} valid:`, control?.valid);
        console.log(`${key} errors:`, control?.errors);
      });
    });
  }

  ngOnInit(): void {}

  navigateToInsuranceList(): void {
    this.router.navigate(['/admin/insurance']);
  }

  onSubmit(): void {
    console.log('Form submitted');
    console.log('Form value:', this.insuranceForm.value);
    console.log('Form valid:', this.insuranceForm.valid);

    if (this.insuranceForm.valid) {
      const insuranceData: Insurance = {
        ...this.insuranceForm.value,
        description: this.insuranceForm.get('Description')?.value // Map Description to description
      };
      this.insuranceService.createInsurance(insuranceData).subscribe({
        next: () => {
          this.navigateToInsuranceList();
        },
        error: (error: Error) => {
          console.error('Error adding insurance:', error);
        }
      });
    }
  }
} 