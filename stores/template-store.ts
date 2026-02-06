import { create } from 'zustand';
import type { Template, CreateTemplateInput } from '@/types';

interface TemplateState {
  templates: Template[];
  selectedTemplate: Template | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTemplates: () => Promise<void>;
  selectTemplate: (template: Template | null) => void;
  createTemplate: (input: CreateTemplateInput) => Promise<Template>;
  updateTemplate: (id: string, input: Partial<CreateTemplateInput>) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  selectedTemplate: null,
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const templates = await response.json();
      set({ templates, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  selectTemplate: (template) => {
    set({ selectedTemplate: template });
  },

  createTemplate: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to create template');
      const template = await response.json();
      set((state) => ({
        templates: [template, ...state.templates],
        isLoading: false,
      }));
      return template;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTemplate: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to update template');
      const template = await response.json();
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? template : t)),
        selectedTemplate: state.selectedTemplate?.id === id ? template : state.selectedTemplate,
        isLoading: false,
      }));
      return template;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
