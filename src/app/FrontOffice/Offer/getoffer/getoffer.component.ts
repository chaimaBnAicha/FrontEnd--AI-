import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Offer, OfferStatus, TypeOffer } from 'src/app/models/offer.model';
import { OfferServiceService } from 'src/app/service/offer-service.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-getoffer',
  templateUrl: './getoffer.component.html',
  styleUrls: ['./getoffer.component.css']
})
export class GetofferComponent implements OnInit {
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  filters = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: '',
    status: ''
  };
  searchTerm: string = '';
  TypeOffer = TypeOffer;
  OfferStatus = OfferStatus;
  isLoading = false;
  error: string | null = null;
  
  // Pagination properties
  currentPage = 1;
  pageSize = 5;
  Math = Math; // For use in template

  constructor(
    private offerService: OfferServiceService,
    private router: Router,
    private authService : AuthService
  ) { }

  ngOnInit(): void {
    this.loadOffers();
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.filteredOffers.length / this.pageSize);
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo(0, 0);
    }
  }

  get paginatedOffers(): Offer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredOffers.slice(start, end);
  }
  loadOffers() {
    this.isLoading = true;
    this.error = null;
  
    const token = this.authService.getToken();  // Get the token (replace with your method)
  
    // If the token is missing, you can handle the case accordingly
    if (!token) {
      console.error('Authentication token is missing');
      this.error = 'Authentication token is missing. Please log in again.';
      this.isLoading = false;
      return;
    }
  
    this.offerService.getAllOffers().subscribe({
      next: (data) => {
        console.log('Component received data:', {
          length: data.length,
          firstItem: data[0],
          allData: data
        });
        this.offers = data;
        this.filteredOffers = data; // Initialize filtered offers
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.isLoading = false;
        this.error = error.message || 'An error occurred while loading offers.';
      }
    });
  }
  

  applyFilters() {
    this.filteredOffers = this.offers.filter(offer => {
      const titleMatch = !this.filters.title || 
        offer.Title.toLowerCase().includes(this.filters.title.toLowerCase());
      const descriptionMatch = !this.filters.description || 
        offer.Description.toLowerCase().includes(this.filters.description.toLowerCase());
      const startDateMatch = !this.filters.startDate || 
        new Date(offer.Start_Date!) >= new Date(this.filters.startDate);
      const endDateMatch = !this.filters.endDate || 
        new Date(offer.End_Date!) <= new Date(this.filters.endDate);
      const typeMatch = !this.filters.type || 
        offer.Typeoffer === this.filters.type;
      const statusMatch = !this.filters.status || 
        offer.Status === this.filters.status;

      return titleMatch && descriptionMatch && startDateMatch && 
             endDateMatch && typeMatch && statusMatch;
    });
  }

  onSearch(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.filters[field as keyof typeof this.filters] = value;
    this.currentPage = 1; // Reset to first page when filtering
    this.applyFilters();
  }

  // Navigate to edit page
  editOffer(id: number | undefined) {
    if (id) {
      this.router.navigate(['/admin/updateoffer', id]);
    } else {
      console.error('Cannot edit offer: ID is undefined');
    }
  }
  deleteOffer(id: number | undefined) {
    if (id && confirm('Are you sure you want to delete this offer?')) {
      // Retrieve the token from the authentication service
      const token = this.authService.getToken();
  
      if (!token) {
        console.error('Authentication token is missing');
        return;
      }
  
      this.offerService.deleteOffer(id, token).subscribe({
        next: () => {
          console.log('Offer deleted successfully');
          this.loadOffers(); // Reload the offers after deletion
        },
        error: (error) => {
          console.error('Error deleting offer:', error);
        }
      });
    }
  }
  

  // Add this method
  navigateToAddOffer() {
    this.router.navigate(['/admin/addoffer']);
  }
}
