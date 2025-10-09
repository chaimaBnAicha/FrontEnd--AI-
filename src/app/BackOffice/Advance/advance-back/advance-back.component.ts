import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AdvanceService } from 'src/app/service/advance.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-advance-back',
  templateUrl: './advance-back.component.html',
  styleUrls: ['./advance-back.component.css']
})
export class AdvanceBackComponent implements OnInit {
  advances: any[] = [];
  approvalStatus: { [key: number]: boolean } = {};  // Store approval status for each advance
  originalAdvances: any[] = [];
  searchTerm: string = '';
  statusFilter: string = '';

  constructor(private advanceService: AdvanceService,
    private authService : AuthService
  ) {}

  ngOnInit() {
    this.loadAdvances();
  }

  loadAdvances() {
    this.advanceService.getAdvances().subscribe({
      next: (data) => {
        console.log('Loaded advances:', data);
        this.advances = data;
        this.originalAdvances = [...data]; // Store original data
        // Check approval status for each advance
        this.advances.forEach(advance => {
          this.checkApprovalStatus(advance.id);
        });
      },
      error: (error) => {
        console.error('Error fetching advances:', error);
      }
    });
  }
  checkApprovalStatus(advanceId: number) {
    const token = this.authService.getToken(); // Retrieve the token
    
    if (!token) {
      console.error('Utilisateur non authentifié.');
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    this.advanceService.canApproveAdvance(advanceId, headers).subscribe({
      next: (canApprove) => {
        console.log(`Approval status for advance ${advanceId}: ${canApprove}`);
        this.approvalStatus[advanceId] = canApprove;
      },
      error: (error) => {
        console.error('Error checking approval status:', error);
      }
    });
  }
  
  
  onApprove(id: number) {
    if (confirm('Are you sure you want to approve this advance?')) {
      const token = this.authService.getToken(); // Retrieve the token
  
      if (!token) {
        console.error('Utilisateur non authentifié.'); // Log an error if no token is found
        return; // Exit the function if not authenticated
      }
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}` // Add the token to the headers
      });
  
      // Proceed with updating the advance status and notifying the user
      this.advanceService.updateAdvanceStatus(id, 'Approved', headers).subscribe({
        next: () => {
          // Send notification email
          this.advanceService.notifyUser(id, 'Approved', "Syrine.zaier@esprit.tn", headers).subscribe({
            next: () => {
              console.log('Notification sent successfully');
            },
            error: (error) => {
              console.error('Error sending notification:', error);
            }
          });
          this.loadAdvances();
        },
        error: (error) => {
          console.error('Error approving advance:', error);
        }
      });
    }
  }
  

  onReject(id: number) {
    if (confirm('Are you sure you want to reject this advance?')) {
      const token = this.authService.getToken(); // Retrieve the token
  
      if (!token) {
        console.error('Utilisateur non authentifié.'); // Log an error if no token is found
        return; // Exit the function if not authenticated
      }
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}` // Add the token to the headers
      });
  
      // Proceed with updating the advance status and notifying the user
      this.advanceService.updateAdvanceStatus(id, 'Rejected', headers).subscribe({
        next: () => {
          // Send notification email
          this.advanceService.notifyUser(id, 'Rejected', "Syrine.zaier@esprit.tn", headers).subscribe({
            next: () => {
              console.log('Notification sent successfully');
            },
            error: (error) => {
              console.error('Error sending notification:', error);
            }
          });
          this.loadAdvances();
        },
        error: (error) => {
          console.error('Error rejecting advance:', error);
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
