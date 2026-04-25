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
  readonly id: string;
  readonly prediction: AnalysisLabel;
  readonly confidence: number;
  readonly explanation: string;
  readonly redFlags: readonly RedFlag[];
  readonly analyzedAt: string;
}

export interface AnalysisHistoryItem {
  readonly id: string;
  readonly analyzedAt: string;
  readonly textExcerpt: string;
  readonly imageName: string;
  readonly prediction: AnalysisLabel;
  readonly confidence: number;
}
