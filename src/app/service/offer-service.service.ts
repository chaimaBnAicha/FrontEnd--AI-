import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { Offer, OfferStatus, TypeOffer } from '../models/offer.model';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Interface for raw data from backend
interface RawOffer {
  id_offer: number;
  title?: string;        // lowercase from backend
  description?: string;  // lowercase from backend
  start_Date?: string;   // mixed case from backend
  end_Date?: string;     // mixed case from backend
  typeoffer?: string;    // lowercase from backend
  status?: string;       // lowercase from backend
  user_id?: number;
}

// Update the interface to match backend format
interface UpdateOfferDto {
  id_offer: number;
  user: {
    id: number;
  };
  description: string;
  title: string;
  status: string;
  start_Date: string;
  typeoffer: string;
  end_Date: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfferServiceService {
  private apiUrl = 'http://localhost:8081/offer';

  constructor(private http: HttpClient,private authService : AuthService) { }

  // Create - Add a new offer
  createOffer(offer: Offer): Observable<any> {
    const token = this.authService.getToken();  // Get the token from the auth service (replace with your method)
  
    // If the token is missing, you can handle the case accordingly
    if (!token) {
      console.error('Authentication token is missing');
      return throwError(() => new Error('Authentication token is missing'));
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Add the token to the Authorization header
    });
  
    // Format dates to match backend expectations
    const startDate = new Date(offer.Start_Date as string);
    const endDate = new Date(offer.End_Date as string);
  
    // Format the offer to match the backend's expected structure exactly
    const formattedOffer = {
      user: {
        id: 1  // Default user id
      },
      description: offer.Description.toLowerCase(),
      title: offer.Title.toLowerCase(),
      status: "ACTIVE",
      start_Date: startDate.toISOString(),
      typeoffer: offer.Typeoffer.toString(),
      end_Date: endDate.toISOString(),
      sendEmail: true  // Add flag to trigger email notification
    };
  
    console.log('Sending formatted offer:', JSON.stringify(formattedOffer, null, 2));
  
    return this.http.post<any>(`${this.apiUrl}/add-Offer`, formattedOffer, { headers }).pipe(
      tap(response => {
        console.log('Offer created successfully:', response);
      }),
      catchError(error => {
        console.error('Error creating offer:', error);
        return throwError(() => error);
      })
    );
  }
  
  getAllOffers(): Observable<Offer[]> {
    const token = this.authService.getToken();  // Get the token (replace with your method)
  
    // If the token is missing, you can handle the case accordingly
    if (!token) {
      console.error('Authentication token is missing');
      return throwError(() => new Error('Authentication token is missing'));
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`  // Add the token to the Authorization header
    });
  
    return this.http.get<RawOffer[]>(`${this.apiUrl}/retrieve-all-Offers`, { headers }).pipe(
      map(offers => {
        console.log('Raw offers from backend:', JSON.stringify(offers, null, 2));
        return offers.map(rawOffer => {
          try {
            // Parse dates properly
            const startDate = rawOffer.start_Date ? new Date(rawOffer.start_Date) : null;
            const endDate = rawOffer.end_Date ? new Date(rawOffer.end_Date) : null;
  
            // Convert type and status strings to enums
            const offerType = rawOffer.typeoffer as TypeOffer || TypeOffer.Insurance;
            const offerStatus = (rawOffer.status?.toUpperCase() as OfferStatus) || OfferStatus.ACTIVE;
  
            const processedOffer: Offer = {
              id_offer: rawOffer.id_offer,
              Title: rawOffer.title || '',
              Description: rawOffer.description || '',
              Start_Date: startDate,
              End_Date: endDate,
              Typeoffer: offerType,
              Status: offerStatus,
              user_id: rawOffer.user_id || 0
            };
            console.log('Processed offer:', processedOffer);
            return processedOffer;
          } catch (error) {
            console.error('Error processing offer:', error);
            return null;
          }
        }).filter(offer => offer !== null) as Offer[];
      }),
      catchError(error => {
        console.error('Error fetching offers:', error);
        return throwError(() => error);
      })
    );
  }
  
  getOfferById(id: number): Observable<Offer> {
    const token = this.authService.getToken();  // Get the token (replace with your method)
  
    // If the token is missing, handle the case
    if (!token) {
      console.error('Authentication token is missing');
      return throwError(() => new Error('Authentication token is missing'));
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`  // Add token to Authorization header
    });
  
    return this.http.get<RawOffer>(`${this.apiUrl}/retrieve-Offer/${id}`, { headers }).pipe(
      map(rawOffer => ({
        id_offer: rawOffer.id_offer,
        Title: rawOffer.title || '',
        Description: rawOffer.description || '',
        Start_Date: rawOffer.start_Date ? new Date(rawOffer.start_Date) : null,
        End_Date: rawOffer.end_Date ? new Date(rawOffer.end_Date) : null,
        Typeoffer: rawOffer.typeoffer as TypeOffer || TypeOffer.Insurance,
        Status: rawOffer.status as OfferStatus || OfferStatus.ACTIVE,
        user_id: rawOffer.user_id || 0
      }))
    );
  }
  

  // Update - Update an existing offer
  updateOffer(id: number, offer: UpdateOfferDto, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Add token to Authorization header
    });
  
    return this.http.put(`${this.apiUrl}/modify-Offer`, offer, { headers });
  }
  
  // Delete - Delete an offer
  deleteOffer(id: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add token to Authorization header
    });
  
    return this.http.delete(`${this.apiUrl}/remove-Offer/${id}`, { headers });
  }
  
}
