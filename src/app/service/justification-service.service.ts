import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JustificationService {
  private apiUrl = 'http://localhost:8081/api/justifications';

  constructor(private http: HttpClient) {}

  addJustification(requestId: number, justificationText: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain',
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.post(`${this.apiUrl}/add/${requestId}`, justificationText, { headers });
  }
  
  

  // Méthode pour récupérer la justification
  getJustification(requestId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${requestId}`);
  }
}
