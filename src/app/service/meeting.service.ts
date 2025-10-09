import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = 'http://localhost:8081/api/meetings';

  constructor(private http: HttpClient,
    private authService: AuthService // Inject AuthService to access the token
  ) {}

  createMeeting(meetingData: any): Observable<any> {
    const token = this.authService.getToken(); // Retrieve the token
    if (!token) {
      console.error('Token manquant pour la création de la réunion');
      return of(null); // Return an observable with null if token is missing
    }
  
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`); // Add the Authorization header with the token
  
    return this.http.post(`${this.apiUrl}/create`, meetingData, { headers });
  }
  

  getMeeting(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  getAllMeetings(): Observable<any[]> {
    const token = this.authService.getToken(); // Retrieve the token
    if (!token) {
      console.error('Token manquant pour récupérer les réunions');
      return of([]); // Return an empty array if the token is missing
    }
  
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`); // Add the Authorization header with the token
  
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers });
  }
  
}