
export interface Prompt {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  content: string;
  createdAt: number;
}

export interface Execution {
  id: string;
  promptVersionId: string;
  promptName: string;
  versionNumber: number;
  responseText: string;
  responseTime: number; // in ms
  createdAt: number;
  evaluation?: Evaluation;
}

export interface Evaluation {
  id: string;
  executionId: string;
  accuracy: number;
  clarity: number;
  hallucinationRisk: number;
  overallScore: number;
  createdAt: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PROMPTS = 'PROMPTS',
  EXECUTIONS = 'EXECUTIONS',
  METRICS = 'METRICS'
}
