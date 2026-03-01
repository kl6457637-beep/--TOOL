import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, ListingContext, SearchTermRow, WhiteListItem, Settings, WorkflowStep } from '@/types';
import { generateUUID } from '@/lib/utils';
import { DEFAULT_SETTINGS } from '@/lib/rules-engine';

const initialSettings: Settings = DEFAULT_SETTINGS;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentStep: 'input' as WorkflowStep,
      isProcessing: false,
      listingContext: null as ListingContext | null,
      searchTerms: [] as SearchTermRow[],
      whiteList: [] as WhiteListItem[],
      settings: initialSettings,

      setListingContext: (context: ListingContext) => {
        console.log("setListingContext:", context);
        set({ listingContext: context, currentStep: 'upload' });
      },

      setSearchTerms: (terms: SearchTermRow[]) => {
        console.log("setSearchTerms:", terms.length);
        set({ searchTerms: terms, currentStep: 'analyzing' });
      },

      updateSearchTermStatus: (id: string, status: SearchTermRow['status'], reason?: string) => {
        set((state) => ({
          searchTerms: state.searchTerms.map((term) =>
            term.id === id ? { ...term, status, rejectReason: reason || term.rejectReason } : term
          ),
        }));
      },

      // Batch update all search terms
      updateAllSearchTerms: (terms: SearchTermRow[]) => {
        set({ searchTerms: terms });
      },

      toggleSearchTermCheck: (id: string) => {
        set((state) => ({
          searchTerms: state.searchTerms.map((term) =>
            term.id === id ? { ...term, isChecked: !term.isChecked } : term
          ),
        }));
      },

      addToWhiteList: (campaignName: string, keywordText: string) => {
        const newItem: WhiteListItem = {
          id: generateUUID(),
          campaignName,
          keywordText,
          timestamp: Date.now(),
        };
        set((state) => ({
          whiteList: [...state.whiteList, newItem],
        }));
      },

      removeFromWhiteList: (id: string) => {
        set((state) => ({
          whiteList: state.whiteList.filter((item) => item.id !== id),
        }));
      },

      updateSettings: (newSettings: Partial<Settings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      setStep: (step: WorkflowStep) => {
        set({ currentStep: step });
      },

      setProcessing: (processing: boolean) => {
        set({ isProcessing: processing });
      },

      reset: () => {
        set({
          currentStep: 'input',
          isProcessing: false,
          listingContext: null,
          searchTerms: [],
        });
      },
    }),
    {
      name: 'amazon-ad-flow-storage',
      partialize: (state) => ({
        whiteList: state.whiteList,
        settings: state.settings,
      }),
    }
  )
);
