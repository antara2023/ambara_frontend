export type UIBlockType = 'markdown' | 'list' | 'key-value' | 'alert' | 'score' | 'timeline';

export interface BaseBlock {
  type: UIBlockType;
  title?: string;
  icon?: string;
}

export interface MarkdownBlock extends BaseBlock {
  type: 'markdown';
  content: string;
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  items: string[];
}

export interface KeyValueBlock extends BaseBlock {
  type: 'key-value';
  data: Record<string, string | number | boolean | null | undefined>;
}

export interface AlertBlock extends BaseBlock {
  type: 'alert';
  severity: 'info' | 'warning' | 'error' | 'success';
  content: string;
}

export interface ScoreBlock extends BaseBlock {
  type: 'score';
  score: number | string;
  maxScore?: number;
  subtitle?: string;
  favorableMonths?: string;
  favorableScore?: string;
  favorableTitle?: string;
  favorableDescription?: string;
}

export interface TimelineEvent {
  title: string;
  date?: string;
  description?: string;
}

export interface TimelineBlock extends BaseBlock {
  type: 'timeline';
  events: TimelineEvent[];
}

export type UIBlock = 
  | MarkdownBlock 
  | ListBlock 
  | KeyValueBlock 
  | AlertBlock 
  | ScoreBlock 
  | TimelineBlock;
