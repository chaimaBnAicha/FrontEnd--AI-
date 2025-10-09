import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from 'src/app/service/request.service';

@Component({
  selector: 'app-update-request',
  templateUrl: './update-request.component.html',
  styleUrls: ['./update-request.component.css']
})
export class UpdateRequestComponent {
  updateRequestForm: FormGroup;
  id_projet: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private service: RequestService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.id_projet = this.activatedRoute.snapshot.params["id_projet"];
    this.updateRequestForm = this.fb.group({
      project_name: [null, [Validators.required]],
      description: [null, [Validators.required]],
      estimated_budget: [null, [Validators.required]],
      estimated_duration: [null, [Validators.required]],
      geographic_location: [null, [Validators.required]],
      user_id: [null, [Validators.required]], // Champ pour l'ID de l'utilisateur
    });
  }

  ngOnInit() {
    this.getRequestById();
  }

  // Récupérer la requête par ID et pré-remplir le formulaire
  getRequestById() {
    this.service.getAllRequestById(this.id_projet).subscribe(
      (res) => {
        console.log('Requête reçue:', res);
        if (res && typeof res === 'object') {
          // Pré-remplir le formulaire avec les données reçues
          this.updateRequestForm.patchValue({
            project_name: res.project_name,
            description: res.description,
            estimated_budget: res.estimated_budget,
            estimated_duration: res.estimated_duration,
            geographic_location: res.geographic_location,
            user_id: res.user?.id, // Assurez-vous que l'ID de l'utilisateur est inclus
          });
        } else {
          console.error('La réponse de l\'API est vide ou invalide.');
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération de la requête:', error);
      }
    );
  }

  // Mettre à jour la requête
  updateRequest() {
    // Préparer les données pour la mise à jour
    const requestData = {
      ...this.updateRequestForm.value,
      user: { id: this.updateRequestForm.value.user_id } // Inclure l'objet user avec l'ID
    };

    // Envoyer la requête de mise à jour
    this.service.updateRequest(this.id_projet, requestData).subscribe(
      (res) => {
        console.log('Requête mise à jour avec succès:', res);
        this.router.navigate(['/all-request']);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de la requête:', error);
      }
    );
  }
}