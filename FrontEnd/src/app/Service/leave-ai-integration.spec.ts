import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';

import { LeaveService } from 'src/app/Service/leave.service';
import { LeaveAIService } from 'src/app/Service/leave-ai.service';
import { Leave, LeaveStatus } from 'src/app/models/leave.model';
import { LeaveAnalysisModalComponent } from 'src/app/BackOffice/Leave/leave-back/leave-analysis-modal.component';

/**
 * This is an integration test suite for the Leave AI Analysis feature
 * It tests the interaction between services and components
 */
describe('Leave AI Analysis Integration', () => {
  let leaveService: LeaveService;
  let leaveAIService: LeaveAIService;
  let modalService: jasmine.SpyObj<NgbModal>;
  let httpMock: HttpTestingController;

  // Test data
  const mockLeave: Leave = {
    id: 1,
    start_date: '2025-10-01',
    end_date: '2025-10-05',
    reason: 'Vacation',
    documentAttachement: 'vacation.pdf',
    type: 'Unpaid',
    status: 'Pending',
    user: { id: 1 }
  };

  const mockAIResponse = {
    confidenceScore: 0.85,
    analysisResult: 'This leave request appears legitimate based on the user history.',
    recommendedApproval: true
  };

  beforeEach(() => {
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LeaveService,
        LeaveAIService,
        { provide: NgbModal, useValue: modalServiceSpy }
      ]
    });

    leaveService = TestBed.inject(LeaveService);
    leaveAIService = TestBed.inject(LeaveAIService);
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should analyze leave request and return proper response', () => {
    // Call service
    leaveAIService.analyzeLeaveRequest(mockLeave).subscribe(response => {
      expect(response).toEqual(mockAIResponse);
    });

    // Verify HTTP request
    const req = httpMock.expectOne(`${leaveAIService['apiUrl']}/analyze-leave`);
    expect(req.request.method).toBe('POST');
    
    // Verify request body
    expect(req.request.body).toEqual({
      start_date: jasmine.any(String),
      end_date: jasmine.any(String),
      reason: mockLeave.reason,
      documentAttachement: mockLeave.documentAttachement,
      type: mockLeave.type,
      status: 'Pending'
    });
    
    // Return mock response
    req.flush(mockAIResponse);
  });

  it('should open modal with AI analysis results', fakeAsync(() => {
    // Mock the modal reference
    const mockModalRef = { componentInstance: {} } as NgbModalRef;
    modalService.open.and.returnValue(mockModalRef);
    
    // Mock AI service
    spyOn(leaveAIService, 'analyzeLeaveRequest').and.returnValue(of(mockAIResponse));
    
    // Create a simple function to open the modal with analysis results
    function openAiAnalysisModal(leave: Leave, aiAnalysis: any) {
      leaveAIService.analyzeLeaveRequest(leave).subscribe(analysis => {
        const modalRef = modalService.open(LeaveAnalysisModalComponent, {
          centered: true,
          backdrop: 'static'
        });
        modalRef.componentInstance.analysis = analysis;
      });
    }
    
    // Call the function
    openAiAnalysisModal(mockLeave, mockAIResponse);
    tick();
    
    // Verify
    expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledWith(mockLeave);
    expect(modalService.open).toHaveBeenCalledWith(LeaveAnalysisModalComponent, {
      centered: true,
      backdrop: 'static'
    });
    expect(mockModalRef.componentInstance.analysis).toEqual(mockAIResponse);
  }));

  it('should handle API errors when analyzing leave', fakeAsync(() => {
    // Mock AI service to throw error
    spyOn(leaveAIService, 'analyzeLeaveRequest').and.returnValue(
      throwError(() => new Error('API Error'))
    );
    
    // Spy on console.error
    const consoleSpy = spyOn(console, 'error');
    
    // Create a function that handles errors
    function analyzeWithErrorHandling(leave: Leave) {
      let analysisResult = {
        confidenceScore: 0,
        analysisResult: 'Loading...',
        recommendedApproval: false
      };
      
      leaveAIService.analyzeLeaveRequest(leave).subscribe({
        next: (analysis) => {
          analysisResult = analysis;
        },
        error: (error) => {
          console.error('Error analyzing leave:', error);
          analysisResult = {
            confidenceScore: 0,
            analysisResult: 'Error analyzing leave request. Please try again.',
            recommendedApproval: false
          };
        }
      });
      
      return analysisResult;
    }
    
    // Call function
    const result = analyzeWithErrorHandling(mockLeave);
    tick();
    
    // Verify error handling
    expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.calls.first().args[0]).toBe('Error analyzing leave:');
  }));

  it('should update leave status based on AI recommendation', fakeAsync(() => {
    // Mock services
    spyOn(leaveAIService, 'analyzeLeaveRequest').and.returnValue(of(mockAIResponse));
    spyOn(leaveService, 'updateLeave').and.returnValue(of({ ...mockLeave, status: 'Approved' }));
    
    // Function to update leave based on AI recommendation
    function updateLeaveBasedOnAI(leave: Leave) {
      return leaveAIService.analyzeLeaveRequest(leave).toPromise()
        .then(analysis => {
          if (analysis && analysis.recommendedApproval) {
            return leaveService.updateLeave({
              ...leave,
              status: 'Approved'
            }).toPromise();
          } else {
            return leaveService.updateLeave({
              ...leave,
              status: 'Rejected'
            }).toPromise();
          }
        });
    }
    
    // Call function
    let result: any;
    (async () => {
      result = await updateLeaveBasedOnAI(mockLeave);
    })();
    tick();
    
    // Verify services were called correctly
    expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledWith(mockLeave);
    expect(leaveService.updateLeave).toHaveBeenCalled();
    
    // Verify updated status based on recommendation
    const updateCallArgs = (leaveService.updateLeave as jasmine.Spy).calls.first().args[0];
    expect(updateCallArgs.status).toBe('Approved');
  }));

  it('should process multiple leave analyses in parallel', fakeAsync(() => {
    // Setup mock leaves
    const mockLeaves: Leave[] = [
      { ...mockLeave, id: 1 },
      { ...mockLeave, id: 2, reason: 'Family emergency', type: 'Emergency' },
      { ...mockLeave, id: 3, reason: 'Medical appointment', type: 'Sick' }
    ];
    
    // Mock responses for each leave
    const mockResponses = [
      { ...mockAIResponse, confidenceScore: 0.85 },
      { ...mockAIResponse, confidenceScore: 0.95, analysisResult: 'Emergency appears valid.' },
      { ...mockAIResponse, confidenceScore: 0.45, recommendedApproval: false, analysisResult: 'Suspicious request.' }
    ];
    
    // Spy on service
    const analyzeSpy = spyOn(leaveAIService, 'analyzeLeaveRequest');
    
    // Setup mock responses
    mockLeaves.forEach((leave, index) => {
      analyzeSpy.withArgs(leave).and.returnValue(of(mockResponses[index]));
    });
    
    // Function to analyze multiple leaves
    function analyzeMultipleLeaves(leaves: Leave[]) {
      const analysisPromises = leaves.map(leave => 
        leaveAIService.analyzeLeaveRequest(leave).toPromise()
      );
      
      return Promise.all(analysisPromises);
    }
    
    // Call function
    let results: any[] = [];
    (async () => {
      results = await analyzeMultipleLeaves(mockLeaves);
    })();
    tick();
    
    // Verify
    expect(analyzeSpy).toHaveBeenCalledTimes(3);
    expect(results.length).toBe(3);
    expect(results).toEqual(mockResponses);
    expect(results[0].recommendedApproval).toBeTrue();
    expect(results[2].recommendedApproval).toBeFalse();
  }));
});