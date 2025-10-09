import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EtapeService, Etape } from 'src/app/service/etape.service';
import { TacheService, Tache } from 'src/app/service/tache.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-edit-etape',
  templateUrl: './edit-etape.component.html',
  styleUrls: ['./edit-etape.component.css']
})
export class EditEtapeComponent implements OnInit {
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
    private route: ActivatedRoute,
    private router: Router,
    private etapeService: EtapeService,
    private tacheService: TacheService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTaches();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadEtape(id);
    }
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
  
  loadEtape(id: number): void {
    const currentUser = this.authService.getCurrentUser();
  
    if (!currentUser || !currentUser.token) {
      console.error('Token manquant pour charger l’étape');
      return;
    }
  
    const token = currentUser.token;
  
    this.etapeService.getEtapeById(id, token).subscribe({
      next: (data: Etape) => {
        this.etape = {
          ...data,
          dateDebut: new Date(data.dateDebut).toISOString().split('T')[0],
          dateFin: new Date(data.dateFin).toISOString().split('T')[0]
        };
        this.selectedTacheId = data.tacheId || 0;
        console.log('Loaded etape:', this.etape);
      },
      error: (error) => {
        console.error('Error loading etape:', error);
        this.router.navigate(['/etape/list']);
      }
    });
  }
  
  onSubmit(): void {
    if (this.etape.id) {
      const currentUser = this.authService.getCurrentUser();
  
      if (!currentUser || !currentUser.token) {
        console.error('Token manquant pour modifier l’étape');
        return;
      }
  
      const token = currentUser.token;
  
      const updatedEtape = {
        ...this.etape,
        tacheId: this.selectedTacheId,
        id: this.etape.id
      };
  
      console.log('Sending update request with data:', updatedEtape);
  
      this.etapeService.modifierEtape(this.etape.id, updatedEtape, token).subscribe({
        next: (response) => {
          console.log('Etape updated successfully:', response);
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error updating etape:', error);
        }
      });
    }
  }
  
}
