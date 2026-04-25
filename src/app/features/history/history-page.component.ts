import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { AnalysisHistoryItem } from '../../core/models/analysis.models';
import { AnalysisService } from '../../core/services/analysis.service';

@Component({
  selector: 'app-history-page',
  imports: [DatePipe, DecimalPipe, TitleCasePipe],
  template: `
    <section class="space-y-6">
      <article class="app-card p-6">
        <p class="font-mono text-xs uppercase tracking-[0.32em] text-sky-600">History</p>
        <h2 class="mt-2 app-section-title">Recent analysis sessions</h2>
        <p class="mt-3 max-w-3xl app-section-copy">
          This page is ready for persisted results from the backend. It can later display previous
          predictions, confidence scores, timestamps, and searchable audit trails.
        </p>
      </article>

      <article class="app-card p-6">
        @if (isLoading()) {
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Loading analysis history...
          </div>
        } @else if (historyItems().length > 0) {
          <div class="space-y-4">
            @for (item of historyItems(); track item.id) {
              <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="space-y-2">
                    <p class="text-sm font-medium text-slate-900">{{ item.textExcerpt }}</p>
                    <p class="text-xs text-slate-500">{{ item.imageName }}</p>
                  </div>

                  <div class="text-right">
                    <p class="text-sm font-semibold text-slate-900">
                      {{ item.prediction | titlecase }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ item.confidence * 100 | number: '1.0-1' }}%
                    </p>
                  </div>
                </div>

                <p class="mt-3 text-xs text-slate-500">{{ item.analyzedAt | date: 'medium' }}</p>
              </article>
            }
          </div>
        } @else {
          <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
            <p class="text-lg font-semibold tracking-tight text-slate-900">
              No analysis history yet
            </p>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              Once the backend stores completed analyses, they will appear here for review.
            </p>
          </div>
        }
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPageComponent {
  private readonly analysisService = inject(AnalysisService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly historyItems = signal<AnalysisHistoryItem[]>([]);
  protected readonly isLoading = signal(true);

  constructor() {
    this.analysisService
      .getHistory()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => this.historyItems.set(items));
  }
}
