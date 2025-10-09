import { Component, OnInit } from '@angular/core';
import { EtapeService, Etape } from 'src/app/service/etape.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-etape-filter',
  templateUrl: './etape-filter.component.html',
  styleUrls: ['./etape-filter.component.css']
})
export class EtapeFilterComponent implements OnInit {
  etapes: Etape[] = [];
  tacheId: number | null = null;

  constructor(
    private etapeService: EtapeService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tacheId = params['tacheId'] ? Number(params['tacheId']) : null;
      if (this.tacheId) {
        this.loadFilteredEtapes();
      }
    });
  }loadFilteredEtapes() {
    if (this.tacheId) {
      const token = this.authService.getToken(); // Get the token
  
      if (!token) {
        console.error('Token manquant pour charger les étapes');
        return;
      }
  
      // Pass both tacheId and token to the service method
      this.etapeService.getEtapesByTacheId(this.tacheId, token).subscribe({
        next: (data) => {
          this.etapes = data;
        },
        error: (error) => {
          console.error('Error loading filtered etapes:', error);
        }
      });
    }
  }
  
}
