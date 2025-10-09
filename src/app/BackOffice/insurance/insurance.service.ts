import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Insurance } from './insurance.interface';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {
  // Using direct backend URL for testing
  private apiUrl = 'http://localhost:8081/Insurance';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept'
    })
  };

  constructor(private http: HttpClient,private authService : AuthService) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}\nError Details: ${JSON.stringify(error.error)}`;
    }
    console.error('Full error details:', error);
    return throwError(() => errorMessage);
  }
  getAllInsurances(): Observable<Insurance[]> {
    const url = `${this.apiUrl}/retrieve-all-Insurances`;
    console.log('Fetching all insurances from:', url);
  
    // Retrieve the token from AuthService
    const token = this.authService.getToken();
    if (!token) {
      console.error('Utilisateur non authentifié.');
      // Return an empty observable to avoid sending a request without a token
      return of([] as Insurance[]);
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    // Make the GET request with the token headers
    return this.http.get<Insurance[]>(url, { headers })
      .pipe(
        tap(data => {
          console.log('Received data:', data);
          // Add user ID to each insurance record
          return data.map(insurance => ({
            ...insurance,
            user: { id: 1 }
          }));
        }),
        catchError(this.handleError)
      );
  }
  getInsuranceById(id: number): Observable<Insurance> {
    const token = this.authService.getToken(); // Récupération du token via AuthService
  
    if (!token) {
      console.error('Utilisateur non authentifié.');
      return throwError(() => new Error('Utilisateur non authentifié'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    const url = `${this.apiUrl}/retrieve-Insurance/${id}`;
    return this.http.get<Insurance>(url, { headers })
      .pipe(catchError(this.handleError));
  }
  
  createInsurance(insurance: Insurance): Observable<Insurance> {
    const token = this.authService.getToken(); // Get the token from AuthService

    // Set Authorization headers with the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Format the data to match backend expectations
    const formattedInsurance = {
      description: insurance.description,
      start_Date: insurance.start_Date,
      end_Date: insurance.end_Date,
      amount: insurance.amount,
      category: insurance.category,
      user: { id: 1 } // Set default user ID to 1
    };

    const url = `${this.apiUrl}/add-Insurance`;
    console.log('Creating insurance with formatted data:', formattedInsurance);
    console.log('Full request details:', {
      url: url,
      method: 'POST',
      headers: headers,
      body: formattedInsurance
    });

    // Make the POST request with the token in the header
    return this.http.post<Insurance>(url, formattedInsurance, { headers })
      .pipe(
        tap(response => console.log('Create insurance response:', response)),
        catchError(error => {
          console.error('Error in createInsurance:', error);
          return this.handleError(error);
        })
      );
  }updateInsurance(id: number, insurance: Insurance): Observable<Insurance> {
    const token = this.authService.getToken();  // Get the token from the auth service (replace with your method)
    
    // Add the token to the headers
    const httpOptionsWithToken = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  
    const formattedInsurance = {
      id_Insurance: id,
      description: insurance.description,
      start_Date: insurance.start_Date,
      end_Date: insurance.end_Date,
      amount: insurance.amount,
      category: insurance.category,
      user: { id: 1 } // Set default user ID to 1
    };
  
    const url = `${this.apiUrl}/modify-Insurance`;
    console.log('Updating insurance with formatted data:', formattedInsurance);
  
    return this.http.put<Insurance>(url, formattedInsurance, httpOptionsWithToken)  // Use updated headers with token
      .pipe(
        tap(response => console.log('Update insurance response:', response)),
        catchError(error => {
          console.error('Error in updateInsurance:', error);
          return this.handleError(error);
        })
      );
  }
  

  deleteInsurance(id: number): Observable<void> {
    const url = `${this.apiUrl}/remove-Insurance/${id}`;
  
    const token = this.authService.getToken(); // Récupération du token via AuthService
    if (!token) {
      console.error('Utilisateur non authentifié.');
      return throwError(() => new Error('Utilisateur non authentifié'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.delete<void>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }
  
} 