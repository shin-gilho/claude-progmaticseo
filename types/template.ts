export interface Template {
  id: string;
  name: string;
  htmlContent: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateInput {
  name: string;
  htmlContent: string;
  description?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  htmlContent?: string;
  description?: string;
}
