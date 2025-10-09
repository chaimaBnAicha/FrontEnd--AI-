import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdvanceService } from 'src/app/service/advance.service';

@Component({
  selector: 'app-add-advance',
  templateUrl: './add-advance.component.html',
  styleUrls: ['./add-advance.component.css']
})
export class AddAdvanceComponent implements OnInit {
  postAdvanceForm!: FormGroup;

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
    private advanceService: AdvanceService, 
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.postAdvanceForm = this.fb.group({
      amount_request: ['', [Validators.required, Validators.min(0)]],
      requestDate: [{value: today, disabled: true}],
      reason: ['', Validators.required],
      status: ['Pending']
    });
  }
  onSubmit() {
    if (this.postAdvanceForm.valid) {
      const formValue = {
        ...this.postAdvanceForm.getRawValue(),
        requestDate: new Date().toISOString(),
        user: { id: 1 }
      };
  
      this.advanceService.addAdvance(formValue).subscribe({
        next: (response) => {
          console.log('Advance added successfully', response);
          this.router.navigate(['/advance']);
        },
        error: (error) => {
          console.error('Error adding advance', error);
        }
      });
    }
  }
  
  get f() {
    return this.postAdvanceForm.controls;
  }

  onCancel() {
    this.router.navigate(['/advance']);
  }
}
