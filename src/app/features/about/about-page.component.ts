import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  template: `
    <section class="space-y-6">
      <article class="app-card p-6">
        <p class="font-mono text-xs uppercase tracking-[0.32em] text-sky-600">About the project</p>
        <h2 class="mt-2 app-section-title">
          Explainable multimodal fake news detection for real-time decision support
        </h2>
        <p class="mt-3 max-w-3xl app-section-copy">
          The project combines text understanding, image understanding, cross-modal reasoning, and
          generative AI explanations to assess whether a news item is likely fake or real.
        </p>
      </article>

      <div class="grid gap-6 lg:grid-cols-2">
        @for (section of sections; track section.title) {
          <article class="app-card p-6">
            <h3 class="text-lg font-semibold tracking-tight text-slate-950">{{ section.title }}</h3>
            <p class="mt-3 text-sm leading-7 text-slate-600">{{ section.description }}</p>
          </article>
        }
      </div>

      <article class="app-card p-6">
        <p class="font-mono text-xs uppercase tracking-[0.32em] text-sky-600">Pipeline concept</p>
        <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          @for (step of pipelineSteps; track step.title) {
            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p class="text-sm font-semibold text-slate-900">{{ step.title }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ step.description }}</p>
            </div>
          }
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent {
  protected readonly sections = [
    {
      title: 'Multimodal detection',
      description:
        'The system evaluates news text together with a related image so it can detect inconsistencies between written claims and visual evidence.',
    },
    {
      title: 'Explainable AI',
      description:
        'Instead of only showing a label, the platform is designed to surface confidence, suspicious cues, and natural-language reasoning that users can understand.',
    },
    {
      title: 'Generative AI layer',
      description:
        'A large language model will translate model evidence into human-readable explanations, red flags, and analyst-friendly summaries.',
    },
    {
      title: 'Real-time detection',
      description:
        'The target workflow is near-real-time analysis so end users can submit a claim and quickly receive a credibility assessment with supporting rationale.',
    },
  ] as const;

  protected readonly pipelineSteps = [
    {
      title: '1. Text encoder',
      description:
        'BERT or RoBERTa will convert the submitted claim into contextual text embeddings.',
    },
    {
      title: '2. Image encoder',
      description:
        'ResNet or Vision Transformer will extract visual features from the uploaded image.',
    },
    {
      title: '3. Cross-modal fusion',
      description:
        'A fusion or attention layer will combine text and image signals before classification.',
    },
    {
      title: '4. Explainable output',
      description:
        'The classifier and LLM layer will return Fake or Real prediction, confidence, explanation, and red flags.',
    },
  ] as const;
}
