import { Component, OnInit } from '@angular/core';
import { AdvanceService } from 'src/app/service/advance.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-advance',
  templateUrl: './advance.component.html',
  styleUrls: ['./advance.component.css']
})
export class AdvanceComponent implements OnInit {
  advances: any[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  originalAdvances: any[] = [];

  constructor(private advanceService: AdvanceService, private router: Router) {}

  ngOnInit() {
    this.loadAdvances();
  }

  loadAdvances() {
    this.advanceService.getAdvances().subscribe({
      next: (data) => {
        this.advances = data;
        this.originalAdvances = [...data]; // Store original data
      },
      error: (error) => {
        console.error('Error loading advances:', error);
      }
    });
  }
  

  onEdit(advance: any) {
    this.router.navigate(['/update-advance', advance.id]);
  }
  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this advance?')) {
      this.advanceService.deleteAdvance(id).subscribe({
        next: () => {
          this.loadAdvances(); // Reload advances after deletion
        },
        error: (error) => {
          console.error('Error deleting advance:', error);
        }
      });
    }
  }
  

  onSearch() {
    this.filterAdvances();
  }

  onStatusFilter() {
    this.filterAdvances();
  }

  filterAdvances() {
    this.advances = [...this.originalAdvances]; // Start with original data

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      this.advances = this.advances.filter(advance => 
        advance.reason.toLowerCase().includes(searchLower) ||
        advance.amount_request.toString().includes(searchLower)
      );
    }

    if (this.statusFilter) {
      this.advances = this.advances.filter(advance => 
        advance.status === this.statusFilter
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterAdvances();
  }
  p: number = 1;
  itemsPerPage: number = 5;

  // Add this method
  onItemsPerPageChange() {
    this.p = 1; // Reset to first page when items per page changes
  }
}
