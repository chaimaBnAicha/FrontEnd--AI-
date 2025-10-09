import { Component, OnInit } from '@angular/core';
import { RequestService } from 'src/app/service/request.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-get-all-request',
  templateUrl: './get-all-request.component.html',
  styleUrls: ['./get-all-request.component.css']
})
export class GetAllRequestComponent implements OnInit {

  requests: any[] = []; // Toutes les requêtes
  filteredRequests: any[] = []; // Requêtes filtrées
  searchText: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private requestService: RequestService,
    private authService: AuthService
  ) { }
  ngOnInit(): void {
    this.getAllRequest();
  }

getAllRequest(): void {
  const currentUser = this.authService.getCurrentUser();
  const currentUserId = currentUser?.user?.id;

  console.log("Current User IDddddddd:", currentUserId);

  this.requestService.getAllRequest().subscribe(
    (res: any[]) => {
    
      this.requests = res.filter(
        request => request.status === 'Pending' && request.user_id === currentUserId
      );

      this.filteredRequests = [...this.requests];
    },
    (error) => {
      console.error('Erreur lors de la récupération des requêtes:', error);
    }
  );
}


  
  deleteRequest(id_projet: number): void {
    this.requestService.deleteRequest(id_projet).subscribe(
      () => {
        this.getAllRequest();
      },
      (error) => {
        console.error('Erreur lors de la suppression de la requête:', error);
      }
    );
  }

  filterRequests(): void {
    this.filteredRequests = this.requests.filter(request =>
      request.projectName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      request.description.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.currentPage = 1; // Reset page when filtering
  }

  get paginatedRequests(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array(Math.ceil(this.filteredRequests.length / this.itemsPerPage)).fill(0).map((x, i) => i + 1);
  }

  setPage(page: number): void {
    this.currentPage = page;
  }
}
