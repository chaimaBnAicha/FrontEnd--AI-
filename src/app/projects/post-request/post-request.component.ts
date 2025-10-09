import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestService } from 'src/app/service/request.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

declare var google: any;

@Component({
  selector: 'app-post-request',
  templateUrl: './post-request.component.html',
  styleUrls: ['./post-request.component.css']
})
export class PostRequestComponent implements OnInit, AfterViewInit {
  userInfoForm!: FormGroup;
  projectInfoForm!: FormGroup;
  locationForm!: FormGroup;
  userInfo: any = {};
  map: any;
  marker: any;
  clickedCoordinates: any = null;

  constructor(
    private requestService: RequestService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadUserInfo();
  }

  private initForms() {
    this.userInfoForm = this.fb.group({
      user_firstName: [{ value: '', disabled: true }],
      user_last_name: [{ value: '', disabled: true }],
      user_email: [{ value: '', disabled: true }],
      user_phone: [{ value: '', disabled: true }],
    });
  
    this.projectInfoForm = this.fb.group({
      projectName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      estimated_budget: [null, [Validators.required, Validators.min(0)]],
      estimated_duration: [null, [Validators.required, Validators.min(1)]],
    });
  
    this.locationForm = this.fb.group({
      geographic_location: ['', [Validators.required]]
    });
  }

  private loadUserInfo() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.user) {
      this.userInfo = currentUser.user;
      this.patchUserForm();
    }
  }

  private patchUserForm() {
    this.userInfoForm.patchValue({
      user_firstName: this.userInfo.firstName,
      user_last_name: this.userInfo.lastName,
      user_email: this.userInfo.email,
      user_phone: this.userInfo.phoneNumber,
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Error: Map element not found.');
      return;
    }

    this.map = new google.maps.Map(mapElement, {
      center: { lat: 36.8181, lng: 10.1655 },
      zoom: 12,
    });

    this.map.addListener('click', (event: any) => {
      this.handleMapClick(event);
    });
  }

  private handleMapClick(event: any) {
    const latLng = event.latLng;
    this.clickedCoordinates = {
      lat: latLng.lat(),
      lng: latLng.lng(),
    };

    this.clearExistingMarker();
    this.createNewMarker(latLng);
    this.geocodeLocation(latLng);
  }

  private clearExistingMarker() {
    if (this.marker) {
      this.marker.setMap(null);
    }
  }

  private createNewMarker(latLng: any) {
    this.marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      title: 'Selected Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      },
    });
  }

  private geocodeLocation(latLng: any) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        this.clickedCoordinates['address'] = address;
        this.locationForm.patchValue({
          geographic_location: address,
        });
      } else {
        console.error('Geocoding failed:', status);
      }
    });
  }

  async onSubmit() {
    if (this.projectInfoForm.invalid || this.locationForm.invalid) {
      return;
    }

    const payload = this.createPayload();
    console.log('Submitting request:', payload);

    try {
      const response = await this.submitRequest(payload);
      console.log('Success:', response);
      this.router.navigate(['/all-request']);
    } catch (error) {
      console.error('Submission failed:', error);
      this.handleSubmissionError(error);
    }
  }

  private createPayload() {
    return {
      projectName: this.projectInfoForm.get('projectName')?.value,
      description: this.projectInfoForm.get('description')?.value,
      estimated_budget: this.projectInfoForm.get('estimated_budget')?.value,
      estimated_duration: this.projectInfoForm.get('estimated_duration')?.value,
      geographic_location: `${this.clickedCoordinates?.lat},${this.clickedCoordinates?.lng}`
    };
  }

  private async submitRequest(payload: any) {
    return await lastValueFrom(
      this.requestService.postRequest(payload).pipe(
        catchError(error => {
          console.error('API Error:', error);
          throw error;
        })
      )
    );
  }

  private handleSubmissionError(error: any) {
    if (error.status === 401 || error.status === 403) {
      this.router.navigate(['/login']);
    }
    // You can add more specific error handling here
  }
}