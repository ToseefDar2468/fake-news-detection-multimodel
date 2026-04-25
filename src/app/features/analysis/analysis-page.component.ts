import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AnalysisResponse } from '../../core/models/analysis.models';
import { AnalysisService } from '../../core/services/analysis.service';
import { AnalysisResultCardComponent } from './components/analysis-result-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-analysis-page',
  imports: [ReactiveFormsModule, AnalysisResultCardComponent],
  template: `
    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.95fr)]">
      <div class="space-y-6">
        <article class="app-card p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="font-mono text-xs uppercase tracking-[0.32em] text-sky-600">
                Multimodal analysis workspace
              </p>
              <h2 class="mt-2 app-section-title">Analyze a news claim with text and image context</h2>
              <p class="mt-3 app-section-copy max-w-3xl">
                This frontend is prepared for a multimodal pipeline where BERT or RoBERTa handles
                text features, ResNet or ViT handles image features, and a fused model produces the
                credibility prediction before an LLM explains the reasoning.
              </p>
            </div>

            <span
              class="status-chip"
              [class.border-emerald-200]="backendConfigured"
              [class.bg-emerald-50]="backendConfigured"
              [class.text-emerald-700]="backendConfigured"
            >
              {{ backendConfigured ? 'Backend connected' : 'Frontend foundation mode' }}
            </span>
          </div>

          @if (!backendConfigured) {
            <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              FastAPI placeholder: <span class="font-mono">{{ apiBaseUrl }}</span>
            </div>
          }
        </article>

        <article class="app-card p-6">
          <form class="space-y-6" [formGroup]="analysisForm" (ngSubmit)="submit()">
            <div>
              <label class="app-label" for="news-text">News text</label>
              <textarea
                id="news-text"
                class="app-textarea"
                formControlName="text"
                placeholder="Paste the headline, claim, caption, or article excerpt to inspect."
              ></textarea>

              @if (showControlError('text')) {
                <p class="mt-2 text-sm text-rose-600">News text is required.</p>
              }
            </div>

            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.9fr)]">
              <div>
                <label class="app-label" for="news-image">Supporting image</label>
                <input
                  id="news-image"
                  #fileInput
                  type="file"
                  accept="image/*"
                  class="app-input file:mr-4 file:rounded-full file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-700"
                  (change)="onImageSelected($event)"
                >

                @if (showControlError('image')) {
                  <p class="mt-2 text-sm text-rose-600">An image is required.</p>
                }

                <p class="mt-3 text-sm leading-6 text-slate-500">
                  Use an image that appears alongside the claim so the cross-modal detector can
                  compare textual and visual evidence later.
                </p>
              </div>

              <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
                <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                  Image preview
                </p>

                @if (imagePreviewUrl(); as previewUrl) {
                  <div class="mt-4 space-y-4">
                    <img
                      [src]="previewUrl"
                      [alt]="imageName() || 'Selected news image'"
                      class="h-52 w-full rounded-2xl object-cover"
                    >

                    <div class="flex items-center justify-between gap-3">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-slate-900">{{ imageName() }}</p>
                        <p class="text-xs text-slate-500">Ready for analysis request payload</p>
                      </div>

                      <button
                        type="button"
                        class="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:text-rose-700"
                        (click)="removeImage(fileInput)"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="mt-4 flex h-52 items-center justify-center rounded-2xl bg-white text-center text-sm leading-6 text-slate-500">
                    Upload an image to inspect visual context beside the news text.
                  </div>
                }
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p class="text-sm leading-6 text-slate-600">
                Both text and image are required so the future model can perform multimodal fusion.
              </p>

              <button
                type="submit"
                class="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                [disabled]="analysisForm.invalid || isSubmitting()"
              >
                {{ isSubmitting() ? 'Analyzing...' : 'Analyze News' }}
              </button>
            </div>
          </form>
        </article>
      </div>

      <app-analysis-result-card
        [response]="analysisResult()"
        [errorMessage]="errorMessage()"
        [isSubmitting]="isSubmitting()"
      />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly analysisService = inject(AnalysisService);
  private readonly destroyRef = inject(DestroyRef);

  private previewUrl: string | null = null;

  protected readonly apiBaseUrl = environment.apiBaseUrl;
  protected readonly backendConfigured = environment.enableBackendIntegration;
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly analysisResult = signal<AnalysisResponse | null>(null);
  protected readonly imagePreviewUrl = signal<string | null>(null);
  protected readonly imageName = signal('');
  protected readonly submitAttempted = signal(false);

  protected readonly analysisForm = this.formBuilder.group({
    text: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required],
    }),
    image: this.formBuilder.control<File | null>(null, {
      validators: [Validators.required],
    }),
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.revokePreviewUrl());
  }

  protected showControlError(controlName: 'text' | 'image'): boolean {
    const control = this.analysisForm.controls[controlName];
    return control.invalid && (control.touched || this.submitAttempted());
  }

  protected onImageSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0] ?? null;

    this.revokePreviewUrl();

    if (!file) {
      this.analysisForm.controls.image.setValue(null);
      this.analysisForm.controls.image.markAsTouched();
      this.imagePreviewUrl.set(null);
      this.imageName.set('');
      return;
    }

    this.previewUrl = URL.createObjectURL(file);
    this.analysisForm.controls.image.setValue(file);
    this.analysisForm.controls.image.updateValueAndValidity();
    this.imagePreviewUrl.set(this.previewUrl);
    this.imageName.set(file.name);
  }

  protected removeImage(fileInput: HTMLInputElement): void {
    fileInput.value = '';
    this.analysisForm.controls.image.setValue(null);
    this.analysisForm.controls.image.markAsTouched();
    this.analysisForm.controls.image.updateValueAndValidity();
    this.imageName.set('');
    this.imagePreviewUrl.set(null);
    this.revokePreviewUrl();
  }

  protected submit(): void {
    this.submitAttempted.set(true);

    if (this.analysisForm.invalid) {
      this.analysisForm.markAllAsTouched();
      return;
    }

    const requestValue = this.analysisForm.getRawValue();

    if (!requestValue.image) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.analysisResult.set(null);

    this.analysisService
      .analyzeNews({
        text: requestValue.text.trim(),
        image: requestValue.image,
      })
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.analysisResult.set(response),
        error: (error: unknown) => this.errorMessage.set(this.toErrorMessage(error)),
      });
  }

  private revokePreviewUrl(): void {
    if (!this.previewUrl) {
      return;
    }

    URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Analysis request failed before a response was returned.';
  }
}
