import { create } from 'zustand';
import type { Template, Prompt, BatchProgress } from '@/types';
import type { ParsedRow } from '@/lib/excel/parser';

type GenerateStep = 1 | 2 | 3 | 4 | 5;

interface GenerateState {
  // Step management
  currentStep: GenerateStep;

  // Step 1: Template
  selectedTemplate: Template | null;

  // Step 2: Prompt
  selectedPrompt: Prompt | null;
  customPrompt: string;
  selectedAiModel: 'claude' | 'gemini';

  // Step 3: Keywords
  keywords: ParsedRow[];
  fileName: string | null;

  // Step 4: WordPress settings
  wpCategory: number | null;
  wpTags: number[];
  publishToWp: boolean;

  // Step 5: Progress
  isGenerating: boolean;
  progress: BatchProgress | null;
  error: string | null;

  // Actions
  setStep: (step: GenerateStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setTemplate: (template: Template | null) => void;
  setPrompt: (prompt: Prompt | null) => void;
  setCustomPrompt: (prompt: string) => void;
  setAiModel: (model: 'claude' | 'gemini') => void;
  setKeywords: (keywords: ParsedRow[], fileName: string) => void;
  clearKeywords: () => void;
  setWpCategory: (category: number | null) => void;
  setWpTags: (tags: number[]) => void;
  setPublishToWp: (publish: boolean) => void;
  setProgress: (progress: BatchProgress | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1 as GenerateStep,
  selectedTemplate: null,
  selectedPrompt: null,
  customPrompt: '',
  selectedAiModel: 'claude' as const,
  keywords: [],
  fileName: null,
  wpCategory: null,
  wpTags: [],
  publishToWp: true,
  isGenerating: false,
  progress: null,
  error: null,
};

export const useGenerateStore = create<GenerateState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(5, state.currentStep + 1) as GenerateStep,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1) as GenerateStep,
    })),

  setTemplate: (template) => set({ selectedTemplate: template }),

  setPrompt: (prompt) => set({ selectedPrompt: prompt }),

  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

  setAiModel: (model) => set({ selectedAiModel: model }),

  setKeywords: (keywords, fileName) => set({ keywords, fileName }),

  clearKeywords: () => set({ keywords: [], fileName: null }),

  setWpCategory: (category) => set({ wpCategory: category }),

  setWpTags: (tags) => set({ wpTags: tags }),

  setPublishToWp: (publish) => set({ publishToWp: publish }),

  setProgress: (progress) => set({ progress }),

  setIsGenerating: (generating) => set({ isGenerating: generating }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
