import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-analysis-modal',
  template: `
    <div class="modal-header bg-gradient-primary text-white">
      <h4 class="modal-title d-flex align-items-center">
        <i class="fas fa-brain fa-lg me-2"></i>
        AI Analysis Results
      </h4>
      <button type="button" class="btn-close btn-close-white" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
      </button>
    </div>
    <div class="modal-body p-4">
      <div class="mb-4">
        <label class="h6 mb-3">Confidence Score:</label>
        <div class="progress" style="height: 20px;">
          <div class="progress-bar"
               [class.bg-success]="analysis.confidenceScore > 0.7"
               [class.bg-warning]="analysis.confidenceScore > 0.4 && analysis.confidenceScore <= 0.7"
               [class.bg-danger]="analysis.confidenceScore <= 0.4"
               [style.width.%]="analysis.confidenceScore * 100"
               style="transition: width 0.5s ease-in-out;">
            <strong>{{analysis.confidenceScore | percent}}</strong>
          </div>
        </div>
      </div>
      <div class="mb-4">
        <label class="h6 mb-2">Analysis:</label>
        <div class="p-3 bg-light rounded">
          <p class="mb-0">{{analysis.analysisResult}}</p>
        </div>
      </div>
      <div>
        <label class="h6 mb-2">Recommendation:</label>
        <div class="d-flex align-items-center">
          <span class="badge rounded-pill px-3 py-2"
                [class.bg-success]="analysis.recommendedApproval"
                [class.bg-danger]="!analysis.recommendedApproval">
            <i class="fas" [class.fa-check-circle]="analysis.recommendedApproval" [class.fa-times-circle]="!analysis.recommendedApproval"></i>
            <span class="ms-2">{{analysis.recommendedApproval ? 'Recommended for Approval' : 'Not Recommended'}}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close('Close click')">
        <i class="fas fa-times me-2"></i>Close
      </button>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class LeaveAnalysisModalComponent {
  @Input() analysis: any;

  constructor(public activeModal: NgbActiveModal) {}
}