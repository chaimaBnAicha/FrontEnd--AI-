import { Component, OnInit } from '@angular/core';
import { EtapeService, Etape } from 'src/app/service/etape.service';
import { TacheService, Tache } from 'src/app/service/tache.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-add-etape',
  templateUrl: './add-etape.component.html',
  styleUrls: ['./add-etape.component.css']
})
export class AddEtapeComponent implements OnInit {
  etape: Etape = {
    nom: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    statut: 'EN_COURS'
  };
  taches: Tache[] = [];
  selectedTacheId: number = 0;

  constructor(
    private etapeService: EtapeService,
    private tacheService: TacheService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTaches();
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
      error: (error) => console.error('Error loading taches:', error)
    });
  }
  

  getTacheName(tacheId: number | undefined): string {
    if (!tacheId) return 'N/A';
    const tache = this.taches.find(t => t.id === tacheId);
    return tache ? (tache.titre || tache.nom) : 'N/A';
  }
 
  onSubmit(): void {
    if (this.selectedTacheId) {
      const token = this.authService.getToken(); // Get the token
  
      if (!token) {
        console.error('Token manquant pour ajouter une étape');
        return;
      }
  
      const etapeToSubmit = {
        ...this.etape,
        tacheId: this.selectedTacheId
      };
  
      this.etapeService.ajouterEtape(this.selectedTacheId, etapeToSubmit, token).subscribe({
        next: () => {
          console.log('Etape added successfully with tacheId:', this.selectedTacheId);
          this.resetForm();
        },
        error: (error: Error) => {
          console.error('Error adding etape:', error);
        }
      });
    }
  }
  

  resetForm(): void {
    this.etape = {
      nom: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      statut: 'EN_COURS',
      tacheId: undefined
    };
    this.selectedTacheId = 0;
  }
}