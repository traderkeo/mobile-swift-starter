/**
 * Internationalization (i18n) support
 *
 * Provides localization utilities for multi-language support.
 * Uses the device locale by default with fallback to English.
 *
 * @example
 * ```typescript
 * import { t, useTranslation, setLocale } from '@/lib/i18n';
 *
 * // Simple translation
 * const greeting = t('common.hello');
 *
 * // With interpolation
 * const welcome = t('common.welcome', { name: 'John' });
 *
 * // In components
 * function MyComponent() {
 *   const { t, locale, setLocale } = useTranslation();
 *   return <Text>{t('common.hello')}</Text>;
 * }
 * ```
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for user's preferred locale
const LOCALE_KEY = '@app:locale';

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'pt'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// Translation dictionaries
const translations: Record<SupportedLocale, Record<string, unknown>> = {
  en: {
    common: {
      hello: 'Hello',
      welcome: 'Welcome, {{name}}!',
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      done: 'Done',
      next: 'Next',
      back: 'Back',
      skip: 'Skip',
      search: 'Search',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Log Out',
      login: 'Log In',
      signup: 'Sign Up',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signInWith: 'Sign in with {{provider}}',
      continueWith: 'Continue with {{provider}}',
    },
    errors: {
      network: 'Network error. Please check your connection.',
      unknown: 'Something went wrong. Please try again.',
      invalidEmail: 'Please enter a valid email address',
      invalidPassword: 'Password must be at least 8 characters',
      loginFailed: 'Login failed. Please check your credentials.',
    },
    onboarding: {
      getStarted: 'Get Started',
      slide1Title: 'Welcome',
      slide1Description: 'Thanks for downloading our app!',
      slide2Title: 'Features',
      slide2Description: 'Discover amazing features',
      slide3Title: 'Ready',
      slide3Description: "Let's get started!",
    },
    subscription: {
      premium: 'Premium',
      subscribe: 'Subscribe',
      restore: 'Restore Purchases',
      monthly: 'Monthly',
      annual: 'Annual',
      lifetime: 'Lifetime',
      freeTrial: '{{days}}-day free trial',
      pricePerMonth: '{{price}}/month',
      pricePerYear: '{{price}}/year',
      bestValue: 'Best Value',
      mostPopular: 'Most Popular',
    },
    settings: {
      language: 'Language',
      notifications: 'Notifications',
      darkMode: 'Dark Mode',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      about: 'About',
      version: 'Version {{version}}',
      rateApp: 'Rate This App',
      shareApp: 'Share App',
      deleteAccount: 'Delete Account',
    },
    permissions: {
      trackingTitle: 'Allow Tracking?',
      trackingMessage: 'This allows us to improve your experience with personalized content.',
      notificationsTitle: 'Enable Notifications',
      notificationsMessage: "We'll send you important updates and reminders.",
    },
  },
  es: {
    common: {
      hello: 'Hola',
      welcome: '¡Bienvenido, {{name}}!',
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      retry: 'Reintentar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      done: 'Hecho',
      next: 'Siguiente',
      back: 'Atrás',
      skip: 'Omitir',
      search: 'Buscar',
      settings: 'Configuración',
      profile: 'Perfil',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
    },
    auth: {
      email: 'Correo electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes una cuenta?',
      hasAccount: '¿Ya tienes una cuenta?',
      signInWith: 'Iniciar sesión con {{provider}}',
      continueWith: 'Continuar con {{provider}}',
    },
    errors: {
      network: 'Error de red. Por favor, verifica tu conexión.',
      unknown: 'Algo salió mal. Por favor, intenta de nuevo.',
      invalidEmail: 'Por favor, ingresa un correo válido',
      invalidPassword: 'La contraseña debe tener al menos 8 caracteres',
      loginFailed: 'Error de inicio de sesión. Verifica tus credenciales.',
    },
    settings: {
      language: 'Idioma',
      notifications: 'Notificaciones',
      darkMode: 'Modo oscuro',
      privacy: 'Política de privacidad',
      terms: 'Términos de servicio',
      about: 'Acerca de',
      version: 'Versión {{version}}',
      rateApp: 'Califica esta app',
      shareApp: 'Compartir app',
      deleteAccount: 'Eliminar cuenta',
    },
  },
  fr: {
    common: {
      hello: 'Bonjour',
      welcome: 'Bienvenue, {{name}} !',
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      retry: 'Réessayer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      done: 'Terminé',
      next: 'Suivant',
      back: 'Retour',
      skip: 'Passer',
      search: 'Rechercher',
      settings: 'Paramètres',
      profile: 'Profil',
      logout: 'Déconnexion',
      login: 'Connexion',
      signup: "S'inscrire",
    },
  },
  de: {
    common: {
      hello: 'Hallo',
      welcome: 'Willkommen, {{name}}!',
      loading: 'Wird geladen...',
      error: 'Ein Fehler ist aufgetreten',
      retry: 'Wiederholen',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      done: 'Fertig',
      next: 'Weiter',
      back: 'Zurück',
      skip: 'Überspringen',
      search: 'Suchen',
      settings: 'Einstellungen',
      profile: 'Profil',
      logout: 'Abmelden',
      login: 'Anmelden',
      signup: 'Registrieren',
    },
  },
  ja: {
    common: {
      hello: 'こんにちは',
      welcome: 'ようこそ、{{name}}さん！',
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      retry: '再試行',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      done: '完了',
      next: '次へ',
      back: '戻る',
      skip: 'スキップ',
      search: '検索',
      settings: '設定',
      profile: 'プロフィール',
      logout: 'ログアウト',
      login: 'ログイン',
      signup: '登録',
    },
  },
  zh: {
    common: {
      hello: '你好',
      welcome: '欢迎，{{name}}！',
      loading: '加载中...',
      error: '发生错误',
      retry: '重试',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      done: '完成',
      next: '下一步',
      back: '返回',
      skip: '跳过',
      search: '搜索',
      settings: '设置',
      profile: '个人资料',
      logout: '退出登录',
      login: '登录',
      signup: '注册',
    },
  },
  ko: {
    common: {
      hello: '안녕하세요',
      welcome: '환영합니다, {{name}}님!',
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      retry: '다시 시도',
      cancel: '취소',
      confirm: '확인',
      save: '저장',
      delete: '삭제',
      edit: '편집',
      done: '완료',
      next: '다음',
      back: '뒤로',
      skip: '건너뛰기',
      search: '검색',
      settings: '설정',
      profile: '프로필',
      logout: '로그아웃',
      login: '로그인',
      signup: '가입',
    },
  },
  pt: {
    common: {
      hello: 'Olá',
      welcome: 'Bem-vindo, {{name}}!',
      loading: 'Carregando...',
      error: 'Ocorreu um erro',
      retry: 'Tentar novamente',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar',
      done: 'Concluído',
      next: 'Próximo',
      back: 'Voltar',
      skip: 'Pular',
      search: 'Pesquisar',
      settings: 'Configurações',
      profile: 'Perfil',
      logout: 'Sair',
      login: 'Entrar',
      signup: 'Cadastrar',
    },
  },
};

// Current locale state
let currentLocale: SupportedLocale = 'en';
let isInitialized = false;

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
}

/**
 * Interpolate variables in a string
 */
function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;

  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * Initialize i18n with device locale
 */
export async function initializeI18n(): Promise<void> {
  if (isInitialized) return;

  // Try to get saved locale preference
  try {
    const savedLocale = await AsyncStorage.getItem(LOCALE_KEY);
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale as SupportedLocale)) {
      currentLocale = savedLocale as SupportedLocale;
      isInitialized = true;
      return;
    }
  } catch {
    // Ignore storage errors
  }

  // Fall back to device locale
  const deviceLocales = Localization.getLocales();
  if (deviceLocales.length > 0) {
    const deviceLocale = deviceLocales[0].languageCode as SupportedLocale;
    if (SUPPORTED_LOCALES.includes(deviceLocale)) {
      currentLocale = deviceLocale;
    }
  }

  isInitialized = true;
}

/**
 * Get current locale
 */
export function getLocale(): SupportedLocale {
  return currentLocale;
}

/**
 * Set locale and persist preference
 */
export async function setLocale(locale: SupportedLocale): Promise<void> {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`[i18n] Unsupported locale: ${locale}`);
    return;
  }

  currentLocale = locale;
  try {
    await AsyncStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Translate a key
 */
export function t(key: string, params?: Record<string, string | number>): string {
  // Try current locale
  const translation = getNestedValue(translations[currentLocale], key);
  if (translation) {
    return interpolate(translation, params);
  }

  // Fall back to English
  if (currentLocale !== 'en') {
    const fallback = getNestedValue(translations.en, key);
    if (fallback) {
      return interpolate(fallback, params);
    }
  }

  // Return key if no translation found
  if (__DEV__) {
    console.warn(`[i18n] Missing translation: ${key}`);
  }
  return key;
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(key: string): boolean {
  return (
    getNestedValue(translations[currentLocale], key) !== undefined ||
    getNestedValue(translations.en, key) !== undefined
  );
}

/**
 * Get all translations for current locale
 */
export function getTranslations(): Record<string, unknown> {
  return translations[currentLocale];
}

// Context for React
interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  t: typeof t;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * i18n Provider component
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(currentLocale);
  const [isLoading, setIsLoading] = useState(!isInitialized);

  useEffect(() => {
    initializeI18n().then(() => {
      setLocaleState(currentLocale);
      setIsLoading(false);
    });
  }, []);

  const handleSetLocale = useCallback(async (newLocale: SupportedLocale) => {
    await setLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const value: I18nContextValue = {
    locale,
    setLocale: handleSetLocale,
    t,
    isLoading,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to use i18n in components
 */
export function useTranslation() {
  const context = useContext(I18nContext);

  if (!context) {
    // Fallback for usage outside provider
    return {
      locale: currentLocale,
      setLocale,
      t,
      isLoading: !isInitialized,
    };
  }

  return context;
}

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: SupportedLocale): string {
  const names: Record<SupportedLocale, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    ja: '日本語',
    zh: '中文',
    ko: '한국어',
    pt: 'Português',
  };
  return names[locale] || locale;
}

/**
 * Get all available locales with display names
 */
export function getAvailableLocales(): Array<{ code: SupportedLocale; name: string }> {
  return SUPPORTED_LOCALES.map((code) => ({
    code,
    name: getLocaleDisplayName(code),
  }));
}

// Initialize on import
initializeI18n();
