import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// Types pour les réponses de l'API
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  publicKey?: string;
}

export interface PaymentConfirmationResponse {
  message: string;
  bill: any;
}

export interface StripeConfig {
  publicKey: string;
}

// Nouveau type pour l'historique des paiements
export interface PaymentHistoryItem {
  paymentId: string;
  billId: number;
  billNumber: string;
  date: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  metadata?: {
    stockId?: number;
    stockName?: string;
    processingDate?: string;
    paymentMode?: string;
    paymentStatus?: string;
    [key: string]: any; // Pour d'autres métadonnées
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;
  private stripePublicKey = environment.stripePublicKey;
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient
    , private authService : AuthService
  ) { }

  /**
   * Récupère la configuration de Stripe (clé publique)
   */
  getStripeConfig(): Observable<StripeConfig> {
    // Pour éviter des problèmes de réseau, renvoyer directement la clé provenant de environment
    return of({ publicKey: this.stripePublicKey });
    
    // Si vous voulez toujours essayer de récupérer du serveur d'abord
    /*
    return this.http.get<StripeConfig>(`${this.apiUrl}/payment/config`).pipe(
      tap(config => console.log('Stripe config retrieved successfully')),
      catchError(error => {
        console.error('Error fetching Stripe config:', error);
        // Fallback à la clé locale en cas d'erreur
        return of({ publicKey: this.stripePublicKey });
      })
    );
    */
  }

  /**
   * Crée un PaymentIntent Stripe pour une facture
   */createPaymentIntent(billId: number): Observable<PaymentIntentResponse> {
  const token = this.authService.getToken(); // Assure-toi que ce service existe et renvoie le token

  if (!token) {
    console.error('Token JWT manquant pour createPaymentIntent');
    return throwError(() => new Error('Token requis pour effectuer un paiement'));
  }

  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
  };

  console.log(`Creating payment intent for bill ${billId}`);
  return this.http.post<PaymentIntentResponse>(
    `${this.apiUrl}/payment/create-payment-intent/${billId}`,
    {},
    httpOptions
  ).pipe(
    tap(response => {
      if (!response.publicKey) {
        response.publicKey = this.stripePublicKey;
      }
      console.log('Payment intent created successfully');
    }),
    catchError(this.handleError('createPaymentIntent'))
  );
}

confirmPayment(billId: number, paymentIntentId: string): Observable<PaymentConfirmationResponse> {
  const token = this.authService.getToken();

  if (!token) {
    console.error('Token JWT manquant pour confirmPayment');
    return throwError(() => new Error('Token requis pour confirmer le paiement'));
  }

  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
  };

  return this.http.post<PaymentConfirmationResponse>(
    `${this.apiUrl}/payment/confirm/${billId}/${paymentIntentId}`, 
    {}, 
    httpOptions
  ).pipe(
    tap(response => console.log('Payment confirmed successfully')),
    catchError(this.handleError('confirmPayment'))
  );
}


  /**
   * Annule un paiement en cours
   */
  cancelPayment(paymentIntentId: string): Observable<{ message: string, status: string }> {
    return this.http.post<{ message: string, status: string }>(
      `${this.apiUrl}/payment/cancel/${paymentIntentId}`, 
      {}, 
      this.httpOptions
    ).pipe(
      tap(response => console.log('Payment canceled successfully')),
      catchError(this.handleError('cancelPayment'))
    );
  }

  /**
   * Vérifie le statut d'un payment intent
   */
  checkPaymentStatus(paymentIntentId: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(
      `${this.apiUrl}/payment/status/${paymentIntentId}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError('checkPaymentStatus'))
    );
  }

  /**
   * Récupère l'historique des paiements
   * Maintenant simulé en mode statique
   */
  getPaymentHistory(): Observable<PaymentHistoryItem[]> {
    // Utilisation d'une implémentation statique en attendant le backend
    console.log('Appel à getPaymentHistory() - Utilisant des données statiques');
    const staticData = this.generateStaticPaymentData();
    
    // Simuler un délai de réseau
    return of(staticData).pipe(
      delay(800), // Attendre 800ms pour simuler un délai réseau
      tap(data => console.log('Payment history retrieved (static):', data.length, 'items')),
      catchError(error => {
        console.error('Error in static payment history:', error);
        return throwError(() => new Error('Erreur lors de la récupération des données statiques'));
      })
    );
  }

  /**
   * Récupère les détails d'un paiement spécifique
   * Maintenant simulé en mode statique
   */
  getPaymentDetails(paymentId: string): Observable<PaymentHistoryItem> {
    // Utilisation d'une implémentation statique en attendant le backend
    console.log('Appel à getPaymentDetails() - Utilisant des données statiques');
    const allPayments = this.generateStaticPaymentData();
    const payment = allPayments.find(p => p.paymentId === paymentId);
    
    if (payment) {
      return of(payment).pipe(
        delay(500), // Simuler un délai réseau
        tap(details => console.log('Payment details retrieved (static):', details))
      );
    } else {
      return throwError(() => new Error('Paiement non trouvé'));
    }
  }

  /**
   * Génère des données statiques pour l'historique des paiements
   * @private
   */
  private generateStaticPaymentData(): PaymentHistoryItem[] {
    // Cette méthode sera appelée par les méthodes publiques pour obtenir des données statiques
    return [
      {
        paymentId: 'pi_1NqXYXKZ6Ga4ZnJ5H8hZfFvV',
        billId: 1,
        billNumber: 'BILL-2023-001',
        date: new Date().toISOString(),
        amount: 1250.50,
        status: 'succeeded',
        paymentMethod: 'Carte bancaire',
        metadata: {
          stockId: 1,
          stockName: 'Matériaux de construction',
          processingDate: new Date().toISOString(),
          paymentMode: 'PAID',
          paymentStatus: 'completed'
        }
      },
      // Ajouter plus de données selon vos besoins...
      // Ces données correspondent à celles dans le composant pour assurer la cohérence
    ];
  }

  /**
   * Gestionnaire d'erreur générique pour les opérations de paiement
   */
  private handleError(operation = 'operation') {
    return (error: any): Observable<any> => {
      console.error(`${operation} failed:`, error);
      const message = error.error?.message || error.message || `Une erreur est survenue lors de l'opération ${operation}`;
      return throwError(() => new Error(message));
    };
  }
}
