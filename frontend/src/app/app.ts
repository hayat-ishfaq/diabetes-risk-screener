import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PredictionService, PredictionResponse, HealthResponse } from './prediction.service';
import { FEATURE_SCHEMA, FEATURE_GROUPS, FeatureMetadata, SAMPLE_PATIENT_PAYLOAD } from './feature-schema';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private fb = inject(FormBuilder);
  private predictionService = inject(PredictionService);
  private cdr = inject(ChangeDetectorRef);

  readonly featureGroups = FEATURE_GROUPS;
  readonly featureSchema = FEATURE_SCHEMA;

  form!: FormGroup;
  isLoading = false;
  backendOnline: boolean | null = null;
  healthInfo: HealthResponse | null = null;

  predictionResult: PredictionResponse | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.checkBackendHealth();
  }

  private initForm(): void {
    const groupConfig: Record<string, any> = {};

    for (const f of this.featureSchema) {
      const validators = [];
      if (f.required) {
        validators.push(Validators.required);
      }
      if (f.kind === 'number') {
        if (f.min !== undefined) validators.push(Validators.min(f.min));
        if (f.max !== undefined) validators.push(Validators.max(f.max));
      }
      groupConfig[f.name] = [f.defaultValue, validators];
    }

    this.form = this.fb.group(groupConfig);
  }

  getFeaturesByGroup(group: string): FeatureMetadata[] {
    return this.featureSchema.filter(f => f.group === group);
  }

  checkBackendHealth(): void {
    this.predictionService.getHealth().subscribe({
      next: (res) => {
        this.backendOnline = true;
        this.healthInfo = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.backendOnline = false;
        this.healthInfo = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadSamplePatient(): void {
    this.form.patchValue(SAMPLE_PATIENT_PAYLOAD);
    this.form.markAsDirty();
    this.errorMessage = null;
    this.cdr.detectChanges();
  }

  resetForm(): void {
    const defaults: Record<string, any> = {};
    for (const f of this.featureSchema) {
      defaults[f.name] = f.defaultValue;
    }
    this.form.reset(defaults);
    this.predictionResult = null;
    this.errorMessage = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please correct the invalid input fields before submitting.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const rawValues = this.form.getRawValue();
    // Ensure numerical fields are cast to appropriate numbers
    const payload: Record<string, string | number> = {};
    for (const f of this.featureSchema) {
      const val = rawValues[f.name];
      if (f.kind === 'number') {
        payload[f.name] = Number(val);
      } else {
        payload[f.name] = val;
      }
    }

    this.predictionService.predict(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.predictionResult = response;
        this.backendOnline = true;
        this.cdr.detectChanges();

        // Smooth scroll to prediction result card
        setTimeout(() => {
          const el = document.getElementById('results-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400 && err.error?.details) {
          this.errorMessage = `Validation error from API: ${JSON.stringify(err.error.details)}`;
        } else if (err.status === 0 || err.status === 504) {
          this.backendOnline = false;
          this.errorMessage =
            'Unable to communicate with the Flask API at http://127.0.0.1:5000. Please ensure the backend is running.';
        } else {
          this.errorMessage =
            err.error?.error || 'An unexpected error occurred while predicting risk. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  get completedCount(): number {
    if (!this.form) return 0;
    let count = 0;
    for (const f of this.featureSchema) {
      const val = this.form.get(f.name)?.value;
      if (val !== null && val !== undefined && val !== '' && this.form.get(f.name)?.valid) {
        count++;
      }
    }
    return count;
  }

  get riskPercentage(): number {
    if (!this.predictionResult || !this.predictionResult.probabilities) return 0;
    const p1 = this.predictionResult.probabilities[1];
    return Math.round(p1 * 1000) / 10;
  }

  get healthyPercentage(): number {
    if (!this.predictionResult || !this.predictionResult.probabilities) return 0;
    const p0 = this.predictionResult.probabilities[0];
    return Math.round(p0 * 1000) / 10;
  }

  get riskCategory(): 'Low' | 'Moderate' | 'High' {
    const risk = this.riskPercentage;
    if (risk < 30) return 'Low';
    if (risk < 60) return 'Moderate';
    return 'High';
  }
}
