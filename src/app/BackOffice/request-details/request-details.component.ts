import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from 'src/app/service/request.service';
import { AnalysisService } from 'src/app/service/analysis-service.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { JustificationService } from 'src/app/service/justification-service.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.component.html',
  styleUrls: ['./request-details.component.css']
})
export class RequestDetailsComponent implements OnInit {
  requestDetails: any;
  userInfo: any;
  map!: google.maps.Map;
  markers: any[] = [];
  analysisResult: any;
  isDescriptionModalVisible = false;
  justificationText: string = '';
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  isSubmitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private analysisService: AnalysisService,
    private justificationService: JustificationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id_projet = this.route.snapshot.paramMap.get('id_projet');
    console.log('Loading request details for:', id_projet);  // Debug
    if (id_projet) {
      this.loadRequestDetails(Number(id_projet));
    }
  }
  loadRequestDetails(id_projet: number): void {
    this.requestService.getRequestDetails(id_projet).subscribe(
      (data) => {
        this.requestDetails = data || {};
        if (this.requestDetails?.user_id) {
          // Call loadUserInfo with userId from project details
          this.loadUserInfo(this.requestDetails.user_id);
        }
        if (this.requestDetails?.geographic_location) {
          this.loadMap(this.requestDetails.geographic_location);
        }
      },
      (error) => {
        this.requestDetails = {};
        console.error('Error loading request details:', error);
      }
    );
  }
  
  loadUserInfo(userId: number): void {
    this.requestService.getUserInfo(userId).subscribe(
      (data) => {
        console.log('User Info:', data);
        this.userInfo = data || {};
      },
      (error) => {
        this.userInfo = {};
        console.error('Error loading user info:', error);
      }
    );
  }
  

  loadMap(location: string): void {
    if (!location) {
      console.error('La localisation est vide');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const mapOptions: google.maps.MapOptions = {
          center: results[0].geometry.location,
          zoom: 15
        };

        const mapElement = document.getElementById('map');
        if (mapElement) {
          this.map = new google.maps.Map(mapElement, mapOptions);

          const marker = new google.maps.Marker({
            position: results[0].geometry.location,
            map: this.map,
            title: location,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });

          this.markers.push({ id_projet: this.requestDetails.id_projet, marker });
        } else {
          console.error("L'élément de la carte est introuvable");
        }
      } else {
        console.error('La géolocalisation a échoué : ' + status);
      }
    });
  }addJustification(id_projet: number): void {
    if (this.justificationText.trim()) {
      const token = this.authService.getToken();
  
      if (!token) {
        console.error('No authentication token available.');
        return;
      }
  
      this.justificationService.addJustification(id_projet, this.justificationText, token).subscribe(
        (response) => {
          console.log('Justification ajoutée avec succès:', response);
          this.isSubmitted = true;
        },
        (error) => {
          console.error('Erreur lors de l\'ajout de la justification:', error);
        }
      );
    } else {
      console.log('Aucune justification à ajouter.');
    }
  }
  

  isDisabled(): boolean {
    return this.isSubmitted;
  }
  showDescriptionAnalysis(): void {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('No authentication token available.');
      return;
    }
  
    this.analysisService.analyzeDescription(this.requestDetails.description, token).subscribe(
      (analysis) => {
        console.log('Analyse de la description:', analysis);
        this.analysisResult = analysis;
        this.isDescriptionModalVisible = true;
      },
      (error) => {
        console.error('Erreur dans la récupération de l\'analyse:', error);
      }
    );
  }
  

  closeDescriptionModal(): void {
    this.isDescriptionModalVisible = false;
  }

  updateStatus(id_projet: number, status: string): void {
    const updateFn = status === 'Approved' ? this.requestService.approveRequest : this.requestService.rejectRequest;
    updateFn.call(this.requestService, id_projet).subscribe(() => {
      this.loadRequestDetails(id_projet);
      this.updateMarkerColor(id_projet, status === 'Approved' ? 'green' : 'red');
      this.addJustification(id_projet);
      this.isSubmitted = true;
    });
  }

  updateMarkerColor(id_projet: number, color: string): void {
    const markerData = this.markers.find(m => m.id_projet === id_projet);
    if (markerData) {
      markerData.marker.setIcon(`http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/project-manager']);
  }

  downloadPDF(): void {
    const element = this.pdfContent?.nativeElement;

    if (!element) {
      console.error('PDF content element not found');
      return;
    }

    const buttons = document.querySelectorAll('button');
    buttons.forEach((button) => {
      button.style.display = 'none';
    });

    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.style.display = 'none';
    }

    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      const pageHeight = pdf.internal.pageSize.height;
      const margin = 10;
      const signatureText = "Signature";
      pdf.text(signatureText, pdf.internal.pageSize.width - margin - pdf.getTextWidth(signatureText), pageHeight - margin);

      pdf.save('request-details.pdf');

      buttons.forEach((button) => {
        button.style.display = 'inline-block';
      });

      if (mapElement) {
        mapElement.style.display = 'block';
      }
    });
  }
}
