export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastSaved: number;
  attachmentUrl?: string;
}

export type View = 'list' | 'edit';
