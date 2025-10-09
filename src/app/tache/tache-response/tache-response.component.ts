import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TacheService } from 'src/app/service/tache.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tache-response',
  template: '<div>Traitement de votre réponse...</div>'
})
export class TacheResponseComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private tacheService: TacheService,
    private router: Router,
    private authService: AuthService // Assuming you have an AuthService to handle authentication
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const taskId = +params['taskId']; // Convert to number
      const response = params['response'];
  
      console.log('Traitement de la réponse:', { taskId, response });
  
      // Retrieve the current user using the authService
      const currentUser = this.authService.getCurrentUser();
  
      if (currentUser && currentUser.token) {
        const token = currentUser.token;
  
        // Use the existing acceptTask method to accept the task with both taskId and token
        this.tacheService.acceptTask(taskId, token).subscribe({
          next: (result) => {
            console.log('Tâche acceptée avec succès:', result);
          },
          error: (error) => {
            console.error('Erreur lors de l\'acceptation de la tâche:', error);
            console.log('Error details:', error.error); // Additional error information from the backend
          }
        });
      } else {
        console.error('Token manquant pour accepter la tâche');
      }
    });
  }
  
  
}
