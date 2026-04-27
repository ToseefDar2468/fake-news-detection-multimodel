export type AnalysisLabel = 'fake' | 'real';
export type RedFlagSeverity = 'low' | 'medium' | 'high';

export interface AnalysisRequest {
  readonly text: string;
  readonly image: File;
}

export interface RedFlag {
  readonly category: string;
  readonly description: string;
  readonly severity: RedFlagSeverity;
}

export interface AnalysisResponse {
  readonly prediction: AnalysisLabel | null;
  readonly confidence: number | null;
  readonly explanation: string | null;
  readonly redFlags: readonly RedFlag[];
  readonly message: string;
}

export interface AnalysisHistoryItem {
  readonly id: string;
  readonly analyzedAt: string;
  readonly textExcerpt: string;
  readonly imageName: string;
  readonly prediction: AnalysisLabel;
  readonly confidence: number;
}
