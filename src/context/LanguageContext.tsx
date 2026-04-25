import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LanguageCode, TranslationKey } from '../constants/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<LanguageCode>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLang = await AsyncStorage.getItem('preferred_language');
      if (savedLang && (savedLang in translations)) {
        setLang(savedLang as LanguageCode);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    setLang(lang);
    await AsyncStorage.setItem('preferred_language', lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
