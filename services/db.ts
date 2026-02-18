
import { Prompt, PromptVersion, Execution, Evaluation } from '../types';

/**
 * In a real production environment, these methods would call a FastAPI backend
 * connected to a PostgreSQL database. Here we use localStorage to persist state.
 */
class DatabaseService {
  private STORAGE_KEY = 'llmops_pipeline_data';

  private getData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : { 
      prompts: [], 
      versions: [], 
      executions: [], 
      evaluations: [] 
    };
  }

  private saveData(data: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  async getPrompts(): Promise<Prompt[]> {
    return this.getData().prompts;
  }

  async savePrompt(prompt: Prompt): Promise<void> {
    const data = this.getData();
    data.prompts.push(prompt);
    this.saveData(data);
  }

  async getVersions(promptId: string): Promise<PromptVersion[]> {
    return this.getData().versions.filter((v: PromptVersion) => v.promptId === promptId);
  }

  async saveVersion(version: PromptVersion): Promise<void> {
    const data = this.getData();
    data.versions.push(version);
    this.saveData(data);
  }

  async getExecutions(): Promise<Execution[]> {
    const data = this.getData();
    return data.executions.map((ex: Execution) => ({
      ...ex,
      evaluation: data.evaluations.find((ev: Evaluation) => ev.executionId === ex.id)
    }));
  }

  async saveExecution(execution: Execution, evaluation?: Evaluation): Promise<void> {
    const data = this.getData();
    data.executions.push(execution);
    if (evaluation) {
      data.evaluations.push(evaluation);
    }
    this.saveData(data);
  }

  async getMetrics() {
    const data = this.getData();
    const evals = data.evaluations;
    if (evals.length === 0) return null;

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    return {
      avgAccuracy: avg(evals.map((e: Evaluation) => e.accuracy)),
      avgClarity: avg(evals.map((e: Evaluation) => e.clarity)),
      avgHallucination: avg(evals.map((e: Evaluation) => e.hallucinationRisk)),
      avgOverall: avg(evals.map((e: Evaluation) => e.overallScore)),
      totalExecutions: data.executions.length
    };
  }
}

export const db = new DatabaseService();
