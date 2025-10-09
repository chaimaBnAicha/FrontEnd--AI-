import { Component, OnInit } from '@angular/core';
import { EtapeService, Etape } from 'src/app/service/etape.service';
import { TacheService, Tache } from 'src/app/service/tache.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-etape',
  templateUrl: './etape.component.html',
  styleUrls: ['./etape.component.css'],
})
export class EtapeComponent implements OnInit {
  etapes: Etape[] = [];
  taches: Tache[] = [];
  etape: Etape = { 
    nom: '', 
    description: '', 
    dateDebut: '', 
    dateFin: '', 
    statut: 'EN_COURS',
    tacheId: 0
  };
  selectedTacheId: number = 0;

  constructor(
    private etapeService: EtapeService,
    private tacheService: TacheService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadEtapes();
    this.chargerTaches();
  }

  loadEtapes(): void {
    this.etapeService.getAllEtapes().subscribe({
      next: (data: Etape[]) => {
        console.log('Etapes loaded:', data);
        this.etapes = data;
      },
      error: (error: Error) => {
        console.error('Error loading etapes:', error);
      }
    });
  }

  chargerTaches(): void {
    const currentUser = this.authService.getCurrentUser();
  
    if (!currentUser || !currentUser.token) {
      console.error('Token manquant pour charger les tâches');
      return;
    }
  
    const token = currentUser.token;
  
    this.tacheService.getAllTache(token).subscribe({
      next: (data: Tache[]) => {
        console.log('Taches loaded:', data);
        this.taches = data;
      },
      error: (error) => {
        console.error('Error loading taches:', error);
      }
    });
  }
  

  onSubmit(): void {
    if (this.selectedTacheId) {
      // Ensure dates are properly formatted
      const etapeToSubmit = {
        ...this.etape,
        tacheId: this.selectedTacheId,
        statut: this.etape.statut || 'EN_COURS'
      };
  
      this.etapeService.ajouterEtape(this.selectedTacheId, etapeToSubmit).subscribe({
        next: (response) => {
          console.log('Etape added successfully:', response);
          this.loadEtapes();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error adding etape:', error);
          // Add error handling here if needed
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
      tacheId: 0
    };
    this.selectedTacheId = 0;
  }

  modifier(etape: Etape): void {
    this.etape = { ...etape };
    this.selectedTacheId = etape.tacheId || 0;
  }

  supprimer(id: number | undefined): void {
    if (id && confirm('Voulez-vous vraiment supprimer cette étape ?')) {
      this.etapeService.supprimerEtape(id).subscribe({
        next: () => {
          this.loadEtapes();
        },
        error: (error) => {
          console.error('Error deleting etape:', error);
        }
      });
    }
  }
}