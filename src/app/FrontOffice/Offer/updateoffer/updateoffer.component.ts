import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Offer, OfferStatus, TypeOffer } from 'src/app/models/offer.model';
import { OfferServiceService } from 'src/app/service/offer-service.service';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-updateoffer',
  templateUrl: './updateoffer.component.html',
  styleUrls: ['./updateoffer.component.css']
})
export class UpdateofferComponent implements OnInit {
  offerForm: FormGroup;
  offerId: number = 0;
  submitted = false;
  TypeOffer = TypeOffer;
  OfferStatus = OfferStatus;
  today: string;
  editorConfig = {
    base_url: '/tinymce',  // This is crucial for proper resource loading
    suffix: '.min',       // Ensures minified versions are loaded
    skin_url: '/tinymce/skins/ui/oxide',  // Explicit skin path
    content_css: '/tinymce/skins/content/default/content.min.css',
    height: 300,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
  };
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferServiceService,
    private authService : AuthService
  ) {
    this.today = new Date().toISOString().split('T')[0];
    
    this.offerForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      start_Date: [this.today, [Validators.required]],
      end_Date: ['', [Validators.required]],
      typeoffer: ['Insurance']
    }, {
      validators: this.dateValidator
    });
  }

  get f() {
    return this.offerForm.controls;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.offerId = +params['id'];
        this.loadOfferData();
      } else {
        console.error('No ID provided');
        this.router.navigate(['/admin/getoffer']);
      }
    });
  }
  loadOfferData() {
    if (!this.offerId) {
      console.error('Offer ID is missing');
      return;
    }
  
    this.offerService.getOfferById(this.offerId).subscribe({
      next: (offer) => {
        console.log('Received offer:', offer);
        // Format dates for the form
        const startDate = offer.Start_Date ? 
          new Date(offer.Start_Date).toISOString().split('T')[0] : '';
        const endDate = offer.End_Date ? 
          new Date(offer.End_Date).toISOString().split('T')[0] : '';
        
        // Set the form values, preserving HTML content
        this.offerForm.patchValue({
          title: offer.Title,
          description: offer.Description || '', // Ensure description is never undefined
          start_Date: startDate,
          end_Date: endDate,
          typeoffer: offer.Typeoffer
        });
  
        // Set the editor content after a short delay to ensure the editor is initialized
        setTimeout(() => {
          const editor = (window as any).tinymce.get('description');
          if (editor) {
            editor.setContent(offer.Description || '');
          }
        }, 100);
  
        console.log('Form values after patch:', this.offerForm.value);
      },
      error: (error) => {
        console.error('Error loading offer:', error);
      }
    });
  }
  onSubmit() {
    this.submitted = true;
  
    if (this.offerForm.invalid) {
      return;
    }
  
    // Get the token from the auth service (assumes it's stored somewhere like localStorage or sessionStorage)
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('Authentication token is missing');
      return;
    }
  
    // Prepare the formatted offer data
    const formattedOffer = {
      id_offer: this.offerId,
      user: {
        id: 1  // Default user id
      },
      description: this.offerForm.value.description,
      title: this.offerForm.value.title,
      status: "ACTIVE",
      start_Date: new Date(this.offerForm.value.start_Date).toISOString(),
      typeoffer: this.offerForm.value.typeoffer,
      end_Date: new Date(this.offerForm.value.end_Date).toISOString()
    };
  
    console.log('Submitting offer:', JSON.stringify(formattedOffer, null, 2));
  
    // Pass token in the headers when calling updateOffer
    this.offerService.updateOffer(this.offerId, formattedOffer, token).subscribe({
      next: () => {
        console.log('Offer updated successfully');
        this.router.navigate(['/admin/getoffer']);
      },
      error: (error) => {
        console.error('Error updating offer:', error);
        if (error.error) {
          console.error('Server error:', error.error);
        }
      }
    });
  }
  

  onCancel() {
    this.router.navigate(['/admin/getoffer']);
  }

  onReset() {
    this.submitted = false;
    this.loadOfferData();
  }

  // Custom validator for dates
  dateValidator(group: FormGroup): ValidationErrors | null {
    const start = group.get('start_Date')?.value;
    const end = group.get('end_Date')?.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (endDate <= startDate) {
        return { dateError: 'End date must be after start date' };
      }
    }
    return null;
  }

  // Add this method to handle end date min value
  onStartDateChange() {
    const startDateInput = this.offerForm.get('start_Date')?.value;
    if (startDateInput) {
      const endDateInput = document.getElementById('end_Date') as HTMLInputElement;
      if (endDateInput) {
        endDateInput.min = startDateInput;
      }
    }
  }

  // Update the dateError display in template
  getDateErrorMessage(): string {
    return this.offerForm.errors?.['dateError'] || '';
  }
}
