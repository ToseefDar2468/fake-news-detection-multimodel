import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

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

  analyzeNews(request: AnalysisRequest): Observable<AnalysisResponse> {
    const payload = new FormData();
    payload.append('text', request.text);
    payload.append('image', request.image, request.image.name);

    return this.http.post<AnalysisResponse>(`${this.baseUrl}/analysis/analyze`, payload);
  }

  getHistory(): Observable<AnalysisHistoryItem[]> {
    return of([]);
  }
}
