import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LeaveAIService } from './leave-ai.service';
import { Leave, LeaveStatus, LeaveType } from '../models/leave.model';
import { environment } from '../../environments/environment';

describe('LeaveAIService', () => {
  // Variables for the service and HTTP controller
  let service: LeaveAIService;
  let httpMock: HttpTestingController;
  
  // Initial configuration before each test
  beforeEach(() => {
    // TestBed configuration with necessary modules
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LeaveAIService]
    });
    
    // Get service and HTTP controller instances
    service = TestBed.inject(LeaveAIService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  // Verify after each test that there are no pending HTTP requests
  afterEach(() => {
    httpMock.verify();
  });

  // Basic test to verify that the service is created
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  describe('analyzeLeaveRequest', () => {
    // Setup common test data
    let mockLeave: Leave;
    
    beforeEach(() => {
      mockLeave = {
        id: 1,
        start_date: '2025-10-20',
        end_date: '2025-10-25',
        reason: 'Besoin de repos',
        documentAttachement: 'document.pdf',
        type: 'Sick',
        status: 'Pending',
        user: { id: 1 }
      };
    });
    
    it('should send a POST request to the API with the correct leave data', () => {
      // Arrange: Test data preparation
      const mockResponse = {
        confidenceScore: 0.85,
        analysisResult: 'Cette demande semble légitime.',
        recommendedApproval: true
      };
      
      // Act: Call the method to test
      service.analyzeLeaveRequest(mockLeave).subscribe(response => {
        // Assert: Verify the result
        expect(response).toEqual(mockResponse);
        expect(response.confidenceScore).toBeGreaterThan(0);
        expect(response.recommendedApproval).toBe(true);
      });
      
      // Get and verify the HTTP request
      const req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
      expect(req.request.method).toBe('POST');
      
      // Verify the request body
      const requestBody = req.request.body;
      expect(requestBody).toEqual({
        start_date: jasmine.any(String),
        end_date: jasmine.any(String),
        reason: mockLeave.reason,
        documentAttachement: mockLeave.documentAttachement,
        type: mockLeave.type,
        status: 'Pending'
      });
      
      // Simulate the server response
      req.flush(mockResponse);
    });
    
    it('should correctly format dates in ISO string format', () => {
      // Arrange
      const mockResponse = {
        confidenceScore: 0.85,
        analysisResult: 'Cette demande semble légitime.',
        recommendedApproval: true
      };
      
      // Act
      service.analyzeLeaveRequest(mockLeave).subscribe();
      
      // Assert
      const req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
      const requestBody = req.request.body;
      
      // Verify that dates are in ISO format
      expect(requestBody.start_date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(requestBody.end_date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      
      // Simulate the server response
      req.flush(mockResponse);
    });
    
    it('should handle API errors correctly', () => {
      // Arrange
      const mockError = { status: 500, statusText: 'Server Error' };
      
      // Act & Assert
      service.analyzeLeaveRequest(mockLeave).subscribe({
        next: () => fail('should have failed with an error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        }
      });
      
      // Simulate server error
      const req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
      req.flush('Server error', mockError);
    });

    it('should handle network errors correctly', () => {
      // Arrange - We don't need to create an ErrorEvent, the HttpTestingController
      // will handle the error creation internally
      
      // Act & Assert
      service.analyzeLeaveRequest(mockLeave).subscribe({
        next: () => fail('should have failed with a network error'),
        error: (error) => {
          // HttpErrorResponse will be returned, not an ErrorEvent
          expect(error).toBeTruthy();
          // In a real app, you would handle network errors appropriately
          expect(error.name).toBe('HttpErrorResponse');
        }
      });
      
      // Simulate network error - simply pass an error ProgressEvent
      const req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
      const mockError = new ProgressEvent('error');
      req.error(mockError);
    });

    it('should handle leave requests without attachment correctly', () => {
      // Arrange: Leave without attachment
      const mockLeaveWithoutDoc: Leave = {
        id: 2,
        start_date: '2025-11-01',
        end_date: '2025-11-02',
        reason: 'Rendez-vous médical',
        documentAttachement: '',
        type: 'Sick',
        status: 'Pending',
        user: { id: 1 }
      };
      
      const mockResponse = {
        confidenceScore: 0.65,
        analysisResult: 'Demande sans documentation.',
        recommendedApproval: true
      };
      
      // Act
      service.analyzeLeaveRequest(mockLeaveWithoutDoc).subscribe(response => {
        // Assert
        expect(response).toEqual(mockResponse);
      });
      
      // Verify the request
      const req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
      
      // Verify that the attachment is null in the request
      expect(req.request.body.documentAttachement).toBeNull();
      
      // Simulate the response
      req.flush(mockResponse);
    });
    
    it('should handle null document attachment correctly', () => {
      // Arrange
      const mockLeaveWithNullDoc: Leave = {
        ...mockLeave,
        documentAttachement: null as any
      };
      
      const mockResponse = {
        confidenceScore: 0.65,
        analysisResult: 'Demande sans documentation.',
        recommendedApproval: true
      };
      
      // Act
      service.analyzeLeaveRequest(mockLeaveWithNullDoc).subscribe();
      
      // Assert
      const req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
      expect(req.request.body.documentAttachement).toBeNull();
      
      // Simulate response
      req.flush(mockResponse);
    });

    it('should handle different confidence scores correctly', () => {
      // Arrange
      const mockLeave: Leave = {
        id: 3,
        start_date: '2025-12-20',
        end_date: '2025-12-31',
        reason: 'Vacances de fin d\'année',
        documentAttachement: 'planning.pdf',
        type: 'Unpaid',
        status: 'Pending',
        user: { id: 1 }
      };
      
      // Low confidence score case (rejection)
      const lowConfidenceResponse = {
        confidenceScore: 0.2,
        analysisResult: 'Cette demande semble suspecte.',
        recommendedApproval: false
      };
      
      // Act for low score
      service.analyzeLeaveRequest(mockLeave).subscribe(response => {
        // Assert
        expect(response.confidenceScore).toBeLessThan(0.5);
        expect(response.recommendedApproval).toBeFalse();
      });
      
      let req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
      req.flush(lowConfidenceResponse);
      
      // High confidence score case (approval)
      const highConfidenceResponse = {
        confidenceScore: 0.95,
        analysisResult: 'Demande très légitime.',
        recommendedApproval: true
      };
      
      // Act for high score
      service.analyzeLeaveRequest(mockLeave).subscribe(response => {
        // Assert
        expect(response.confidenceScore).toBeGreaterThan(0.9);
        expect(response.recommendedApproval).toBeTrue();
      });
      
      req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
      req.flush(highConfidenceResponse);
    });
    
    it('should handle different leave types correctly', () => {
      // Test each leave type
      const leaveTypes = ['Sick', 'Unpaid', 'Emergency'];
      
      leaveTypes.forEach(type => {
        // Arrange
        const leaveWithType: Leave = {
          ...mockLeave,
          type: type as any
        };
        
        const mockResponse = {
          confidenceScore: 0.75,
          analysisResult: `Analyse pour congé de type ${type}`,
          recommendedApproval: true
        };
        
        // Act
        service.analyzeLeaveRequest(leaveWithType).subscribe();
        
        // Assert
        const req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
        expect(req.request.body.type).toBe(type);
        
        // Simulate response
        req.flush(mockResponse);
      });
    });
    
    it('should handle boundary confidence scores correctly', () => {
      // Arrange: Test boundary values
      const boundaryScores = [
        { score: 0.0, shouldApprove: false },
        { score: 0.4, shouldApprove: false },
        { score: 0.5, shouldApprove: true },
        { score: 1.0, shouldApprove: true }
      ];
      
      boundaryScores.forEach(({ score, shouldApprove }) => {
        // Arrange
        const mockResponse = {
          confidenceScore: score,
          analysisResult: `Score de confiance: ${score}`,
          recommendedApproval: shouldApprove
        };
        
        // Act
        service.analyzeLeaveRequest(mockLeave).subscribe(response => {
          // Assert
          expect(response.confidenceScore).toBe(score);
          expect(response.recommendedApproval).toBe(shouldApprove);
        });
        
        // Verify request and simulate response
        const req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
        req.flush(mockResponse);
      });
    });

    it('should use the correct API URL from the environment', () => {
      // Act
      service.analyzeLeaveRequest(mockLeave).subscribe();
      
      // Assert
      const req = httpMock.expectOne(`${service['apiUrl']}/analyze-leave`);
      expect(req.request.url).toBe(`${service['apiUrl']}/analyze-leave`);
      
      // Simulate response
      req.flush({
        confidenceScore: 0.75,
        analysisResult: 'Test',
        recommendedApproval: true
      });
    });
  });
});