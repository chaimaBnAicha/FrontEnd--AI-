/*import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TacheService } from  'src/app/service/tache.service'; // Vérifie bien l'import
export interface Tache {
  id: number;
  titre: string;        // Vérifier que cette ligne existe
  description: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE'; 
}

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  
  
  statuts: string[] = ['A_FAIRE', 'EN_COURS', 'TERMINEE'];

  taches: { [key: string]: Tache[] } = { 
    A_FAIRE: [], 
    EN_COURS: [], 
    TERMINEE: [] 
  };

  constructor(private tacheService: TacheService) {}

  ngOnInit(): void {
    this.loadTaches();
  }

  loadTaches(): void {
    this.tacheService.getAllTache().subscribe((data: Tache[]) => {
      this.taches = {
        A_FAIRE: data.filter((t: Tache) => t.statut === 'A_FAIRE'),
        EN_COURS: data.filter((t: Tache) => t.statut === 'EN_COURS'),
        TERMINEE: data.filter((t: Tache) => t.statut === 'TERMINEE'),
      };
    });
  }

  drop(event: CdkDragDrop<Tache[]>, newStatut: typeof this.statuts[number]) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedTask = event.previousContainer.data[event.previousIndex];
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.tacheService.updateStatut(movedTask.id, newStatut).subscribe({
        next: () => movedTask.statut = newStatut,
        error: (err) => console.error('Erreur sauvegarde', err)
      });
    }
  /*saveTachesToDatabase() {
    // Envoie les données vers la route correcte de l'API
    Object.keys(this.taches).forEach(statut => {
      this.tacheService.updateTaches(statut, this.taches[statut]).subscribe(
        response => {
          console.log('Tâches sauvegardées');
        },
        error => {
          console.error('Erreur lors de la sauvegarde', error);
        }
      );
    });
  }
  
}*/
import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TacheService } from 'src/app/service/tache.service';
import { AuthService } from 'src/app/services/auth.service';

// Ajouter un type alias pour les statuts
type StatutTache = 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';

export interface Tache {
  id: number;
  titre: string;
  description: string;
  statut: StatutTache; // Utiliser le type alias ici
}

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  statuts: StatutTache[] = ['A_FAIRE', 'EN_COURS', 'TERMINEE'];
  
  taches: { 
    [key in StatutTache]: Tache[] 
  } = { 
    A_FAIRE: [], 
    EN_COURS: [], 
    TERMINEE: [] 
  };

  constructor(private tacheService: TacheService,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
    this.loadTaches();
  }

 /* loadTaches(): void {
    this.tacheService.getAllTache().subscribe((data: Tache[]) => {
      this.statuts.forEach(statut => {
        this.taches[statut] = data.filter(t => t.statut === statut);
      });
    });
  }*/
    loadTaches(): void {
      const currentUser = this.authService.getCurrentUser();
    
      if (currentUser && currentUser.token) {
        const token = currentUser.token;
    
        this.tacheService.getAllTache(token).subscribe({
          next: (data: Tache[]) => {
            console.log('Données reçues:', data);
            this.statuts.forEach(statut => {
              this.taches[statut] = data.filter(t => t.statut === statut);
            });
          },
          error: (err) => {
            console.error('Erreur de chargement:', err);
          }
        });
    
      } else {
        console.error('Token manquant pour charger les tâches');
      }
    }
    

 /* drop(event: CdkDragDrop<Tache[]>, newStatut: StatutTache) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedTask = event.previousContainer.data[event.previousIndex];
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.tacheService.updateStatut(movedTask.id, newStatut).subscribe({
        next: () => {
          // Ajouter une assertion de type
          movedTask.statut = newStatut as StatutTache;
        },
        error: (err) => console.error('Erreur sauvegarde', err)
      });
    }
  }*/
    drop(event: CdkDragDrop<Tache[]>, newStatut: StatutTache) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        const movedTask = event.previousContainer.data[event.previousIndex];
        
        // Créer de nouvelles références de tableau
        const previousData = [...event.previousContainer.data];
        const newData = [...event.container.data];
  
        transferArrayItem(
          previousData,
          newData,
          event.previousIndex,
          event.currentIndex
        );
  
        // Mettre à jour les données de manière immuable
        this.taches[event.previousContainer.id as StatutTache] = previousData;
        this.taches[newStatut] = newData;
  
        this.tacheService.updateStatut(movedTask.id, newStatut).subscribe({
          next: () => {
            movedTask.statut = newStatut;
            console.log('Statut mis à jour :', newStatut);
          },
          error: (err) => {
            console.error('Erreur sauvegarde', err);
            // Rollback avec immutabilité
            this.taches = {
              ...this.taches,
              [event.previousContainer.id as StatutTache]: [...this.taches[event.previousContainer.id as StatutTache], movedTask],
              [newStatut]: this.taches[newStatut].filter(t => t.id !== movedTask.id)
            };
          }
        });
      }
    }
    trackById(index: number, tache: Tache): number {
      return tache.id;
    }
}
