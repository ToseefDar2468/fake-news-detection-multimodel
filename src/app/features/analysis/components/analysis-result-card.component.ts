import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AnalysisResponse } from '../../../core/models/analysis.models';

@Component({
  selector: 'app-analysis-result-card',
  imports: [DecimalPipe, TitleCasePipe],
  template: `
    <section class="app-card h-full p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.32em] text-sky-600">Result section</p>
          <h2 class="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Analysis output
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            The response from the FastAPI endpoint appears here after the multipart request is
            submitted.
          </p>
        </div>

        @if (response()) {
          <span class="status-chip border-emerald-200 bg-emerald-50 text-emerald-700">
            Response received
          </span>
        }
      </div>

      @if (isSubmitting()) {
        <div class="mt-8 rounded-3xl border border-sky-100 bg-sky-50/80 p-5 text-sm text-sky-800">
          <div class="flex items-center gap-3">
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent"></span>
            <p class="font-medium">Sending text and image to the analysis API...</p>
          </div>
          <p class="mt-3 leading-6">
            The FastAPI backend is processing the request. This step will return placeholder data
            until the AI pipeline is integrated.
          </p>
        </div>
      } @else if (errorMessage()) {
        <div class="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          <p class="font-medium">Unable to complete analysis.</p>
          <p class="mt-2 leading-6">{{ errorMessage() }}</p>
        </div>
      } @else if (response(); as result) {
        <article class="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
          <p class="text-xs font-medium uppercase tracking-[0.28em] text-emerald-700">
            Backend message
          </p>
          <p class="mt-3 text-sm leading-6 text-emerald-900">
            {{ result.message }}
          </p>
        </article>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">Prediction</p>
            <div class="mt-3 flex items-center gap-3">
              @if (result.prediction) {
                <span
                  class="rounded-full px-3 py-1 text-sm font-semibold"
                  [class.bg-rose-100]="result.prediction === 'fake'"
                  [class.text-rose-700]="result.prediction === 'fake'"
                  [class.bg-emerald-100]="result.prediction === 'real'"
                  [class.text-emerald-700]="result.prediction === 'real'"
                >
                  {{ result.prediction | titlecase }}
                </span>
              } @else {
                <span class="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
                  Pending AI integration
                </span>
              }
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">Confidence</p>
            @if (result.confidence !== null) {
              <p class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {{ result.confidence * 100 | number: '1.0-1' }}%
              </p>
            } @else {
              <p class="mt-3 text-lg font-semibold tracking-tight text-slate-700">
                Not available yet
              </p>
            }
          </article>
        </div>

        <article class="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">Explanation</p>
          <p class="mt-3 text-sm leading-7 text-slate-700">
            {{ result.explanation ?? result.message }}
          </p>
        </article>

        <article class="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">Red flags</p>
            <span class="status-chip">{{ result.redFlags.length }} items</span>
          </div>

          @if (result.redFlags.length > 0) {
            <div class="mt-4 space-y-3">
              @for (flag of result.redFlags; track flag.category + flag.description) {
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <p class="font-medium text-slate-900">{{ flag.category }}</p>
                    <span
                      class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                      [class.bg-rose-100]="flag.severity === 'high'"
                      [class.text-rose-700]="flag.severity === 'high'"
                      [class.bg-amber-100]="flag.severity === 'medium'"
                      [class.text-amber-700]="flag.severity === 'medium'"
                      [class.bg-slate-200]="flag.severity === 'low'"
                      [class.text-slate-700]="flag.severity === 'low'"
                    >
                      {{ flag.severity }}
                    </span>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-slate-600">{{ flag.description }}</p>
                </div>
              }
            </div>
          } @else {
            <div class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
              <p class="text-sm leading-6 text-slate-600">
                No red flags were returned by the backend yet.
              </p>
            </div>
          }
        </article>
      } @else {
        <div class="mt-8 space-y-4">
          @for (item of placeholderSections; track item.title) {
            <article class="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-5">
              <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                {{ item.title }}
              </p>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                {{ item.description }}
              </p>
            </article>
          }
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisResultCardComponent {
  readonly response = input<AnalysisResponse | null>(null);
  readonly errorMessage = input<string | null>(null);
  readonly isSubmitting = input(false);

  protected readonly placeholderSections = [
    {
      title: 'Prediction',
      description: 'The backend will later return a multimodal Fake or Real classification.',
    },
    {
      title: 'Confidence',
      description: 'Confidence will be shown once the AI classifier is integrated into the API.',
    },
    {
      title: 'Explanation',
      description: 'Natural-language reasoning from the explainability layer will appear here.',
    },
    {
      title: 'Red flags',
      description: 'Potential credibility issues will be listed here when the model starts emitting them.',
    },
  ] as const;
}
