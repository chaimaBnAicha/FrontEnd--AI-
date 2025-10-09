import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Etape {
  id?: number;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  tacheId?: number; // Add this line
}
@Injectable({
  providedIn: 'root',
})
export class EtapeService {
  private apiUrl = 'http://localhost:8081/api/etapes';

  constructor(private http: HttpClient) {}

  getAllEtapes(token: string): Observable<Etape[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<Etape[]>(`${this.apiUrl}/all`, { headers });
  }
  
  getEtapeById(id: number, token: string): Observable<Etape> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<Etape>(`${this.apiUrl}/${id}`, { headers });
  }
  

 /* getEtapesByTacheId(tacheId: number): Observable<Etape[]> {
    return this.http.get<Etape[]>(`${this.apiUrl}/byTache/${tacheId}`);
  }*/getEtapesByTacheId(tacheId: number, token: string): Observable<Etape[]> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<Etape[]>(`${this.apiUrl}/tache/${tacheId}`, { headers });
}
ajouterEtape(tacheId: number, etape: Etape, token: string): Observable<Etape> {
  const formattedEtape = {
    ...etape,
    dateDebut: new Date(etape.dateDebut).toISOString(),
    dateFin: new Date(etape.dateFin).toISOString()
  };

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.post<Etape>(`${this.apiUrl}/${tacheId}/ajouter`, formattedEtape, { headers });
}

modifierEtape(id: number, etape: Etape, token: string): Observable<Etape> {
  const formattedEtape = {
    ...etape,
    dateDebut: new Date(etape.dateDebut).toISOString(),
    dateFin: new Date(etape.dateFin).toISOString()
  };

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.put<Etape>(`${this.apiUrl}/${id}/modifier`, formattedEtape, { headers });
}

supprimerEtape(id: number, token: string): Observable<void> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.delete<void>(`${this.apiUrl}/${id}/supprimer`, { headers });
}

}