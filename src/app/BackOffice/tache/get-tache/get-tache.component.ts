import { Component } from '@angular/core';
import { TacheService, Tache } from 'src/app/service/tache.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
  selector: 'app-get-tache',
  templateUrl: './get-tache.component.html',
  styleUrls: ['./get-tache.component.css']
})
export class GetTacheComponent {
 taches: Tache[] = [];
  searchControl = new FormControl('');
  isSearching = false;
  noResults = false;
  taskAnalysis: any = null;

  constructor(private tacheService: TacheService) {}

  ngOnInit(): void {
    this.getAllTache();
    this.setupSearch();
  }

  getAllTache(): void {
    this.tacheService.getAllTache().subscribe({
      next: (data: Tache[]) => {
        console.log(data);
        this.taches = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
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
  this.tacheService.deleteTache(tacheId).subscribe({
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
        return query ? this.tacheService.searchTaches(query) : this.tacheService.getAllTache();
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

// Ajoutez cette propriété
selectedTache: Tache | null = null;

// Ajoutez ces méthodes
showTaskDetails(tache: Tache) {
  this.selectedTache = tache;
}

closeDetails() {
  this.selectedTache = null;
}}
