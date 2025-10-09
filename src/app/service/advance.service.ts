import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Advance } from '../models/advance.model';
import { AuthService } from '../services/auth.service';



@Injectable({
  providedIn: 'root'
})
export class AdvanceService {
  private apiUrl = 'http://localhost:8081/advance';  

  constructor(private http: HttpClient,
    private authService : AuthService
  ) { }

  addAdvance(advance: any): Observable<any> {
    const token = this.authService.getToken(); // Retrieve token
  
    if (!token) {
      console.error('Token manquant pour ajouter une avance');
      return of(null); // Prevents sending request if no token
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const advanceWithUser = {
      ...advance,
      user: { id: 1 } // Replace with dynamic user ID if needed
    };
  
    return this.http.post(`${this.apiUrl}/add-advance`, advanceWithUser, { headers });
  }
  
  getAdvances(): Observable<Advance[]> {
    const token = this.authService.getToken(); // Récupérer le token
  
    if (!token) {
      console.error('Token manquant pour récupérer les avances');
      return of([]); // Retourne une liste vide si le token est manquant
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<Advance[]>(`${this.apiUrl}/retrieve-all-advances`, { headers });
  }
  
  deleteAdvance(id: number): Observable<any> {
    const token = this.authService.getToken(); // Ensure you have the token
  
    if (!token) {
      console.error('Token manquant pour la suppression de l\'avance');
      return of(null); // Return an empty observable if token is missing
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.delete(`${this.apiUrl}/remove-advance/${id}`, { headers });
  }
  
  updateAdvance(advance: Advance): Observable<any> {
    const token = this.authService.getToken(); // Ensure you have the token
  
    if (!token) {
      console.error('Token manquant pour la mise à jour de l\'avance');
      return of(null); // Return an empty observable if token is missing
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Ensure content-type is set for the request body
    });
  
    return this.http.put(`${this.apiUrl}/modify-advance`, advance, { headers });
  }
  
  getAdvanceById(id: number): Observable<Advance> {
    const token = this.authService.getToken(); // Récupérer le token
  
    if (!token) {
      console.error('Token manquant pour récupérer l\'avance');
      return of({} as Advance); // Retourne un objet vide si le token est manquant
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<Advance>(`${this.apiUrl}/retrieve-advance/${id}`, { headers });
  }
  updateAdvanceStatus(id: number, status: string, headers: HttpHeaders) {
    // First get the existing advance
    return this.http.get(`${this.apiUrl}/retrieve-advance/${id}`, { headers }).pipe(
      switchMap((advance: any) => {
        // Then update its status while keeping other properties
        const updatedAdvance = {
          id: advance.id,
          amount_request: advance.amount_request,
          requestDate: advance.requestDate,
          reason: advance.reason,
          status: status,
          user: { id: 1 }  // Ensure we always send a valid user ID
        };
        
        console.log('Original advance:', advance);
        console.log('Sending update:', updatedAdvance);
        
        // Try sending a simpler object
        const simpleUpdate = {
          id: id,
          status: status,
          amount_request: advance.amount_request,
          reason: advance.reason,
          requestDate: new Date(advance.requestDate),
          user: { id: 1 }
        };
  
        return this.http.put(`${this.apiUrl}/modify-advance`, simpleUpdate, { headers }); // Include headers here
      })
    );
  }
  
  canApproveAdvance(advanceId: number, headers: HttpHeaders) {
    return this.http.get<boolean>(`${this.apiUrl}/can-approve?userId=2&advanceId=${advanceId}`, { headers: headers });
  }
  

  sendStatusEmail(advanceId: number, status: string, userEmail: string) {
    return this.http.post(`${this.apiUrl}/send-status-email`, {
      advanceId: advanceId,
      status: status,
      email: userEmail
    });
  }

  sendStatusNotification(advanceId: number, status: string, userId: number) {
    return this.http.post(`${this.apiUrl}/notify-status`, {
      advanceId: advanceId,
      status: status,
      userId: userId
    });
  }notifyUser(advanceId: number, status: string, userEmail: string, headers?: HttpHeaders): Observable<any> {
    const subject = "Status Update";
    const logoUrl = "https://i.imgur.com/YX34wNO.png";
    const message = `
      <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 40px; text-align: center;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); display: inline-block; text-align: center; max-width: 600px;">
          <img src="${logoUrl}" alt="App Logo" style="max-width: 120px; margin-bottom: 20px; border-radius: 5%; box-shadow: 0 0 10px rgba(0,0,0,0.3);">
          
          <h2 style="color: #4CAF50; margin-bottom: 10px;">Advance Request Update</h2>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Your advance request has been 
            <strong style="color: ${status.toLowerCase() === 'approved' ? '#4CAF50' : '#FF5733'};">
              ${status.toLowerCase()}
            </strong>.
          </p>
          
          <p style="font-size: 14px; color: #666;">Thank you for trusting us. We are always here to serve you!</p>
          
          <a href="http://localhost:4200" style="background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 20px;">
            Visit Our App
          </a>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">If you have any questions, contact our support team.</p>
        </div>
      </div>
    `;
  
    const options = {
      headers: headers,
      params: {
        to: userEmail,
        subject: subject,
        body: message,
        isHtml: 'true' // Add this parameter if your backend needs to differentiate HTML content
      },
      responseType: 'text' as 'json' // Ensure the response type is set
    };
  
    return this.http.post(`${this.apiUrl}/send`, null, options); // Pass the options in the third argument
  }
  
  
  
  
}
