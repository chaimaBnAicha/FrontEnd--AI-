import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { LeaveAnalysisModalComponent } from './leave-analysis-modal.component';
import { DebugElement } from '@angular/core';

describe('LeaveAnalysisModalComponent', () => {
  let component: LeaveAnalysisModalComponent;
  let fixture: ComponentFixture<LeaveAnalysisModalComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
  let debugElement: DebugElement;

  // Test data
  const mockAnalysis = {
    confidenceScore: 0.75,
    analysisResult: 'Cette demande semble légitime basée sur l\'historique du demandeur.',
    recommendedApproval: true
  };

  // Configuration before each test
  beforeEach(async () => {
    // Create a spy for NgbActiveModal
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [
        { provide: NgbActiveModal, useValue: mockActiveModal }
      ]
    }).compileComponents();

    // Create the fixture and get the component instance
    fixture = TestBed.createComponent(LeaveAnalysisModalComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    
    // Set input data
    component.analysis = mockAnalysis;
    
    fixture.detectChanges();
  });

  // Basic test to verify that the component is created
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test to verify data display
  it('should display analysis data correctly', () => {
    // Get HTML element of the component
    const el = fixture.nativeElement;
    
    // Verify that the data is correctly displayed
    expect(el.textContent).toContain('AI Analysis Results');
    expect(el.textContent).toContain(mockAnalysis.analysisResult);
    expect(el.textContent).toContain('Recommended for Approval');
    
    // Check the confidence score percentage
    const progressBarText = el.querySelector('.progress-bar').textContent.trim();
    expect(progressBarText).toBe('75%');
    
    // Check analysis text
    const analysisText = el.querySelector('.p-3.bg-light.rounded p').textContent;
    expect(analysisText).toBe(mockAnalysis.analysisResult);
  });

  // Test to verify modal title and icon
  it('should display the correct title and icon', () => {
    const modalTitle = debugElement.query(By.css('.modal-title'));
    const titleIcon = debugElement.query(By.css('.modal-title i.fas'));
    
    expect(modalTitle.nativeElement.textContent).toContain('AI Analysis Results');
    expect(titleIcon.nativeElement.classList).toContain('fa-brain');
  });

  // Test close button behavior
  it('should close modal when close button is clicked', () => {
    // Get close button
    const closeButton = fixture.nativeElement.querySelector('button.btn-outline-secondary');
    
    // Simulate click
    closeButton.click();
    
    // Verify that the close method was called
    expect(mockActiveModal.close).toHaveBeenCalledWith('Close click');
    expect(mockActiveModal.close).toHaveBeenCalledTimes(1);
  });

  // Test X button behavior
  it('should dismiss modal when X button is clicked', () => {
    // Get X button
    const dismissButton = fixture.nativeElement.querySelector('button.btn-close');
    
    // Simulate click
    dismissButton.click();
    
    // Verify that the dismiss method was called
    expect(mockActiveModal.dismiss).toHaveBeenCalledWith('Cross click');
    expect(mockActiveModal.dismiss).toHaveBeenCalledTimes(1);
  });

  // Tests for different confidence scores
  describe('Confidence Score Display', () => {
    it('should apply success class for high confidence score', () => {
      // Configure high score
      component.analysis = {
        ...mockAnalysis,
        confidenceScore: 0.85
      };
      fixture.detectChanges();
      
      // Get progress bar
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      
      // Check CSS classes
      expect(progressBar.classList).toContain('bg-success');
      expect(progressBar.classList).not.toContain('bg-warning');
      expect(progressBar.classList).not.toContain('bg-danger');
      
      // Check width based on percentage
      expect(progressBar.style.width).toBe('85%');
    });
    
    it('should apply warning class for medium confidence score', () => {
      // Configure medium score
      component.analysis = {
        ...mockAnalysis,
        confidenceScore: 0.55
      };
      fixture.detectChanges();
      
      // Get progress bar
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      
      // Check CSS classes
      expect(progressBar.classList).not.toContain('bg-success');
      expect(progressBar.classList).toContain('bg-warning');
      expect(progressBar.classList).not.toContain('bg-danger');
      
      // Check width based on percentage
      expect(progressBar.style.width).toBe('55%');
    });
    
    it('should apply danger class for low confidence score', () => {
      // Configure low score
      component.analysis = {
        ...mockAnalysis,
        confidenceScore: 0.35
      };
      fixture.detectChanges();
      
      // Get progress bar
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      
      // Check CSS classes
      expect(progressBar.classList).not.toContain('bg-success');
      expect(progressBar.classList).not.toContain('bg-warning');
      expect(progressBar.classList).toContain('bg-danger');
      
      // Check width based on percentage
      expect(progressBar.style.width).toBe('35%');
    });
    
    it('should handle boundary values for confidence score', () => {
      // Test boundary values
      const testCases = [
        { score: 0.0, expectedClass: 'bg-danger' },
        { score: 0.4, expectedClass: 'bg-danger' },
        { score: 0.41, expectedClass: 'bg-warning' },
        { score: 0.7, expectedClass: 'bg-warning' },
        { score: 0.71, expectedClass: 'bg-success' },
        { score: 1.0, expectedClass: 'bg-success' }
      ];
      
      testCases.forEach(({ score, expectedClass }) => {
        // Set the score
        component.analysis = {
          ...mockAnalysis,
          confidenceScore: score
        };
        fixture.detectChanges();
        
        // Get the progress bar
        const progressBar = fixture.nativeElement.querySelector('.progress-bar');
        
        // Check that the correct class is applied
        expect(progressBar.classList).toContain(expectedClass);
        
        // Check the width percentage
        expect(progressBar.style.width).toBe(`${score * 100}%`);
      });
    });
  });

  // Tests for recommendation display
  describe('Recommendation Display', () => {
    it('should display success badge for positive recommendation', () => {
      // Configure positive recommendation
      component.analysis = {
        ...mockAnalysis,
        recommendedApproval: true
      };
      fixture.detectChanges();
      
      // Get badge
      const badge = fixture.nativeElement.querySelector('.badge');
      
      // Check
      expect(badge.classList).toContain('bg-success');
      expect(badge.textContent).toContain('Recommended for Approval');
      
      // Check icon
      const icon = badge.querySelector('.fas');
      expect(icon.classList).toContain('fa-check-circle');
    });
    
    it('should display danger badge for negative recommendation', () => {
      // Configure negative recommendation
      component.analysis = {
        ...mockAnalysis,
        recommendedApproval: false
      };
      fixture.detectChanges();
      
      // Get badge
      const badge = fixture.nativeElement.querySelector('.badge');
      
      // Check
      expect(badge.classList).toContain('bg-danger');
      expect(badge.textContent).toContain('Not Recommended');
      
      // Check icon
      const icon = badge.querySelector('.fas');
      expect(icon.classList).toContain('fa-times-circle');
    });
    
    it('should update recommendation when analysis changes', () => {
      // Initially should be positive recommendation
      let badge = fixture.nativeElement.querySelector('.badge');
      expect(badge.classList).toContain('bg-success');
      
      // Change to negative recommendation
      component.analysis = {
        ...mockAnalysis,
        recommendedApproval: false
      };
      fixture.detectChanges();
      
      // Should now be negative
      badge = fixture.nativeElement.querySelector('.badge');
      expect(badge.classList).toContain('bg-danger');
      
      // Change back to positive
      component.analysis = {
        ...mockAnalysis,
        recommendedApproval: true
      };
      fixture.detectChanges();
      
      // Should be positive again
      badge = fixture.nativeElement.querySelector('.badge');
      expect(badge.classList).toContain('bg-success');
    });
  });
  
  // Tests for edge cases
  describe('Edge Cases', () => {
    it('should handle empty analysis result text', () => {
      // Set empty analysis text
      component.analysis = {
        ...mockAnalysis,
        analysisResult: ''
      };
      fixture.detectChanges();
      
      // Get analysis section
      const analysisText = fixture.nativeElement.querySelector('.p-3.bg-light.rounded p');
      
      // Should be empty but not cause errors
      expect(analysisText.textContent).toBe('');
    });
    
    it('should handle extreme confidence scores', () => {
      // Test with 100%
      component.analysis = {
        ...mockAnalysis,
        confidenceScore: 1.0
      };
      fixture.detectChanges();
      
      let progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.style.width).toBe('100%');
      expect(progressBar.textContent.trim()).toBe('100%');
      
      // Test with 0%
      component.analysis = {
        ...mockAnalysis,
        confidenceScore: 0.0
      };
      fixture.detectChanges();
      
      progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.style.width).toBe('0%');
      expect(progressBar.textContent.trim()).toBe('0%');
    });
    
    it('should handle null or undefined analysis gracefully', () => {
      // Prepare a spy to catch errors
      const consoleSpy = spyOn(console, 'error');
      
      // Set analysis to null
      component.analysis = null as any;
      
      // This should not throw an error during change detection
      expect(() => fixture.detectChanges()).not.toThrow();
      
      // We expect some console error since the template tries to access properties of null
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});