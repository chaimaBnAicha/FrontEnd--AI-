import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from 'src/app/service/request.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-request-management',
  templateUrl: './request-management.component.html',
  styleUrls: ['./request-management.component.css']
})
export class RequestManagementComponent implements OnInit, AfterViewInit {
  requests: any[] = [];
  filteredRequests: any[] = [];
  selectedStatus: string = '';
  map: any;
  markers: any[] = [];
  statistics: any;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  previousRequestCount = 0;
  //comparaison
  comparisonResults: any = null;  // Stocker les résultats de la comparaison
  selectedRequestsForComparison: number[] = [];  // Les IDs des projets sélectionnés


  constructor(
    private requestService: RequestService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    
  
    console.log("ngOnInit called");
    this.requestService.getAllRequest().subscribe((data) => {
        console.log("Data fetched: ", data);
        this.requests = data;
        this.filteredRequests = [...data];
        this.previousRequestCount = data.length;
        this.filterByStatus();
        this.addMarkersToMap();
        this.checkHighBudgetPendingRequests();
    });
    

    setInterval(() => {
        console.log("Checking for new requests...");
        this.checkForNewRequests();
    }, 30000);

    // Récupérer les statistiques des demandes avec le budget
    this.requestService.getRequestStatistics().subscribe(data => {
        this.statistics = data;
    });
   
    
}
playNotificationSound(): void {
  const audio = new Audio('assets/sounds/notification.mp3');
  audio.load();
  audio.play().then(() => {
    console.log("Son joué avec succès !");
  }).catch((error) => {
    console.log("Erreur lors de la lecture du son:", error);
  });
}


checkHighBudgetPendingRequests() {
  const today = new Date();
  const alerts = this.requests.filter(req => {
    const dateReq = new Date(req.date_creation);
    const diffDays = (today.getTime() - dateReq.getTime()) / (1000 * 3600 * 24);
    return req.estimated_budget > 1000000 && req.status === 'Pending' && diffDays >= 7;
  });

  if (alerts.length > 0) {
    this.toastr.warning(`⚠️ ${alerts.length} projets avec budget > 1M TND en attente depuis 7 jours`);
  }
}
  // Méthode pour sélectionner deux projets à comparer
 selectForComparison(requestId: number) {
  if (this.selectedRequestsForComparison.length < 2) {
    this.selectedRequestsForComparison.push(requestId);
  } else {
    this.selectedRequestsForComparison = [requestId]; // Réinitialiser si déjà deux projets sont sélectionnés
  }
}// Méthode pour comparer les projets sélectionnés
compareRequests() {
  if (this.selectedRequestsForComparison.length !== 2) {
    this.toastr.warning("Please select exactly two projects to compare.");
    return;
  }

  this.requestService.compareTwoRequests(this.selectedRequestsForComparison).subscribe((response) => {
    this.comparisonResults = response;
    this.toastr.success("Projects compared successfully!");
  }, error => {
    this.toastr.error("Error comparing projects.");
  });
}


  ngAfterViewInit() {
    this.initMap();
  }

  ngAfterViewChecked() {
    if (!this.map) {
      this.initMap();
    }
  }

  loadRequests() {
    this.requestService.getAllRequest().subscribe((data) => {
      console.log('Données récupérées :', data); 
      this.requests = data;
      this.filterByStatus(); // Filtrer les projets avant d'ajouter les marqueurs
    }, (error) => {
      console.error('Erreur lors de la récupération des demandes:', error);
    });
  }

  // Filtrer les demandes et mettre à jour la carte
  filterByStatus(): void {
    if (this.selectedStatus) {
      this.filteredRequests = this.requests.filter(req => req.status === this.selectedStatus);
    } else {
      this.filteredRequests = [...this.requests];
    }
    this.addMarkersToMap(); // Met à jour les marqueurs après filtrage
  }

  updateStatus(id_projet: number, status: string): void {
    if (status === 'Approved') {
      this.requestService.approveRequest(id_projet).subscribe(() => {
        this.loadRequests();
        this.toastr.success('Project approved successfully!');
        this.playNotificationSound(); // 🔊 jouer le son après approbation
      });
    } else if (status === 'Rejected') {
      this.requestService.rejectRequest(id_projet).subscribe(() => {
        this.loadRequests();
        this.toastr.error('Project rejected!');
        this.playNotificationSound(); // 🔊 jouer le son après rejet
      });
    }
  }
  
  

  deleteRequest(id_projet: number): void {
    this.requestService.deleteRequest(id_projet).subscribe(() => {
      this.loadRequests();
    });
  }

  viewDetails(id_projet: number) {
    this.router.navigate(['/admin/request-details', id_projet]);
  }

  // Initialisation de la carte
  initMap() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      this.map = new google.maps.Map(mapElement, {
        center: { lat: 36.8181, lng: 10.1655 },
        zoom: 12
      });
    } else {
      console.error('Erreur: élément de la carte introuvable.');
    }
  }

  // Ajouter les marqueurs avec couleurs dynamiques
  addMarkersToMap() {
    // Supprimer les anciens marqueurs avant d'ajouter les nouveaux
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    this.filteredRequests.forEach((request) => {
      const coords = request.geographic_location.split(',');
      const lat = parseFloat(coords[0].trim());
      const lng = parseFloat(coords[1].trim());

      // Déterminer la couleur du marqueur selon le statut
      const markerColor = this.getMarkerColor(request.status);

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        title: request.projectName,
        icon: {
          url: `http://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`
        }
      });

      this.markers.push(marker);

      // Ajouter un événement au clic sur le marqueur
      marker.addListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div>
              <h3>Project Name: ${request.projectName}</h3>
              <p>ID: ${request.id_projet}</p>
              <p>Status: <strong style="color:${markerColor}">${request.status}</strong></p>
              <button id="readMoreBtn_${request.id_projet}" class="readMoreBtn" style="color: blue; text-decoration: underline;">Read More</button>
            </div>`
        });

        infoWindow.open(this.map, marker);

        // Ajouter un écouteur pour le bouton Read More
        setTimeout(() => {
          const readMoreBtn = document.getElementById(`readMoreBtn_${request.id_projet}`);
          if (readMoreBtn) {
            readMoreBtn.addEventListener('click', () => {
              this.viewDetails(request.id_projet);
            });
          }
        }, 300);
      });
    });
  }

  // Fonction pour définir la couleur du marqueur
  getMarkerColor(status: string): string {
    switch (status) {
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      case 'Pending':
      default:
        return 'blue';
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/request-management']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      default:
        return 'black';
    }
  }

  get paginatedRequests() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page > 0 && page <= Math.ceil(this.filteredRequests.length / this.itemsPerPage)) {
      this.currentPage = page;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
  }

checkForNewRequests() {
  this.requestService.getAllRequest().subscribe((data) => {
    console.log("Ancienne requête : ", this.previousRequestCount);
    console.log("Nouvelle requête : ", data.length);

    if (data.length > this.previousRequestCount) {
      const newCount = data.length - this.previousRequestCount;
      console.log(`🆕 ${newCount} nouvelle(s) demande(s) de projet ajoutée(s) !`);

      // Afficher la notification
      this.toastr.info(`🆕 ${newCount} nouvelle(s) demande(s) de projet ajoutée(s)!`);
      this.playNotificationSound(); // 🎵 jouer le son

      this.requests = data;
      this.previousRequestCount = data.length;
      this.filterByStatus();
       // 👈 ajoute cette ligne ici
// 👈 ajoute cette ligne ici

    }
  });
}

  
  
  getRecommendationLabel(score: number): string {
    if (score >= 0.8) return 'Highly Recommended';
    if (score >= 0.5) return 'Moderately Recommended';
    return 'Not Recommended';
  }
  getRecommendationColor(score: number): string {
    if (score >= 0.8) {
      return 'green';
    } else if (score >= 0.5) {
      return 'yellow';
    } else {
      return 'red';
    }
  }
  // Ajouter une méthode pour obtenir l'icône selon le score de recommandation
getRecommendationIcon(score: number): string {
  if (score >= 0.8) {
    return 'fa fa-thumbs-up'; // Icône pour "Highly Recommended"
  } else if (score >= 0.5) {
    return 'fa fa-hand-paper'; // Icône pour "Moderately Recommended"
  } else {
    return 'fa fa-thumbs-down'; // Icône pour "Not Recommended"
  }
}
 
}


  
  

