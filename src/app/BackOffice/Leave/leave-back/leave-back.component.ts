import { Component, OnInit } from '@angular/core';
import { LeaveService } from 'src/app/service/leave.service';
import { Leave, LeaveStatus } from 'src/app/models/leave.model';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-leave-back',
  templateUrl: './leave-back.component.html',
  styleUrls: ['./leave-back.component.css']
})
export class LeaveBackComponent implements OnInit {
  leaves: Leave[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  originalLeaves: Leave[] = [];
  p: number = 1;
  itemsPerPage: number = 5;
  LeaveStatus = LeaveStatus; // Make enum available to template
  canAcceptMap: { [key: number]: boolean } = {};
  loadingMap: { [key: number]: boolean } = {};

  constructor(private leaveService: LeaveService
    , private authService : AuthService
  ) {}

  ngOnInit() {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getLeaves().subscribe({
      next: (data) => {
        this.leaves = data;
        this.originalLeaves = [...data];
        this.checkCanAcceptForAllLeaves(data);
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
      }
    });
  }

  private checkCanAcceptForAllLeaves(leaves: Leave[]) {
    leaves.forEach(leave => {
      const leaveId = leave.id;
      if (typeof leaveId === 'number') {
        this.loadingMap[leaveId] = true;
        this.leaveService.canAcceptLeave(leave).subscribe({
          next: (canAccept) => {
            this.canAcceptMap[leaveId] = canAccept;
            this.loadingMap[leaveId] = false;
          },
          error: (error) => {
            console.error('Error checking canAccept for leave:', leaveId, error);
            this.canAcceptMap[leaveId] = false;
            this.loadingMap[leaveId] = false;
          }
        });
      }
    });
  }

  onSearch() {
    this.leaves = [...this.originalLeaves];
    
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      this.leaves = this.leaves.filter(leave => 
        leave.reason.toLowerCase().includes(searchLower) ||
        leave.type.toLowerCase().includes(searchLower)
      );
    }

    if (this.statusFilter) {
      this.leaves = this.leaves.filter(leave => 
        leave.status === this.statusFilter
      );
    }
  }

  onStatusFilter() {
    this.onSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }

  onItemsPerPageChange() {
    this.p = 1;
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return new HttpHeaders(); // Empty headers if no token
    }
  
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  updateStatus(leave: Leave, newStatus: LeaveStatus) {
    if (leave.id) {
      const updatedLeave = { 
        ...leave, 
        status: newStatus,
        user: { id: 1 } // Ensure user is included
      };
  
      console.log('Attempting to update leave status:', updatedLeave);
  
      // Get the authentication headers
      const headers = this.createAuthHeaders();
  
      if (headers.keys().length === 0) {
        console.error('Authentication token missing');
        return;
      }
  
      this.leaveService.updateLeave(updatedLeave, headers).subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          // Recheck canAccept after status update
          this.checkCanAcceptForAllLeaves(this.leaves);
        },
        error: (error) => {
          console.error('Error updating leave status:', error);
          if (error.error) {
            console.error('Server error details:', error.error);
          }
        }
      });
    }
  }
  

  canAccept(leave: Leave): boolean {
    const leaveId = leave.id;
    if (typeof leaveId !== 'number') return false;
    
    // If we're still loading, return false to prevent premature enabling
    if (this.loadingMap[leaveId]) return false;
    
    return this.canAcceptMap[leaveId] === true;
  }

  isLoading(leave: Leave): boolean {
    const leaveId = leave.id;
    return typeof leaveId === 'number' && this.loadingMap[leaveId] === true;
  }

  downloadDocument(leave: Leave) {
    if (!leave.documentAttachement) return;
    
    leave.isDownloading = true;
    leave.downloadError = false;

    this.leaveService.downloadDocument(leave.documentAttachement)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = leave.documentAttachement || 'document';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          leave.isDownloading = false;
        },
        error: (error) => {
          console.error('Error downloading document:', error);
          leave.downloadError = true;
          leave.isDownloading = false;
        }
      });
  }
} 