import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { Status, PaymentMode, Bill as ModelBill, StockReference as ModelStockReference } from '../models/bill.model';
import { AuthService } from './auth.service';

// Export the renamed enums
export { Status, PaymentMode } from '../models/bill.model';

// Make sure these interfaces are compatible with the model versions
export interface StockReference extends ModelStockReference {
  // Nous utilisons l'interface du modèle directement pour assurer la compatibilité
  name?: string;
}

export interface Bill extends ModelBill {
  // Nous utilisons l'interface du modèle directement pour assurer la compatibilité
}

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'http://localhost:8081/spring/bill';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient
    , private authService: AuthService // Inject AuthService to get the token
  ) { 
    console.log('BillService a été initialisé');
  }

  // Méthode de gestion d'erreur générique
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur HTTP détaillée:', error);
    
    let errorMessage = '';
    if (error.status === 0) {
      errorMessage = 'Problème de connexion au serveur. Vérifiez votre connexion réseau.';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur. Veuillez vérifier que les données sont correctes et réessayer.';
      console.error('Données de la requête:', error.error);
    } else {
      if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && typeof error.error === 'object') {
        if (error.error.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
        }
      } else {
        errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getAllBills(): Observable<Bill[]> {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('Aucun token trouvé.');
      return throwError(() => new Error('Token manquant pour authentification.'));
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  
    console.log('Appel à getAllBills() - Tentative de récupération de toutes les factures');
    return this.http.get<Bill[]>(`${this.apiUrl}/all`, httpOptions)
      .pipe(
        tap(bills => console.log(`${bills.length} factures récupérées`)),
        retry(1),
        catchError(this.handleError)
      );
  }
  
  getBillById(id: number): Observable<Bill> {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('Token manquant pour getBillById');
      return throwError(() => new Error('Token requis pour cette opération.'));
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  
    console.log(`Appel à getBillById(${id}) - Tentative de récupération de la facture`);
    return this.http.get<Bill>(`${this.apiUrl}/${id}`, httpOptions)
      .pipe(
        tap(bill => console.log('Facture récupérée:', bill)),
        catchError(this.handleError)
      );
  }
  

  // Créer une nouvelle facture
  createBill(bill: Bill): Observable<Bill> {
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
  
    const billToSend = this.prepareBillForServer(bill);
  
    console.log('Bill data being sent to server:', JSON.stringify(billToSend));
  
    return this.http.post<Bill>(`${this.apiUrl}/add`, billToSend, httpOptions)
      .pipe(
        tap(createdBill => console.log('Facture créée:', createdBill)),
        catchError((error) => {
          console.error('Erreur lors de la création de la facture:', error);
          console.error('Données envoyées:', billToSend);
          console.error('URL de requête:', `${this.apiUrl}/add`);
          return this.handleError(error);
        })
      );
  }
  
  updateBill(id: number, bill: Bill): Observable<Bill> {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('Token manquant pour updateBill');
      return throwError(() => new Error('Token requis pour cette opération.'));
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  
    console.log(`Appel à updateBill(${id}) - Données envoyées:`, bill);
    return this.http.put<Bill>(`${this.apiUrl}/update/${id}`, bill, httpOptions)
      .pipe(
        tap(updatedBill => console.log('Facture mise à jour:', updatedBill)),
        catchError(this.handleError)
      );
  }
  
  deleteBill(id: number): Observable<void> {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('Token manquant pour deleteBill');
      return throwError(() => new Error('Token requis pour cette opération.'));
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      })
    };
  
    console.log(`Appel à deleteBill(${id}) - Tentative de suppression`);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, httpOptions)
      .pipe(
        tap(() => console.log('Facture supprimée avec succès')),
        catchError(this.handleError)
      );
  }
  

  // Récupérer les valeurs valides pour les énumérations
  getValidValues(): Observable<any> {
    console.log('Appel à getValidValues() - Récupération des valeurs valides');
    return this.http.get<any>(`${this.apiUrl}/info`)
      .pipe(
        tap(info => console.log('Valeurs valides récupérées:', info)),
        catchError(this.handleError)
      );
  }

  // Tester la connexion au backend
  testConnection(): Observable<string> {
    console.log('Appel à testConnection() - Vérification de la connexion au backend');
    return this.http.get(`${this.apiUrl}/test`, { responseType: 'text' })
      .pipe(
        tap(response => console.log('Réponse du test de connexion:', response)),
        catchError(this.handleError)
      );
  }

  // Récupérer le nom du stock associé à une facture
  getStockNameForBill(billId: number): Observable<any> {
    console.log(`Appel à getStockNameForBill(${billId}) - Récupération du stock associé`);
    return this.http.get<any>(`${this.apiUrl}/stock-name/${billId}`)
      .pipe(
        tap(response => console.log('Stock associé récupéré:', response)),
        catchError(this.handleError)
      );
  }

  // Prépare les données de la facture pour l'envoi au serveur
  private prepareBillForServer(bill: Bill): any {
    // Créer une nouvelle copie pour éviter de modifier l'original
    const billCopy: any = {};
    
    // Copier uniquement les champs nécessaires pour éviter les données supplémentaires
    billCopy.num_Bill = bill.num_Bill;
    
    // Formater la date (YYYY-MM-DD)
    if (bill.date) {
      try {
        const dateObj = new Date(bill.date);
        if (!isNaN(dateObj.getTime())) {
          billCopy.date = dateObj.toISOString().split('T')[0];
        } else {
          billCopy.date = bill.date;
        }
      } catch (err) {
        console.error('Error formatting date:', err);
        billCopy.date = bill.date;
      }
    }
    
    // S'assurer que le montant total est un nombre
    billCopy.total_Amount = Number(bill.total_Amount);
    
    // Ajouter les champs status et paymentMode tels quels
    billCopy.status = bill.status;
    billCopy.paymentMode = bill.paymentMode;
    
    // Formater l'objet stock si présent
    if (bill.stock && bill.stock.id_stock) {
      billCopy.stock = { id_stock: Number(bill.stock.id_stock) };
    } else {
      billCopy.stock = null;
    }
    
    // Ajouter l'ID pour les mises à jour
    if (bill.id_Bill) {
      billCopy.id_Bill = bill.id_Bill;
    }
    
    console.log('Formatted bill data for server:', billCopy);
    return billCopy;
  }
}
