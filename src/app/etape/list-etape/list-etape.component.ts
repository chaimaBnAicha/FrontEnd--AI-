import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EtapeService, Etape } from 'src/app/service/etape.service';
import { TacheService, Tache } from 'src/app/service/tache.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-list-etape',
  templateUrl: './list-etape.component.html',
  styleUrls: ['./list-etape.component.css']
})
export class ListEtapeComponent implements OnInit, OnChanges {
  @Input() tacheId: number | null = null;
  etapes: Etape[] = [];
  taches: Tache[] = [];
 
  constructor(
    private etapeService: EtapeService,
    private tacheService: TacheService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}
/*
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tacheId'] && this.tacheId) {
      this.filterEtapesByTache(this.tacheId);
    }
  }*/
/*
  // Keep only one ngOnInit
  ngOnInit(): void {
    this.loadTaches();
    if (this.tacheId) {
      this.filterEtapesByTache(Number(this.tacheId));
    } else {
      this.route.queryParams.subscribe(params => {
        const tacheId = params['tacheId'];
        if (tacheId) {
          this.filterEtapesByTache(Number(tacheId));
        } else {
          this.loadEtapes();
        }
      });
    }
  }

  // Modify loadEtapes to handle null tacheId
  loadEtapes(): void {
    if (this.tacheId) {
      this.etapeService.getEtapesByTacheId(Number(this.tacheId)).subscribe({
        next: (data: Etape[]) => {
          this.etapes = data;
        },
        error: (error: Error) => {
          console.error('Error loading etapes:', error);
        }
      });
    } else {
      this.etapeService.getAllEtapes().subscribe({
        next: (data: Etape[]) => {
          this.etapes = data;
        },
        error: (error: Error) => {
          console.error('Error loading all etapes:', error);
        }
      });
    }
  }
*/
ngOnChanges(changes: SimpleChanges) {
  if (changes['tacheId']) {
    const newTacheId = changes['tacheId'].currentValue;
    if (newTacheId) {
      this.loadEtapesForTache(newTacheId);
    }
  }
}

ngOnInit() {
  this.loadTaches();
  this.route.params.subscribe(params => {
    const id = params['id'];
    if (id) {
      this.tacheId = +id;
      this.loadEtapesForTache(this.tacheId);
    }
  });
}

loadEtapes(): void {
  const currentUser = this.authService.getCurrentUser();

  if (!currentUser || !currentUser.token) {
    console.error('Token manquant pour charger les étapes');
    return;
  }

  const token = currentUser.token;

  this.etapeService.getAllEtapes(token).subscribe({
    next: (data: Etape[]) => {
      this.etapes = data;
      console.log('Etapes chargées avec succès');
    },
    error: (error) => console.error('Erreur lors du chargement des étapes:', error)
  });
}


filterEtapesByTache(tacheId: number) {
  if (!tacheId) return;

  const token = this.authService.getToken();

  if (!token) {
    console.error('Token manquant pour filtrer les étapes');
    return;
  }

  this.etapeService.getEtapesByTacheId(tacheId, token).subscribe({
    next: (data: Etape[]) => {
      this.etapes = data;
      console.log('Filtered etapes:', data); // Debug log
    },
    error: (error) => {
      console.error('Error filtering etapes:', error);
      this.etapes = []; // Clear etapes on error
    }
  });
}

loadTaches(): void {
  const currentUser = this.authService.getCurrentUser();

  if (!currentUser || !currentUser.token) {
    console.error('Token manquant pour charger les tâches');
    return;
  }

  const token = currentUser.token;

  this.tacheService.getAllTache(token).subscribe({
    next: (data: Tache[]) => {
      this.taches = data;
    },
    error: (error: Error) => {
      console.error('Error loading taches:', error);
    }
  });
}

loadEtapesForTache(tacheId: number) {
  const token = this.authService.getToken();

  if (!token) {
    console.error('Token manquant pour charger les étapes');
    return;
  }

  this.etapeService.getEtapesByTacheId(tacheId, token).subscribe({
    next: (data: Etape[]) => {
      console.log(`Loading etapes for tache ${tacheId}:`, data);
      this.etapes = data;
    },
    error: (error) => {
      console.error(`Error loading etapes for tache ${tacheId}:`, error);
      this.etapes = [];
    }
  });
}



  getTacheName(tacheId: number | undefined): string {
    if (!tacheId) return 'N/A';
    const tache = this.taches.find(t => t.id === tacheId);
    return tache ? (tache.titre || tache.nom) : 'N/A';
  }

 

  
/*
  filterEtapesByTache(tacheId: number): void {
    this.etapeService.getEtapesByTacheId(tacheId).subscribe({
      next: (data: Etape[]) => {
        this.etapes = data;
      },
      error: (error: Error) => {
        console.error('Error loading filtered etapes:', error);
      }
    });
  }*/

  resetFilter(): void {
    this.loadEtapes();
  }

  confirmDelete(etapeId: number | undefined): void {
    if (etapeId === undefined) {
      console.error('Invalid etape ID');
      return;
    }

    const isConfirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette Etape ?');
    if (isConfirmed) {
      this.deleteEtapeComponent(etapeId);
    }
  }
  deleteEtapeComponent(etapeId: number): void {
    const currentUser = this.authService.getCurrentUser();
  
    if (!currentUser || !currentUser.token) {
      console.error('Token manquant pour supprimer une étape');
      return;
    }
  
    const token = currentUser.token;
  
    this.etapeService.supprimerEtape(etapeId, token).subscribe({
      next: () => {
        console.log('Etape supprimée');
        this.loadEtapes();
      },
      error: (err: Error) => console.error('Erreur suppression', err)
    });
  }
  

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_COURS': return 'In Progress';
      case 'TERMINEE': return 'Completed';
      case 'A_FAIRE': return 'To Do';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_COURS': return 'badge-warning';
      case 'TERMINEE': return 'badge-success';
      case 'A_FAIRE': return 'badge-secondary';
      default: return 'badge-info';
    }
  }

  getProgressPercentage(): number {
    if (!this.etapes.length) return 0;
    const completedEtapes = this.etapes.filter(etape => etape.statut === 'TERMINEE').length;
    return (completedEtapes / this.etapes.length) * 100;
  }

  getProgressColor(): string {
    const percentage = this.getProgressPercentage();
    if (percentage < 30) return 'bg-danger';
    if (percentage < 70) return 'bg-warning';
    return 'bg-success';
  }

  getProgressText(): string {
    const completedEtapes = this.etapes.filter(etape => etape.statut === 'TERMINEE').length;
    return `${completedEtapes}/${this.etapes.length} étapes complétées`;
  }

// Ajoutez ces nouvelles méthodes

getEstimatedCompletionDate(): Date {
  const completedEtapes = this.etapes.filter(e => e.statut === 'TERMINEE').length;
  if (completedEtapes === 0) return new Date();
  
  const averageTimePerEtape = this.calculateAverageCompletionTime();
  const remainingEtapes = this.etapes.length - completedEtapes;
  const estimatedRemainingDays = remainingEtapes * averageTimePerEtape;
  
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + estimatedRemainingDays);
  return estimatedDate;
}

calculateAverageCompletionTime(): number {
  const completedEtapes = this.etapes.filter(e => e.statut === 'TERMINEE');
  if (completedEtapes.length === 0) return 1;
  
  const totalDays = completedEtapes.reduce((acc, etape) => {
    const start = new Date(etape.dateDebut);
    const end = new Date(etape.dateFin);
    return acc + (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
  }, 0);
  
  return totalDays / completedEtapes.length;
}

getProductivityScore(): number {
  const completedOnTime = this.etapes.filter(e => 
    e.statut === 'TERMINEE' && 
    new Date(e.dateFin) <= new Date(e.dateDebut)
  ).length;
  
  return (completedOnTime / this.etapes.length) * 100;
}

getPriorityLevel(etape: Etape): string {
  const today = new Date();
  const deadline = new Date(etape.dateFin);
  const daysRemaining = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  if (daysRemaining < 2) return 'URGENT';
  if (daysRemaining < 5) return 'HIGH';
  if (daysRemaining < 10) return 'MEDIUM';
  return 'LOW';
}

getEtapeEfficiency(): number {
  const completedEtapes = this.etapes.filter(e => e.statut === 'TERMINEE');
  if (completedEtapes.length === 0) return 0;

  const efficiency = completedEtapes.reduce((acc, etape) => {
    const plannedDuration = new Date(etape.dateFin).getTime() - new Date(etape.dateDebut).getTime();
    const actualDuration = new Date().getTime() - new Date(etape.dateDebut).getTime();
    return acc + (plannedDuration / actualDuration);
  }, 0) / completedEtapes.length;

  return efficiency * 100;
}

getProjectHealth(): string {
  const efficiency = this.getEtapeEfficiency();
  const progress = this.getProgressPercentage();
  const score = (efficiency + progress) / 2;
  
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  return 'NEEDS_ATTENTION';
}

getSuggestedActions(): string[] {
  const suggestions: string[] = [];
  const progress = this.getProgressPercentage();
  const efficiency = this.getEtapeEfficiency();
  
  if (progress < 30) {
    suggestions.push('Considérer une réunion d\'équipe pour accélérer le progrès');
  }
  
  if (efficiency < 70) {
    suggestions.push('Revoir la planification des étapes');
  }
  
  const delayedEtapes = this.etapes.filter(e => 
    e.statut !== 'TERMINEE' && 
    new Date(e.dateFin) < new Date()
  );
  
  if (delayedEtapes.length > 0) {
    suggestions.push(`${delayedEtapes.length} étapes en retard - Nécessite attention immédiate`);
  }
  
  return suggestions;
}

}
