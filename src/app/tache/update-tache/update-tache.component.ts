import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TacheService } from 'src/app/service/tache.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-update-tache',
  templateUrl: './update-tache.component.html',
  styleUrls: ['./update-tache.component.css']
})
export class UpdateTacheComponent implements OnInit {
  id: number = this.activatedRoute.snapshot.params["id"];
  updateTacheForm!: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private service: TacheService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

 ngOnInit() {
     const today = new Date().toISOString().split('T')[0]; // Date d'aujourd'hui en format ISO
 
     this.updateTacheForm = this.fb.group({
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
  
      this.GetTacheById();
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
   
   GetTacheById() {
    const token = this.authService.getToken(); // Get the token
    if (!token) {
      console.error('Token manquant pour récupérer les données de la tâche');
      return;
    }
  
    // Pass the token to the service
    this.service.ggetTacheById(this.id, token).subscribe((data) => {
      console.log('Données récupérées :', data);
      this.updateTacheForm.patchValue(data);
      console.log('Formulaire mis à jour :', this.updateTacheForm.value);
    });
  }
  updateTache() {
    console.log('Données du formulaire :', this.updateTacheForm.value);
    const token = this.authService.getToken(); // Ensure you have the token
  
    if (!token) {
      console.error('Token manquant pour la mise à jour de la tâche');
      return;
    }
  
    this.service.updateTache(this.id, this.updateTacheForm.value).subscribe({
      next: (data) => {
        console.log("Tâche modifiée avec succès", data);
        // Rediriger vers la page /get-all-tache après une mise à jour réussie
        this.router.navigateByUrl("/get-all-tache");
      },
      error: (error: HttpErrorResponse) => {
        console.error("Erreur lors de la modification de la tâche", error.message);
      }
    });
  }
  
  
}