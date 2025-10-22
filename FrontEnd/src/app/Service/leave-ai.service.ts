import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Leave } from '../models/leave.model';
import { environment } from '../../environments/environment';

interface AIAnalysisResponse {
  confidenceScore: number;
  analysisResult: string;
  recommendedApproval: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveAIService {
  private apiUrl = 'http://localhost:8081/leave';

  constructor(private http: HttpClient) {}

  analyzeLeaveRequest(leave: Leave): Observable<AIAnalysisResponse> {
    return this.http.post<AIAnalysisResponse>(`${this.apiUrl}/analyze-leave`, {
      start_date: new Date(leave.start_date).toISOString(),
      end_date: new Date(leave.end_date).toISOString(),
      reason: leave.reason,
      documentAttachement: leave.documentAttachement || null,
      type: leave.type,
      status: "Pending"  // Since we're analyzing new requests
    });
  }
}