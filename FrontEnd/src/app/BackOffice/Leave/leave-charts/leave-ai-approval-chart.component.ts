import { Component, OnInit } from '@angular/core';
import { LeaveService } from 'src/app/Service/leave.service';
import { LeaveAIService } from 'src/app/Service/leave-ai.service';
import { Leave } from 'src/app/models/leave.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-leave-ai-approval-chart',
  template: `
    <div class="card">
      <div class="card-header bg-gradient-primary text-white">
        <h4 class="mb-0">AI Recommendation Analysis</h4>
      </div>
      <div class="card-body">
        <div *ngIf="loading" class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Analyzing leave requests...</p>
        </div>
        
        <div *ngIf="!loading">
          <div class="mb-4">
            <h5 class="text-muted">AI Approval Rate</h5>
            <div class="progress" style="height: 25px;">
              <div 
                class="progress-bar bg-success" 
                [style.width.%]="approvalPercentage"
                role="progressbar"
                [attr.aria-valuenow]="approvalPercentage" 
                aria-valuemin="0" 
                aria-valuemax="100">
                {{ approvalPercentage }}%
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-md-6">
              <div class="card shadow-sm">
                <div class="card-body">
                  <h6 class="text-success">Recommended Approvals</h6>
                  <h2>{{ approvedCount }}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card shadow-sm">
                <div class="card-body">
                  <h6 class="text-danger">Not Recommended</h6>
                  <h2>{{ rejectedCount }}</h2>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4">
            <h5 class="text-muted">Average Confidence Score</h5>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LeaveAiApprovalChartComponent implements OnInit {
  loading = true;
  approvalPercentage = 0;
  approvedCount = 0;
  rejectedCount = 0;
  averageConfidence = 0;
  
  constructor(
    private leaveService: LeaveService,
    private leaveAIService: LeaveAIService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    this.leaveService.getLeaves().subscribe({
      next: (leaves) => {
        if (leaves.length === 0) {
          this.loading = false;
          return;
        }
        
        const analysisRequests = leaves.map(leave => 
          this.leaveAIService.analyzeLeaveRequest(leave).pipe(
            catchError(() => of({
              confidenceScore: 0,
              analysisResult: 'Error analyzing',
              recommendedApproval: false
            }))
          )
        );
        
        forkJoin(analysisRequests).subscribe({
          next: (results) => {
            this.processResults(results);
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private processResults(results: any[]) {
    const approved = results.filter(r => r.recommendedApproval);
    this.approvedCount = approved.length;
    this.rejectedCount = results.length - approved.length;
    
    if (results.length > 0) {
      this.approvalPercentage = Math.round((approved.length / results.length) * 100);
      
      const totalConfidence = results.reduce((sum, curr) => sum + curr.confidenceScore, 0);
      this.averageConfidence = totalConfidence / results.length;
    }
  }
}