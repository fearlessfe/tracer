
export enum ProjectType {
  KnowledgeBase = '知识库',
  Project = '项目'
}

export interface Member {
  id: string;
  name: string;
  role?: string;
}

export type DataSourceType = 'file' | 'git' | 'jira';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  config: string; // Summary for display (e.g., URL or File count)
  details?: any; // Store specific config like tokens, file lists, selected projects
  status: 'synced' | 'syncing' | 'error';
  lastSync: number;
}

export type NormalizationStatus = 'unprocessed' | 'processing' | 'completed';
export type ParsingStatus = 'unprocessed' | 'processing' | 'completed';

export type ParsedItemType = 'text' | 'table' | 'image';

export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

export interface ParsedImage {
  url: string;
  caption: string;
}

export interface ParsedContentItem {
  type: ParsedItemType;
  content: string | ParsedTable | ParsedImage;
}

export interface NormalizedItem {
  id: string;
  content: string; // The extracted rule/requirement/summary
  originalText: string; // The exact text in the source doc to highlight
  category?: string;
}

export interface Document {
  id: string;
  title: string;
  sourceId: string;
  fileType: string; // 'pdf', 'md', 'issue', 'tsx', etc.
  updatedAt: number;
  path?: string; // File path for git repos e.g., "src/components/Button.tsx"
  content?: string; // Mock content for display
  enabled?: boolean; // Whether the document is active and visible in the list
  
  // Parsing Stage
  parsingStatus?: ParsingStatus;
  parsedContent?: ParsedContentItem[];
  semanticType?: string; // The inferred V-Model type (e.g. 'Requirements', 'System Design')

  // Normalization Stage
  normalizationStatus?: NormalizationStatus;
  normalizedItems?: NormalizedItem[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  members: Member[];
  createdAt: number;
  updatedAt: number;
  dataSources?: DataSource[];
  documents?: Document[];
}

export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'dataSources' | 'documents'>;