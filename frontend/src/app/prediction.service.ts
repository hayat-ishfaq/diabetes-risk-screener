import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionRequest {
  [key: string]: string | number;
}

export interface PredictionResponse {
  prediction: number;
  probabilities: [number, number] | number[];
  task: string;
  disclaimer: string;
}

export interface HealthResponse {
  status: string;
  feature_count: number;
  task: string;
  model_version: string;
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private http = inject(HttpClient);
  private apiUrl = '/api';

  predict(payload: PredictionRequest): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict`, payload);
  }

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.apiUrl}/health`);
  }
}
