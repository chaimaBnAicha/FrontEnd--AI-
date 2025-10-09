import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Stock as StockModel, StockCategory } from '../BackOffice/stock/stock.model';
import { AuthService } from './auth.service';

export interface Stock {
  id_stock: number;
  name: string;
  quantity: number;
  unitPrice: number;
  description: string;
  category: StockCategory;
  bills?: any[];
}

export interface NewStock {
  name: string;
  quantity: number;
  unitPrice: number;
  description: string;
  category: StockCategory;
  bills?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:8081/spring/stock';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient,
    private authService: AuthService // Inject AuthService to get the token
  ) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      console.error('Erreur côté client:', error.error.message);
    } else {
      // Erreur côté serveur - afficher le code HTTP et le message
      console.error(
        `Code retour backend: ${error.status}, ` +
        `Corps: ${JSON.stringify(error.error)}`);
    }
    // Retourner un observable avec un message d'erreur
    return throwError(() => new Error('Une erreur est survenue; veuillez réessayer plus tard.'));
  }

  getAllStocks(): Observable<Stock[]> {
    const token = this.authService.getToken(); // Retrieve token
  
    if (!token) {
      console.error('No authentication token available.');
      return throwError(() => new Error('No authentication token available.'));
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  
    return this.http.get<Stock[]>(`${this.apiUrl}/all`, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  
  getStockById(id: number): Observable<Stock> {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('No authentication token available.');
      return throwError(() => new Error('No authentication token available.'));
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  
    return this.http.get<Stock>(`${this.apiUrl}/${id}`, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  
  addStock(stock: NewStock, token: string): Observable<object> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.post(`${this.apiUrl}/add`, stock, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }
  updateStock(id: number, stock: Stock): Observable<Stock> {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('No authentication token available.');
      return throwError(() => new Error('No authentication token available.'));
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  
    return this.http.put<Stock>(`${this.apiUrl}/update/${id}`, stock, httpOptions)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error updating stock:', error);
          let errorMessage = 'An unknown error occurred';
  
          if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
          } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
  
          return throwError(() => new Error(errorMessage));
        })
      );
  }
  
  deleteStock(id: number): Observable<void> {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('No authentication token available.');
      return throwError(() => new Error('No authentication token available.'));
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, httpOptions)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error deleting stock:', error);
          let errorMessage = 'An unknown error occurred';
  
          if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
          } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
  
          return throwError(() => new Error(errorMessage));
        })
      );
  }
  
}