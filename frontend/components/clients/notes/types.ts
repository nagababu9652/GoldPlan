export interface ClientNote {
  id: string;

  title: string;

  content: string;

  author: string;

  createdAt: string;

  updatedAt?: string;

  pinned: boolean;

  tags: string[];
}