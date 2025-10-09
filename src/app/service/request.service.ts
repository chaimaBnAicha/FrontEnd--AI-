import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const BASIC_URL = 'http://localhost:8081';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Creates HTTP headers with authorization token
   */
  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      this.handleMissingToken();
      throw new Error('No authentication token available');
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Handles missing token scenario
   */
  private handleMissingToken(): void {
    console.error('No authentication token found');
    this.router.navigate(['/login']);
  }

  /**
   * Handles HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    console.error('HTTP Error:', error);
    
    if (error.status === 401 || error.status === 403) {
      this.router.navigate(['/login']);
    }

    return throwError(() => new Error(
      error.error?.message || error.message || 'Server error'
    ));
  }

  // ========== CRUD Operations ========== //

  /**
   * Create a new request
   */
  postRequest(requestData: any): Observable<any> {
    return this.http.post(
      `${BASIC_URL}/api/RequestsPost`, 
      requestData,
      { 
        headers: this.createAuthHeaders(),
      }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  // Get user information by user ID (Example: user 1)
  getUserInfo(userId: number): Observable<any> {
    return this.http.get(`${BASIC_URL}/api/users/project/${userId}`, { headers: this.createAuthHeaders() });
  }
  
  
  // Get all requests
  getAllRequest(): Observable<any> {
    return this.http.get(`${BASIC_URL}/api/AllRequest`, { headers: this.createAuthHeaders() });
  }

  // Get request by project ID
  getAllRequestById(id_projet: number): Observable<any> {
    return this.http.get<any>(`${BASIC_URL}/api/request/${id_projet}`, { headers: this.createAuthHeaders() });
  }

  // Update an existing request by project ID
  updateRequest(id_projet: number, request: any): Observable<any> {
    return this.http.put(`${BASIC_URL}/api/request/${id_projet}`, request, { headers: this.createAuthHeaders() });
  }

  // Delete a request by project ID
  deleteRequest(id_projet: number): Observable<any> {
    return this.http.delete(`${BASIC_URL}/api/request/${id_projet}`, { headers: this.createAuthHeaders() });
  }

  // Get requests by status
  getRequestsByStatus(status: string): Observable<any> {
    return this.http.get(`${BASIC_URL}/api/requests/status?status=${status}`, { headers: this.createAuthHeaders() });
  }

  // Update request status by project ID
  updateRequestStatus(id_projet: number, status: string): Observable<any> {
    return this.http.put(`${BASIC_URL}/api/request/${id_projet}/status`, { status }, { headers: this.createAuthHeaders() });
  }

  // Get request details by project ID
  getRequestDetails(id_projet: number): Observable<any> {
    return this.http.get<any>(`${BASIC_URL}/api/request/${id_projet}`, { headers: this.createAuthHeaders() });
  }

  // Approve a request by project ID
  approveRequest(id_projet: number): Observable<any> {
    return this.http.put(`${BASIC_URL}/api/request/${id_projet}/approve`, {}, { headers: this.createAuthHeaders() });
  }

  // Reject a request by project ID
  rejectRequest(id_projet: number): Observable<any> {
    return this.http.put(`${BASIC_URL}/api/request/${id_projet}/reject`, {}, { headers: this.createAuthHeaders() });
  }

  // Get request statistics
  getRequestStatistics(): Observable<any> {
    return this.http.get(`${BASIC_URL}/api/statistics`, { headers: this.createAuthHeaders() });
  }

  // Compare two requests by project IDs
  compareTwoRequests(projectIds: number[]): Observable<any> {
    return this.http.post(`${BASIC_URL}/api/compare-requests`, projectIds, { headers: this.createAuthHeaders() });
  }
}
