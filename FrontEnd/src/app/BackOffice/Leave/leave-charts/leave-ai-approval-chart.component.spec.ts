import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { PercentPipe, CommonModule } from '@angular/common';

import { LeaveAiApprovalChartComponent } from './leave-ai-approval-chart.component';
import { LeaveService } from 'src/app/Service/leave.service';
import { LeaveAIService } from 'src/app/Service/leave-ai.service';
import { Leave } from 'src/app/models/leave.model';

describe('LeaveAiApprovalChartComponent', () => {
  let component: LeaveAiApprovalChartComponent;
  let fixture: ComponentFixture<LeaveAiApprovalChartComponent>;
  let leaveService: jasmine.SpyObj<LeaveService>;
  let leaveAIService: jasmine.SpyObj<LeaveAIService>;

  // Mock data
  const mockLeaves: Leave[] = [
    {
      id: 1,
      start_date: '2025-10-01',
      end_date: '2025-10-05',
      reason: 'Vacation',
      documentAttachement: 'vacation.pdf',
      type: 'Unpaid',
      status: 'Pending',
      user: { id: 1 }
    },
    {
      id: 2,
      start_date: '2025-10-10',
      end_date: '2025-10-12',
      reason: 'Doctor appointment',
      documentAttachement: 'medical.pdf',
      type: 'Sick',
      status: 'Pending',
      user: { id: 1 }
    },
    {
      id: 3,
      start_date: '2025-10-20',
      end_date: '2025-10-21',
      reason: 'Family emergency',
      documentAttachement: '',
      type: 'Emergency',
      status: 'Pending',
      user: { id: 1 }
    }
  ];

  // Mock AI analysis responses
  const mockAIResponses = [
    {
      confidenceScore: 0.85,
      analysisResult: 'This request appears legitimate.',
      recommendedApproval: true
    },
    {
      confidenceScore: 0.75,
      analysisResult: 'Medical reason seems valid.',
      recommendedApproval: true
    },
    {
      confidenceScore: 0.35,
      analysisResult: 'Insufficient documentation for emergency.',
      recommendedApproval: false
    }
  ];

  beforeEach(async () => {
    // Create spy services
    const leaveServiceSpy = jasmine.createSpyObj('LeaveService', ['getLeaves']);
    const leaveAIServiceSpy = jasmine.createSpyObj('LeaveAIService', ['analyzeLeaveRequest']);

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [LeaveAiApprovalChartComponent],
      providers: [
        { provide: LeaveService, useValue: leaveServiceSpy },
        { provide: LeaveAIService, useValue: leaveAIServiceSpy },
        PercentPipe
      ]
    }).compileComponents();

    // Get service instances
    leaveService = TestBed.inject(LeaveService) as jasmine.SpyObj<LeaveService>;
    leaveAIService = TestBed.inject(LeaveAIService) as jasmine.SpyObj<LeaveAIService>;
    
    // Configure mock responses
    leaveService.getLeaves.and.returnValue(of(mockLeaves));
    
    // Configure AI service to return different responses based on the leave
    mockLeaves.forEach((leave, index) => {
      leaveAIService.analyzeLeaveRequest.withArgs(leave).and.returnValue(of(mockAIResponses[index]));
    });

    // Create component
    fixture = TestBed.createComponent(LeaveAiApprovalChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state initially', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.debugElement.query(By.css('.spinner-border'));
    expect(loadingElement).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Analyzing leave requests');
  });

  it('should load and process leave data correctly', fakeAsync(() => {
    // Trigger component initialization
    fixture.detectChanges();
    tick();
    
    // Force change detection after async operations
    fixture.detectChanges();
    
    // Verify service calls
    expect(leaveService.getLeaves).toHaveBeenCalled();
    expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledTimes(mockLeaves.length);
    
    // Verify processed data
    expect(component.approvedCount).toBe(2); // First two are approved
    expect(component.rejectedCount).toBe(1); // Last one is rejected
    expect(component.approvalPercentage).toBe(67); // 2/3 * 100 = ~67%
    
    // Average confidence: (0.85 + 0.75 + 0.35) / 3 = 0.65
    expect(component.averageConfidence).toBeCloseTo(0.65, 2);
    
    // Verify UI elements
    const progressBar = fixture.debugElement.query(By.css('.progress-bar'));
    expect(progressBar.styles['width']).toBe('67%');
    expect(progressBar.nativeElement.textContent.trim()).toBe('67%');
    
    // Check counts
    const approvedCountElement = fixture.debugElement.query(By.css('.col-md-6:first-child h2'));
    const rejectedCountElement = fixture.debugElement.query(By.css('.col-md-6:last-child h2'));
    
    expect(approvedCountElement.nativeElement.textContent.trim()).toBe('2');
    expect(rejectedCountElement.nativeElement.textContent.trim()).toBe('1');
    
    // Check loading state is cleared
    expect(component.loading).toBeFalse();
    const loadingElement = fixture.debugElement.query(By.css('.spinner-border'));
    expect(loadingElement).toBeNull();
  }));

  it('should handle empty leave list', fakeAsync(() => {
    // Setup empty leaves response
    leaveService.getLeaves.and.returnValue(of([]));
    
    // Trigger initialization
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    
    // Verify default values
    expect(component.approvedCount).toBe(0);
    expect(component.rejectedCount).toBe(0);
    expect(component.approvalPercentage).toBe(0);
    expect(component.averageConfidence).toBe(0);
    
    // Verify loading state is cleared
    expect(component.loading).toBeFalse();
  }));

  it('should handle API errors gracefully', fakeAsync(() => {
    // Setup error responses
    leaveService.getLeaves.and.returnValue(throwError(() => new Error('Failed to load leaves')));
    
    // Trigger initialization
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    
    // Verify error handling
    expect(component.loading).toBeFalse();
    
    // Defaults should remain
    expect(component.approvedCount).toBe(0);
    expect(component.rejectedCount).toBe(0);
  }));

  it('should handle partial AI analysis errors', fakeAsync(() => {
    // Setup partial errors (one analysis fails)
    leaveAIService.analyzeLeaveRequest.withArgs(mockLeaves[2])
      .and.returnValue(throwError(() => new Error('Analysis failed')));
    
    // Trigger initialization
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    
    // Should still process the successful analyses
    expect(component.approvedCount).toBe(2);
    expect(component.rejectedCount).toBe(1); // One failed analysis counts as rejected
    
    // Average should exclude failed analysis
    expect(component.approvalPercentage).toBe(67);
  }));

  it('should calculate average confidence score correctly', fakeAsync(() => {
    // Test with different confidence scores
    const customResponses = [
      { ...mockAIResponses[0], confidenceScore: 1.0 },
      { ...mockAIResponses[1], confidenceScore: 0.5 },
      { ...mockAIResponses[2], confidenceScore: 0.0 }
    ];
    
    // Reset mock
    leaveAIService.analyzeLeaveRequest.calls.reset();
    
    // Setup new responses
    mockLeaves.forEach((leave, index) => {
      leaveAIService.analyzeLeaveRequest.withArgs(leave).and.returnValue(of(customResponses[index]));
    });
    
    // Trigger initialization
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    
    // Average: (1.0 + 0.5 + 0.0) / 3 = 0.5
    expect(component.averageConfidence).toBe(0.5);
    
    // Verify UI
    const avgConfidenceElement = fixture.debugElement.query(By.css('.mt-4 h2'));
    expect(avgConfidenceElement.nativeElement.textContent.trim()).toBe('50%');
  }));

  it('should refresh data when loadData is called', fakeAsync(() => {
    // Initial load
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    
    // Reset spies
    leaveService.getLeaves.calls.reset();
    leaveAIService.analyzeLeaveRequest.calls.reset();
    
    // Call loadData
    component.loadData();
    tick();
    fixture.detectChanges();
    
    // Verify services were called again
    expect(leaveService.getLeaves).toHaveBeenCalled();
    expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledTimes(mockLeaves.length);
  }));
});