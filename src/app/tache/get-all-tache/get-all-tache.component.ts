import { Component, OnInit } from '@angular/core';
import { TacheService, Tache } from 'src/app/service/tache.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { EtapeService } from '../../service/etape.service';
import { MeetingService } from '../../service/meeting.service';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-get-all-tache',
  templateUrl: './get-all-tache.component.html',
  styleUrls: ['./get-all-tache.component.css']
})
export class GetAllTacheComponent implements OnInit {
  taches: Tache[] = [];
  searchControl = new FormControl('');
  isSearching = false;
  noResults = false;
  selectedTacheId: number | null = null;
  etapes: any[] = [];
  // Add these properties at the class level
 
  selectedTacheName: string = '';
  
  // Add this method to the class
  // Remove the duplicate code at the bottom and keep only the showEtapes method in its proper place
 
  taskAnalysis: any = null;

  constructor(
    private router: Router,
    private tacheService: TacheService,
    private etapeService: EtapeService,private meetingService: MeetingService,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
    this.getAllTache();
    this.setupSearch();
}

getAllTache(): void {
  const currentUser = this.authService.getCurrentUser();

  if (!currentUser || !currentUser.token) {
    console.error('Token manquant pour charger les tâches');
    return;
  }

  const token = currentUser.token;

  this.tacheService.getAllTache(token).subscribe({
    next: (data) => {
      this.taches = data;
    },
    error: (error) => {
      console.error('Error loading tasks:', error);
    }
  });
}

  /*deleteTacheComponent(id:number){
    this.tacheService.deleteTache(id).subscribe((data)=>{
      console.log("Tache supprimée avec succès",data);
    },(error)=>{
      console.error("Erreur lors de la suppression de la tâche",error);
    })
  }*/
 // Ajoutez cette méthode
confirmDelete(tacheId: number) {
  const isConfirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?');
  
  if (isConfirmed) {
    this.deleteTacheComponent(tacheId);
  }
}

// Méthode existante modifiée
deleteTacheComponent(tacheId: number) {
  const currentUser = this.authService.getCurrentUser();

  if (!currentUser || !currentUser.token) {
    console.error('Token manquant pour supprimer la tâche');
    return;
  }

  const token = currentUser.token;

  this.tacheService.deleteTache(tacheId, token).subscribe({
    next: () => {
      console.log('Tâche supprimée');
      this.getAllTache(); // Recharger les tâches
    },
    error: (err) => console.error('Erreur suppression', err)
  });
}


  currentPage = 1;
  pageSize = 5;
  get totalPages() {
    return Math.ceil(this.taches.length / this.pageSize);
  }

  get displayedTaches(): Tache[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.taches.slice(startIndex, startIndex + this.pageSize);
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  private setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isSearching = true;
        this.noResults = false;
  
        const currentUser = this.authService.getCurrentUser();
  
        if (!currentUser || !currentUser.token) {
          console.error('Token manquant pour effectuer la recherche');
          return of([]); // Retourne une liste vide en cas d'absence de token
        }
  
        const token = currentUser.token;
  
        return query ? this.tacheService.searchTaches(query, token) : this.tacheService.getAllTache(token);
      }),
      catchError(error => {
        console.error('Erreur de recherche:', error);
        return of([]);
      })
    ).subscribe((results: Tache[]) => {
      this.taches = results;
      this.isSearching = false;
      this.noResults = results.length === 0;
      this.currentPage = 1;
    });
  }
  

  generatePDF(tache: Tache) {
    this.tacheService.generatePDF(tache);
  }

  analyzeDescription(tache: Tache) {
    this.taskAnalysis = this.tacheService.analyzeTaskDescription(tache.description);
    
    console.log('Analyse de la tâche:', this.taskAnalysis);
  }

  closeAnalysis() {
    this.taskAnalysis = null;
  }

/*  showEtapes(tacheId: number) {
    if (this.selectedTacheId === tacheId) {
      this.selectedTacheId = null;
      this.etapes = [];
    } else {
      this.selectedTacheId = tacheId;
      this.etapeService.getEtapesByTacheId(tacheId).subscribe(
        (data) => {
          this.etapes = data;
        },
        (error) => {
          console.error('Erreur lors du chargement des étapes:', error);
        }
      );
    }
  }*/showEtapes(tacheId: number, tacheName: string) {
  this.selectedTacheId = tacheId;
  this.selectedTacheName = tacheName;

  const token = this.authService.getToken(); // Get the token

  if (!token) {
    console.error('Token manquant pour charger les étapes');
    return;
  }

  // Pass both tacheId and token to the service method
  this.etapeService.getEtapesByTacheId(tacheId, token).subscribe(
    (data) => {
      this.etapes = data;
    },
    (error) => {
      console.error('Erreur lors du chargement des étapes:', error);
    }
  );
}


closeEtapesModal() {
    this.selectedTacheId = null;
    this.selectedTacheName = '';
    this.etapes = [];
}



  createMeeting(tache: any) {
    // Navigate to create-meeting component with task data
    this.router.navigate(['/create-meeting'], {
      queryParams: {
        subject: `Meeting for Task: ${tache.nom || tache.titre}`,
        description: tache.description,
        tacheId: tache.id
      }
    });
  }
}
