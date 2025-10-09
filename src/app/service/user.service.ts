import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) {}

  getUserById(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/1`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return throwError(() => new Error('Erreur de récupération de l\'utilisateur.'));
      })
    );
  }
}
