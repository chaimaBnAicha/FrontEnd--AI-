import { Component, OnInit } from '@angular/core';
import { Offer, OfferStatus } from 'src/app/models/offer.model';
import { OfferServiceService } from 'src/app/service/offer-service.service';

@Component({
  selector: 'app-view-offers',
  templateUrl: './view-offers.component.html',
  styleUrls: ['./view-offers.component.css']
})
export class ViewOffersComponent implements OnInit {
  offers: Offer[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedOffer: Offer | null = null;
  showModal: boolean = false;

  // Pagination properties
  currentPage = 1;
  pageSize = 6; // Show 6 offers per page for the grid layout
  Math = Math; // For use in template

  constructor(private offerService: OfferServiceService) { }

  ngOnInit(): void {
    this.loadOffers();
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.offers.length / this.pageSize);
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
    return this.offers.slice(start, end);
  }

  loadOffers(): void {
    this.loading = true;
    this.error = null;
    
    this.offerService.getAllOffers().subscribe({
      next: (data) => {
        console.log('Received offers:', data);
        // Filter only active offers
        this.offers = data.filter(offer => offer.Status === OfferStatus.ACTIVE);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching offers:', error);
        this.error = 'Failed to load offers. Please try again later.';
        this.loading = false;
      }
    });
  }

  viewOfferDetails(offerId: number): void {
    this.selectedOffer = this.offers.find(offer => offer.id_offer === offerId) || null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOffer = null;
  }

  isActive(status: OfferStatus): boolean {
    return status === OfferStatus.ACTIVE;
  }
}
