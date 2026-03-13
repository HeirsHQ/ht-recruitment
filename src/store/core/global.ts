import { createPersistMiddleware } from "../middleware/persist";

type Theme = "light" | "dark";

interface GlobalStore {
  _hasHydrated: boolean;
  isCollapsed: boolean;
  query: string;
  setIsCollapsed: (isCollapsed: boolean) => void;
  setQuery: (query: string) => void;
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

function applyTheme(theme: Theme) {
  if (typeof document !== "undefined") {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }
}

export const useGlobalStore = createPersistMiddleware<GlobalStore>(
  "GLOBAL_SETTINGS",
  (set) => ({
    _hasHydrated: false,
    isCollapsed: false,
    query: "",
    setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
    setQuery: (query) => set({ query }),
    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
    theme: "light",
  }),
  {
    onRehydrateStorage: () => (state) => {
      if (state) {
        applyTheme(state.theme);
      }
      useGlobalStore.setState({ _hasHydrated: true });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    partialize: ({ _hasHydrated, ...rest }) => rest as GlobalStore,
  },
);
