import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TacheService, Tache } from 'src/app/service/tache.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-post-tache',
  templateUrl: './post-tache.component.html',
  styleUrls: ['./post-tache.component.css']
})
export class PostTacheComponent implements OnInit {
  postTacheForm!: FormGroup;
  tache: Tache | null = null;
  isProcessing: boolean = false;
  processingMessage: string = '';
  ; // Assuming you have an AuthService to manage authentication

  constructor(
    private tacheService: TacheService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0]; // Date d'aujourd'hui en format ISO

    this.postTacheForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]], // Minimum 3 caractères
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(50)]], // Minimum 20, Maximum 50
      details: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(200)]], // Minimum 20, Maximum 200
      dureeEstimee: [null, [Validators.required, Validators.min(7)]], // Minimum 7 jours
      statut: ['A_FAIRE', Validators.required],
      priorite: ['MOYENNE', Validators.required],
      dateDebut: ['', [Validators.required, this.dateValidation(today)]], // Validation: date après aujourd'hui
      dateFin: ['', [Validators.required, this.dateEndValidation]], // Validation: minimum 1 jour après la date de début
      projet: this.fb.group({
        id: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      }),
      responsable: this.fb.group({
        id: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      }),
    });

    // Ajouter la gestion des paramètres de l'URL pour la réponse
    this.route.params.subscribe(params => {
      const taskId = params['taskId'];
      const response = params['response'];
      
      if (taskId && response) {
        this.handleTaskResponse(taskId, response);
      }
    });

    // S'abonner aux rafraîchissements
    this.tacheService.refreshNeeded$.subscribe(() => {
      this.loadTache();
    });
  }

  dateValidation(today: string) {
    return (control: AbstractControl) => {
      const inputDate = control.value;
      if (!inputDate) return null;
  
      const inputDateObj = new Date(inputDate);
      const todayObj = new Date(today);
      
      // Normalize time part of the date to ensure only date is compared
      todayObj.setHours(0, 0, 0, 0);
      inputDateObj.setHours(0, 0, 0, 0);
  
      return inputDateObj >= todayObj ? null : { dateInvalide: true }; // Date après aujourd'hui
    };
  }
  
  dateEndValidation(control: AbstractControl) {
    // Vérifiez si le contrôle a un parent (la FormGroup)
    if (!control.parent) {
      return null;
    }
  
    const startDate = control.parent.get('dateDebut')?.value;
    const endDate = control.value;
  
    if (!startDate || !endDate) {
      return null;
    }
  
    const diffInTime = new Date(endDate).getTime() - new Date(startDate).getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);
    return diffInDays >= 1 ? null : { dateFinInvalide: true };
  }
  
  handleTaskResponse(taskId: number, response: string) {
    if (response === 'oui' || response === 'non') {
      this.tacheService.respondToTask(taskId, response as 'oui' | 'non').subscribe({
        next: (data) => {
          console.log('✅ Réponse enregistrée avec succès', data);
          if (response === 'oui') {
            // Afficher un message de succès
            alert('Tâche acceptée ! Vous recevrez un email de confirmation avec un lien pour marquer la tâche comme terminée.');
          }
          this.router.navigateByUrl("/get-all-tache");
        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'enregistrement de la réponse', error);
          alert('Une erreur est survenue lors de l\'enregistrement de votre réponse.');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.postTacheForm && this.postTacheForm.valid) {
      console.log('Formulaire soumis avec succès', this.postTacheForm.value);
      this.postTache();
    } else {
      console.log('Formulaire invalide');
    }
  }
  
  postTache() {
    console.log('Données envoyées :', this.postTacheForm.value);
    
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('No authentication token available.');
      return;
    }
    
    this.tacheService.postTache(this.postTacheForm.value, token).subscribe({
      next: (data) => {
        console.log('Tâche créée avec succès', data);
        this.router.navigateByUrl("/get-all-tache");
      },
      error: (error) => {
        console.error('Erreur lors de la création de la tâche', error);
        // Show user-friendly error message
        alert(`Erreur lors de la création: ${error.message}`);
      }
    });
  }
  
  private handleSubmissionError(error: any) {
    if (error.status === 401 || error.status === 403) {
      this.router.navigate(['/login']);
    }
    // Add more specific error handling if needed
  }
  
  onChangeStatus(id: number) {
    this.tacheService.changeStatus(id).subscribe({
      next: (data) => {
        console.log('✅ Statut mis à jour avec succès', data);
        this.tache!.statut = data.statut; // Met à jour le statut dans l'affichage
      },
      error: (error) => {
        console.error('❌ Erreur lors du changement de statut', error);
      }
    });
  }

  markTaskAsDone(taskId: number): void {
    if (this.tache?.statut !== 'EN_COURS') {
      alert('Seules les tâches en cours peuvent être marquées comme terminées');
      return;
    }

    this.isProcessing = true;
    this.processingMessage = 'Initialisation du traitement...';
    
    console.log('Début du traitement pour la tâche:', taskId);
    
    this.tacheService.markTaskAsDone(taskId).subscribe({
      next: (updatedTache: Tache) => {
        console.log('Tâche mise à jour:', updatedTache);
        this.processingMessage = 'Mise à jour du statut...';
        
        if (updatedTache.statut === 'TERMINEE') {
          this.processingMessage = 'Finalisation du traitement...';
          setTimeout(() => {
            alert('Tâche marquée comme terminée avec succès !');
            this.loadTache();
            this.router.navigateByUrl("/get-all-tache");
          }, 1000);
        } else {
          alert('Erreur: Le statut n\'a pas été mis à jour en TERMINEE');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
        alert('Une erreur est survenue lors de la mise à jour de la tâche');
        this.isProcessing = false;
      },
      complete: () => {
        setTimeout(() => {
          this.isProcessing = false;
          this.processingMessage = '';
        }, 1000);
      }
    });
  }

  // Ajouter cette méthode pour charger/recharger la tâche
  loadTache() {
    const taskId = this.route.snapshot.params['taskId'];
    if (taskId) {
      const token = this.authService.getToken(); // Ensure you have the token
      if (!token) {
        console.error('Token manquant pour récupérer la tâche');
        return;
      }
  
      this.tacheService.ggetTacheById(taskId, token).subscribe({
        next: (data: Tache) => {
          this.tache = data;
          console.log('Tâche rechargée:', this.tache);
        },
        error: (error: HttpErrorResponse) => { // Explicitly type the error as HttpErrorResponse
          console.error('Erreur lors du rechargement de la tâche:', error.message);
        }
      });
    }
  }
  

  handleMarkAsDone(): void {
    if (!this.tache || !this.tache.id) {
      console.error('Pas de tâche sélectionnée');
      return;
    }

    this.isProcessing = true;
    this.processingMessage = 'Traitement de votre demande...';

    this.tacheService.markTaskAsDone(this.tache.id).subscribe({
      next: (updatedTache) => {
        console.log('Réponse du serveur:', updatedTache);
        if (updatedTache.statut === 'TERMINEE') {
          this.processingMessage = 'Tâche terminée avec succès !';
          setTimeout(() => {
            alert('La tâche a été marquée comme terminée avec succès !');
            this.router.navigate(['/get-all-tache']);
          }, 2000);
        } else {
          throw new Error('Le statut n\'a pas été mis à jour correctement');
        }
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.processingMessage = 'Erreur lors de la mise à jour';
        alert('Erreur lors de la mise à jour du statut : ' + error.message);
        this.isProcessing = false;
      }
    });
  }
}