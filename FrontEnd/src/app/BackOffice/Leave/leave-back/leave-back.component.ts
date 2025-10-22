import { Component, OnInit } from '@angular/core';
import { LeaveService } from 'src/app/Service/leave.service';
import { LeaveAIService } from 'src/app/Service/leave-ai.service';
import { Leave, LeaveStatus } from 'src/app/models/leave.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeaveAnalysisModalComponent } from './leave-analysis-modal.component';

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
  LeaveStatus = LeaveStatus;
  canAcceptMap: { [key: string]: boolean } = {};
  loadingMap: { [key: string]: boolean } = {};
  aiAnalysis: { [key: string]: {
    confidenceScore: number;
    analysisResult: string;
    recommendedApproval: boolean;
  } } = {};

  constructor(
    private leaveService: LeaveService,
    private leaveAIService: LeaveAIService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getLeaves().subscribe({
      next: (data) => {
        console.log('Leaves loaded:', data); // Debug log
        this.leaves = data;
        this.originalLeaves = [...data];
        this.checkCanAcceptForAllLeaves(data);
        
        // Process each leave one by one for AI analysis
        data.forEach(leave => {
          if (leave.id) {
            this.analyzeLeave(leave);
          }
        });
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
      }
    });
  }

  private analyzeLeave(leave: Leave) {
    const leaveId = leave.id?.toString() || '';
    console.log('Analyzing leave:', leaveId, leave); // Debug log
    
    // Set a loading state
    this.aiAnalysis[leaveId] = {
      confidenceScore: 0,
      analysisResult: 'Loading...',
      recommendedApproval: false
    };
    
    this.leaveAIService.analyzeLeaveRequest(leave).subscribe({
      next: (analysis) => {
        console.log('AI analysis received for leave:', leaveId, analysis);
        this.aiAnalysis[leaveId] = analysis;
      },
      error: (error) => {
        console.error('Error getting AI analysis for leave:', leaveId, error);
        // Set error state in analysis
        this.aiAnalysis[leaveId] = {
          confidenceScore: 0,
          analysisResult: 'Error analyzing leave request. Please try again.',
          recommendedApproval: false
        };
      }
    });
  }

  private analyzeAllLeaves(leaves: Leave[]) {
    leaves.forEach(leave => {
      if (leave.id) {
        const leaveId = leave.id.toString();
        this.leaveAIService.analyzeLeaveRequest(leave).subscribe({
          next: (analysis) => {
            this.aiAnalysis[leaveId] = analysis;
          },
          error: (error) => {
            console.error('Error getting AI analysis:', error);
          }
        });
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

  updateStatus(leave: Leave, newStatus: LeaveStatus) {
    if (leave.id) {
      const updatedLeave = { 
        ...leave, 
        status: newStatus,
        user: { id: 1 } // Ensure user is included
      };
      
      console.log('Attempting to update leave status:', updatedLeave);
      
      this.leaveService.updateLeave(updatedLeave).subscribe({
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

  openAiModal(leave: Leave) {
    const leaveId = leave.id?.toString() || '';
    if (this.aiAnalysis[leaveId]) {
      const modalRef = this.modalService.open(LeaveAnalysisModalComponent, {
        centered: true,
        backdrop: 'static',
        keyboard: false
      });
      modalRef.componentInstance.analysis = this.aiAnalysis[leaveId];
    }
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