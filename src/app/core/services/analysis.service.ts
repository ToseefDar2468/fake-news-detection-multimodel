import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import {
  AnalysisHistoryItem,
  AnalysisRequest,
  AnalysisResponse,
} from '../models/analysis.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly backendEnabled = environment.enableBackendIntegration;

  analyzeNews(request: AnalysisRequest): Observable<AnalysisResponse> {
    if (!this.backendEnabled) {
      return throwError(
        () =>
          new Error(
            'Backend integration is disabled. Point apiBaseUrl to the FastAPI service and set enableBackendIntegration to true.',
          ),
      );
    }

    const payload = new FormData();
    payload.append('text', request.text);
    payload.append('image', request.image, request.image.name);

    return this.http.post<AnalysisResponse>(`${this.baseUrl}/analysis`, payload);
  }

  getHistory(): Observable<AnalysisHistoryItem[]> {
    if (!this.backendEnabled) {
      return of([]);
    }

    return this.http.get<AnalysisHistoryItem[]>(`${this.baseUrl}/history`);
  }
}
