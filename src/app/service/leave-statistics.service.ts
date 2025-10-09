import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaveStatisticsService {
  private apiUrl = 'http://localhost:8081/leave';

  constructor(private http: HttpClient) { }

  getLeaveCountByType(headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}/leave-count-by-type`, { headers });
  }
  

  getAverageLeaveDuration(headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}/average-leave-duration`, { headers });
  }
  getLeavesByMonth(headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaves-by-month`, { headers });
  }
  
} 