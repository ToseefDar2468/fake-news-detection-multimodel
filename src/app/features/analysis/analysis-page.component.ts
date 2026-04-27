import { HttpErrorResponse } from '@angular/common/http';
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
                The analysis form now sends a real multipart request to the FastAPI backend. Text
                and image are submitted together so the backend foundation can evolve into the full
                multimodal detection pipeline.
              </p>
            </div>

            <span class="status-chip border-emerald-200 bg-emerald-50 text-emerald-700">
              API endpoint configured
            </span>
          </div>

          <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            FastAPI base URL: <span class="font-mono">{{ apiBaseUrl }}</span>
          </div>
        </article>

        <article class="app-card p-6">
          @if (errorMessage()) {
            <div class="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {{ errorMessage() }}
            </div>
          }

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

                @if (imageSelectionError()) {
                  <p class="mt-2 text-sm text-rose-600">{{ imageSelectionError() }}</p>
                }

                <p class="mt-3 text-sm leading-6 text-slate-500">
                  The file is sent as multipart form data under the <span class="font-mono">image</span>
                  field expected by FastAPI.
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
                        <p class="text-xs text-slate-500">Ready for submission</p>
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
                    Upload an image to include visual context in the request.
                  </div>
                }
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p class="text-sm leading-6 text-slate-600">
                The current backend returns placeholder AI fields while the model layer is under
                development.
              </p>

              <button
                type="submit"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                [disabled]="analysisForm.invalid || isSubmitting()"
              >
                @if (isSubmitting()) {
                  <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"></span>
                }
                <span>{{ isSubmitting() ? 'Analyzing...' : 'Analyze News' }}</span>
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
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly imageSelectionError = signal<string | null>(null);
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

    this.clearFormFeedback();
    this.revokePreviewUrl();

    if (!file) {
      this.analysisForm.controls.image.setValue(null);
      this.analysisForm.controls.image.markAsTouched();
      this.imagePreviewUrl.set(null);
      this.imageName.set('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.analysisForm.controls.image.setValue(null);
      this.analysisForm.controls.image.markAsTouched();
      this.imageSelectionError.set('Unsupported image type. Please upload a valid image file.');
      this.imagePreviewUrl.set(null);
      this.imageName.set('');
      inputElement.value = '';
      return;
    }

    this.previewUrl = URL.createObjectURL(file);
    this.analysisForm.controls.image.setValue(file);
    this.analysisForm.controls.image.markAsTouched();
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
    this.imageSelectionError.set(null);
    this.revokePreviewUrl();
  }

  protected submit(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.submitAttempted.set(true);
    this.clearFormFeedback();

    if (this.analysisForm.invalid) {
      this.analysisForm.markAllAsTouched();
      return;
    }

    const requestValue = this.analysisForm.getRawValue();

    if (!requestValue.image) {
      return;
    }

    this.isSubmitting.set(true);

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
        error: (error: unknown) => this.errorMessage.set(this.toUserFacingErrorMessage(error)),
      });
  }

  private clearFormFeedback(): void {
    this.errorMessage.set(null);
    this.analysisResult.set(null);
    this.imageSelectionError.set(null);
  }

  private revokePreviewUrl(): void {
    if (!this.previewUrl) {
      return;
    }

    URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
  }

  private toUserFacingErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'The request could not be completed. Please try again.';
    }

    if (error.status === 0) {
      return 'The backend could not be reached. Make sure FastAPI is running on http://localhost:8000.';
    }

    if (error.status === 415) {
      return 'The selected file type is not supported by the backend. Please upload a valid image file.';
    }

    if (error.status === 422) {
      return 'The backend rejected the request. Please provide news text and a valid image, then try again.';
    }

    if (error.status >= 500) {
      return 'The server encountered an error while processing the analysis request. Please try again.';
    }

    return 'The analysis request could not be completed. Please verify the input and try again.';
  }
}
