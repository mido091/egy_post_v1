import { defineStore } from "pinia";
import api from "@/api";
import { useThemeStore } from "./theme";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    settings: {
      site_name: "اسم الموقع",
      site_name_en: "Site Name",
      logo: null,
      logo_dark: null,
      default_language: "ar",
      dark_mode: false,
      google_ads_header: "",
      google_ads_footer: "",
      google_analytics: "",
    },
    loading: false,
    error: null,
  }),

  getters: {
    locale: (state) => state.settings.default_language || "ar",
    siteName: (state) =>
      state.settings.default_language === "en"
        ? state.settings.site_name_en
        : state.settings.site_name,
    currentLogo: (state) => {
      const themeStore = useThemeStore();
      const baseUrl = "https://egy-post-server.vercel.app";

      const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
      };

      let logoPath = state.settings.logo;
      if (themeStore.isDark && state.settings.logo_dark) {
        logoPath = state.settings.logo_dark;
      }

      return getFullUrl(logoPath);
    },
  },

  actions: {
    async refreshSettings() {
      this.loading = true;
      try {
        const response = await api.get("/settings");
        const data = response.data.data || response.data;

        // Merge with defaults to ensure no nulls break the UI
        this.settings = {
          ...this.settings,
          ...data,
          // Ensure booleans
          dark_mode: !!data.dark_mode,
        };

        this.applySideEffects();
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        this.error = err;
      } finally {
        this.loading = false;
      }
    },

    applySideEffects() {
      const lang = this.settings.default_language || "ar";

      // 1. Update Document Attributes
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

      // 2. Update i18n (Dynamic Import to avoid circular dependency issues)
      import("@/main").then(({ i18n }) => {
        if (i18n && i18n.global) {
          i18n.global.locale.value = lang;
        }
      });

      // 3. Update Theme
      const themeStore = useThemeStore();
      const targetTheme = this.settings.dark_mode ? "dark" : "light";
      if (themeStore.theme !== targetTheme) {
        themeStore.setTheme(targetTheme);
      }

      // 4. Update Document Title
      document.title = this.siteName;
    },

    // Helper to manually set locale (e.g. from language toggle)
    // This should ideally also update the backend if the user is logged in,
    // but for now we just update local state and trigger side effects.
    setLocale(lang) {
      this.settings.default_language = lang;
      this.applySideEffects();
    },

    async init() {
      await this.refreshSettings();
    },
  },
});

export const getSiteName = (locale) => {
  const settingsStore = useSettingsStore();
  return locale === "en"
    ? settingsStore.settings.site_name_en || "Site Name"
    : settingsStore.settings.site_name || "اسم الموقع";
};
