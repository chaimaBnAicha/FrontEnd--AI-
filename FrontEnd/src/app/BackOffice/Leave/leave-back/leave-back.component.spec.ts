import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';

import { LeaveBackComponent } from './leave-back.component';
import { LeaveService } from 'src/app/Service/leave.service';
import { LeaveAIService } from 'src/app/Service/leave-ai.service';
import { Leave, LeaveStatus } from 'src/app/models/leave.model';
import { LeaveAnalysisModalComponent } from './leave-analysis-modal.component';
import { SafeHtmlPipe } from 'src/app/pipes/safe-html.pipe';

describe('LeaveBackComponent', () => {
  let component: LeaveBackComponent;
  let fixture: ComponentFixture<LeaveBackComponent>;
  let leaveService: jasmine.SpyObj<LeaveService>;
  let leaveAIService: jasmine.SpyObj<LeaveAIService>;
  let modalService: jasmine.SpyObj<NgbModal>;
  
  // Données de test
  const mockLeaves: Leave[] = [
    {
      id: 1,
      start_date: '2025-10-01',
      end_date: '2025-10-05',
      reason: 'Besoin de repos',
      documentAttachement: 'doc1.pdf',
      type: 'Sick',
      status: 'Pending',
      user: { id: 1 }
    },
    {
      id: 2,
      start_date: '2025-11-10',
      end_date: '2025-11-15',
      reason: 'Urgence familiale',
      documentAttachement: 'doc2.pdf',
      type: 'Emergency',
      status: 'Approved',
      user: { id: 1 }
    }
  ];
  
  const mockAIAnalysis = {
    confidenceScore: 0.85,
    analysisResult: 'Cette demande semble légitime.',
    recommendedApproval: true
  };
  
  // Configuration initiale avant chaque test
  beforeEach(async () => {
    // Création des services espions (spy)
    const leaveServiceSpy = jasmine.createSpyObj('LeaveService', 
      ['getLeaves', 'canAcceptLeave', 'updateLeave', 'downloadDocument']);
    
    const leaveAIServiceSpy = jasmine.createSpyObj('LeaveAIService', 
      ['analyzeLeaveRequest']);
    
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', 
      ['open']);
    
    // Configuration du TestBed
    await TestBed.configureTestingModule({
      declarations: [
        LeaveBackComponent,
        SafeHtmlPipe
      ],
      imports: [
        FormsModule,
        NgbModule,
        NgxPaginationModule
      ],
      providers: [
        { provide: LeaveService, useValue: leaveServiceSpy },
        { provide: LeaveAIService, useValue: leaveAIServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    // Création du fixture et récupération des instances
    fixture = TestBed.createComponent(LeaveBackComponent);
    component = fixture.componentInstance;
    leaveService = TestBed.inject(LeaveService) as jasmine.SpyObj<LeaveService>;
    leaveAIService = TestBed.inject(LeaveAIService) as jasmine.SpyObj<LeaveAIService>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    
    // Configuration des réponses simulées des services
    leaveService.getLeaves.and.returnValue(of(mockLeaves));
    leaveService.canAcceptLeave.and.returnValue(of(true));
    leaveAIService.analyzeLeaveRequest.and.returnValue(of(mockAIAnalysis));
    
    // Création d'un espion pour la modal
    const mockModalRef = {
      componentInstance: {}
    };
    modalService.open.and.returnValue(mockModalRef as any);
    
    // Détection des changements
    fixture.detectChanges();
  });

  // Test de base pour vérifier que le composant est créé
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  // Tests for AI analysis service integration
  describe('AI Analysis Integration', () => {
    it('should analyze leaves on component initialization', () => {
      // Verify that the analysis method was called for each leave
      expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledTimes(mockLeaves.length);
      expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledWith(mockLeaves[0]);
      expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledWith(mockLeaves[1]);
    });
    
    it('should store AI analysis results in the component', () => {
      // Verify that results are correctly stored
      expect(component.aiAnalysis['1']).toBeDefined();
      expect(component.aiAnalysis['1'].confidenceScore).toBe(mockAIAnalysis.confidenceScore);
      expect(component.aiAnalysis['1'].recommendedApproval).toBe(mockAIAnalysis.recommendedApproval);
      expect(component.aiAnalysis['1'].analysisResult).toBe(mockAIAnalysis.analysisResult);
    });

    it('should initialize analysis with loading state', () => {
      // Reset AI analysis and re-analyze a single leave
      component.aiAnalysis = {};
      component['analyzeLeave'](mockLeaves[0]);
      
      // Verify initial loading state is set before API response
      expect(component.aiAnalysis['1']).toBeDefined();
      expect(component.aiAnalysis['1'].analysisResult).toBe('Loading...');
      expect(component.aiAnalysis['1'].confidenceScore).toBe(0);
      expect(component.aiAnalysis['1'].recommendedApproval).toBeFalse();
    });
    
    it('should analyze all leaves when analyzeAllLeaves is called', () => {
      // Reset the spy call count
      leaveAIService.analyzeLeaveRequest.calls.reset();
      component.aiAnalysis = {};
      
      // Call the private method directly
      component['analyzeAllLeaves'](mockLeaves);
      
      // Verify all leaves were analyzed
      expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledTimes(2);
      expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledWith(mockLeaves[0]);
      expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledWith(mockLeaves[1]);
    });
    
    it('should handle AI analysis errors gracefully', fakeAsync(() => {
      // Configure service to simulate an error
      leaveAIService.analyzeLeaveRequest.and.returnValue(throwError(() => new Error('API Error')));
      
      // Reset component to trigger analysis
      component.ngOnInit();
      tick();
      
      // Verify error handling
      expect(component.aiAnalysis['1']).toBeDefined();
      expect(component.aiAnalysis['1'].analysisResult).toContain('Error analyzing leave request');
      expect(component.aiAnalysis['1'].confidenceScore).toBe(0);
      expect(component.aiAnalysis['1'].recommendedApproval).toBeFalse();
    }));

    it('should log API errors to console', fakeAsync(() => {
      // Set up console spy
      const consoleSpy = spyOn(console, 'error');
      
      // Configure service to simulate an error
      leaveAIService.analyzeLeaveRequest.and.returnValue(throwError(() => new Error('API Error')));
      
      // Call the analyze method
      component['analyzeLeave'](mockLeaves[0]);
      tick();
      
      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.calls.first().args[0]).toContain('Error getting AI analysis for leave:');
    }));
    
    it('should handle analysis for leaves without IDs', fakeAsync(() => {
      // Create leave without ID
      const leaveWithoutId = {...mockLeaves[0], id: undefined};
      
      // Reset spy and analysis
      leaveAIService.analyzeLeaveRequest.calls.reset();
      component.aiAnalysis = {};
      
      // Call analyze method
      component['analyzeLeave'](leaveWithoutId);
      tick();
      
      // Should not call service
      expect(leaveAIService.analyzeLeaveRequest).not.toHaveBeenCalled();
      expect(Object.keys(component.aiAnalysis).length).toBe(0);
    }));
    
    it('should open the AI analysis modal when openAiModal is called', () => {
      // Simulate existing analysis
      component.aiAnalysis['1'] = mockAIAnalysis;
      
      // Call the method to test
      component.openAiModal(mockLeaves[0]);
      
      // Verify modal was opened with correct parameters
      expect(modalService.open).toHaveBeenCalledWith(LeaveAnalysisModalComponent, {
        centered: true,
        backdrop: 'static',
        keyboard: false
      });
      
      // Verify data was passed to modal
      const modalRef = modalService.open.calls.mostRecent().returnValue;
      expect(modalRef.componentInstance.analysis).toEqual(mockAIAnalysis);
    });
    
    it('should not open modal if no AI analysis is available', () => {
      // Remove analysis for test
      component.aiAnalysis = {};
      
      // Call method
      component.openAiModal(mockLeaves[0]);
      
      // Verify modal was not opened
      expect(modalService.open).not.toHaveBeenCalled();
    });
    
    it('should handle different AI recommendation states', fakeAsync(() => {
      // Test with recommended approval true
      leaveAIService.analyzeLeaveRequest.and.returnValue(of({
        confidenceScore: 0.85,
        analysisResult: 'Legitimate request',
        recommendedApproval: true
      }));
      
      // Reset and trigger analysis
      component.aiAnalysis = {};
      component['analyzeLeave'](mockLeaves[0]);
      tick();
      
      // Verify positive recommendation
      expect(component.aiAnalysis['1'].recommendedApproval).toBeTrue();
      
      // Test with recommended approval false
      leaveAIService.analyzeLeaveRequest.and.returnValue(of({
        confidenceScore: 0.35,
        analysisResult: 'Suspicious request',
        recommendedApproval: false
      }));
      
      // Reset and trigger analysis
      component.aiAnalysis = {};
      component['analyzeLeave'](mockLeaves[0]);
      tick();
      
      // Verify negative recommendation
      expect(component.aiAnalysis['1'].recommendedApproval).toBeFalse();
    }));
    
    it('should update AI analysis when new data is loaded', fakeAsync(() => {
      // Reset service and component
      leaveService.getLeaves.calls.reset();
      leaveAIService.analyzeLeaveRequest.calls.reset();
      
      // Setup new mock data
      const newMockLeaves: Leave[] = [
        {
          id: 3,
          start_date: '2025-12-01',
          end_date: '2025-12-05',
          reason: 'New leave request',
          documentAttachement: 'doc3.pdf',
          type: 'Unpaid',
          status: 'Pending',
          user: { id: 1 }
        }
      ];
      
      // Configure service to return new data
      leaveService.getLeaves.and.returnValue(of(newMockLeaves));
      
      // Call loadLeaves
      component.loadLeaves();
      tick();
      
      // Verify analysis was called for new data
      expect(leaveAIService.analyzeLeaveRequest).toHaveBeenCalledWith(newMockLeaves[0]);
    }));
  });
  
  // Tests pour la mise à jour des statuts de congé
  describe('Leave Status Updates', () => {
    it('should update leave status when updateStatus is called', () => {
      // Configuration de la réponse du service
      const updatedLeave = {...mockLeaves[0], status: LeaveStatus.APPROVED};
      leaveService.updateLeave.and.returnValue(of(updatedLeave));
      
      // Appel de la méthode à tester
      component.updateStatus(mockLeaves[0], LeaveStatus.APPROVED);
      
      // Vérification de l'appel au service
      expect(leaveService.updateLeave).toHaveBeenCalled();
      
      // Vérification des paramètres de l'appel
      const callArgs = leaveService.updateLeave.calls.first().args[0];
      expect(callArgs.status).toBe(LeaveStatus.APPROVED);
      expect(callArgs.id).toBe(mockLeaves[0].id);
    });
    
    it('should handle update errors gracefully', fakeAsync(() => {
      // Configuration du service pour simuler une erreur
      leaveService.updateLeave.and.returnValue(throwError(() => new Error('Update Error')));
      
      // Espionner console.error
      spyOn(console, 'error');
      
      // Appel de la méthode
      component.updateStatus(mockLeaves[0], LeaveStatus.APPROVED);
      tick();
      
      // Vérification que l'erreur a été loguée
      expect(console.error).toHaveBeenCalled();
    }));
  });
  
  // Tests pour la recherche et le filtrage
  describe('Search and Filtering', () => {
    it('should filter leaves based on search term', () => {
      // Initialisation des données
      component.leaves = [...mockLeaves];
      component.originalLeaves = [...mockLeaves];
      
      // Définition du terme de recherche
      component.searchTerm = 'urgence';
      
      // Appel de la méthode de recherche
      component.onSearch();
      
      // Vérification du résultat du filtre
      expect(component.leaves.length).toBe(1);
      expect(component.leaves[0].id).toBe(2);
    });
    
    it('should filter leaves based on status', () => {
      // Initialisation des données
      component.leaves = [...mockLeaves];
      component.originalLeaves = [...mockLeaves];
      
      // Définition du filtre de statut
      component.statusFilter = 'Approved';
      
      // Appel de la méthode de filtre
      component.onStatusFilter();
      
      // Vérification du résultat du filtre
      expect(component.leaves.length).toBe(1);
      expect(component.leaves[0].id).toBe(2);
    });
    
    it('should reset search when clearSearch is called', () => {
      // Configuration du test
      component.searchTerm = 'test';
      component.originalLeaves = [...mockLeaves];
      
      // Espionner la méthode onSearch
      spyOn(component, 'onSearch');
      
      // Appel de la méthode à tester
      component.clearSearch();
      
      // Vérifications
      expect(component.searchTerm).toBe('');
      expect(component.onSearch).toHaveBeenCalled();
    });
  });
  
  // Tests pour la gestion de la pagination
  describe('Pagination', () => {
    it('should reset page number when itemsPerPage changes', () => {
      // Configuration initiale
      component.p = 3;
      component.itemsPerPage = 5;
      
      // Appel de la méthode à tester
      component.onItemsPerPageChange();
      
      // Vérification que la page a été réinitialisée
      expect(component.p).toBe(1);
    });
  });
  
  // Tests pour le téléchargement de documents
  describe('Document Download', () => {
    beforeEach(() => {
      // Création d'un espion pour window.URL.createObjectURL
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(window.URL, 'revokeObjectURL');
      
      // Espion pour document.createElement et méthodes associées
      spyOn(document, 'createElement').and.returnValue({
        href: '',
        download: '',
        click: jasmine.createSpy('click')
      } as unknown as HTMLAnchorElement);
      
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
    });
    
    it('should download document when downloadDocument is called', fakeAsync(() => {
      // Configuration du service
      leaveService.downloadDocument.and.returnValue(of(new Blob()));
      
      // Congé pour le test
      const leave = {...mockLeaves[0], isDownloading: false, downloadError: false};
      
      // Appel de la méthode à tester
      component.downloadDocument(leave);
      tick();
      
      // Vérifications
      expect(leaveService.downloadDocument).toHaveBeenCalledWith(leave.documentAttachement);
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      
      // Vérification que les éléments du DOM ont été manipulés correctement
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
      
      // Vérification des flags
      expect(leave.isDownloading).toBeFalse();
      expect(leave.downloadError).toBeFalse();
    }));
    
    it('should handle download errors', fakeAsync(() => {
      // Configuration du service pour simuler une erreur
      leaveService.downloadDocument.and.returnValue(throwError(() => new Error('Download Error')));
      
      // Espionner console.error
      spyOn(console, 'error');
      
      // Congé pour le test
      const leave = {...mockLeaves[0], isDownloading: false, downloadError: false};
      
      // Appel de la méthode
      component.downloadDocument(leave);
      tick();
      
      // Vérifications
      expect(leaveService.downloadDocument).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      
      // Vérification des flags
      expect(leave.isDownloading).toBeFalse();
      expect(leave.downloadError).toBeTrue();
    }));
    
    it('should not attempt download if no document attachment', () => {
      // Congé sans pièce jointe
      const leaveWithoutDoc = {...mockLeaves[0], documentAttachement: ''};
      
      // Appel de la méthode
      component.downloadDocument(leaveWithoutDoc);
      
      // Vérification qu'aucun appel n'a été fait
      expect(leaveService.downloadDocument).not.toHaveBeenCalled();
    });
  });
  
  // Tests pour les helpers canAccept et isLoading
  describe('Helper Methods', () => {
    it('should return correct value for canAccept', () => {
      // Configuration de l'état du composant
      component.loadingMap = {1: false, 2: true};
      component.canAcceptMap = {1: true, 2: false};
      
      // Vérifications
      expect(component.canAccept(mockLeaves[0])).toBeTrue();
      expect(component.canAccept(mockLeaves[1])).toBeFalse(); // En chargement
      
      // Cas avec ID invalide
      const leaveWithoutId = {...mockLeaves[0]};
      delete leaveWithoutId.id;
      expect(component.canAccept(leaveWithoutId)).toBeFalse();
    });
    
    it('should return correct value for isLoading', () => {
      // Configuration de l'état du composant
      component.loadingMap = {1: true, 2: false};
      
      // Vérifications
      expect(component.isLoading(mockLeaves[0])).toBeTrue();
      expect(component.isLoading(mockLeaves[1])).toBeFalse();
      
      // Cas avec ID invalide
      const leaveWithoutId = {...mockLeaves[0]};
      delete leaveWithoutId.id;
      expect(component.isLoading(leaveWithoutId)).toBeFalse();
    });
  });
});