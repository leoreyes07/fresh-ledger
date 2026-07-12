import React, { createContext, useContext, useState } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateItem: (itemName: string) => string;
  translateCategory: (catName: string) => string;
  translateUnit: (unitName: string) => string;
  translateStep: (stepText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const cached = localStorage.getItem('fresh_ledger_language');
    // Default to 'es' (Spanish) originally
    return (cached === 'en' || cached === 'es') ? cached : 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fresh_ledger_language', lang);
  };

  const t = (key: string): string => {
    const dict = translations[language];
    let resolvedKey = key;
    if (key.startsWith('inventory.')) {
      resolvedKey = key.replace('inventory.', 'inv.');
    } else if (key.startsWith('recipe.')) {
      resolvedKey = key.replace('recipe.', 'rec.');
    }
    return (dict as any)[resolvedKey] || (dict as any)[key] || key;
  };

  const translateItem = (itemName: string): string => {
    const dict = translations[language];
    const key = `item.${itemName}`;
    return (dict as any)[key] || itemName;
  };

  const translateCategory = (catName: string): string => {
    const dict = translations[language];
    const key = `cat.${catName}`;
    return (dict as any)[key] || catName;
  };

  const translateUnit = (unitName: string): string => {
    const dict = translations[language];
    const key = `unit.${unitName}`;
    return (dict as any)[key] || unitName;
  };

  const translateStep = (stepText: string): string => {
    const dict = translations[language];
    
    const stepMappings: { [key: string]: string } = {
      // English
      'Autolyse flour and water for 1 hour.': 'step.autolyse',
      'Mix in starter and salt. Stretch and fold 4 times over 2 hours.': 'step.mixStarter',
      'Bulk ferment at room temp for 4-6 hours until 50% increase.': 'step.bulkFerment',
      'Shape and cold retard in bannetons for 12-16 hours.': 'step.shape',
      'Bake in Dutch oven at 450°F (20 mins covered, 20 mins uncovered).': 'step.bake',
      'Sear short ribs on all sides until deep brown.': 'step.searRibs',
      'Braised with red wine, aromatics, and beef stock at 325°F for 3 hours.': 'step.braise',
      'Let rest, strain and reduce braising liquid to a glaze.': 'step.restGlaze',
      'Portion salmon fillets into 200g cuts.': 'step.portionSalmon',
      'Vacuum seal with olive oil, salt, and fresh herbs.': 'step.sealSalmon',
      'Cook in water bath at 122°F (50°C) for 40 minutes, then sear skin if desired.': 'step.cookSalmon',
      'Toast arborio rice in deep pan.': 'step.toastRice',
      'Slowly add warm stock, stirring continuously until fully absorbed.': 'step.addStock',
      'Finish with butter, parmigiano-reggiano, and drizzle with truffle oil.': 'step.finishRisotto',
      'Combine ingredients.': 'step.combine',
      'Process, portion, and bake.': 'step.process',

      // Spanish
      'Autólisis de harina y agua durante 1 hora.': 'step.autolyse',
      'Mezclar con la masa madre y sal. Estirar y doblar 4 veces en 2 horas.': 'step.mixStarter',
      'Fermentación en bloque a temperatura ambiente por 4-6 horas hasta aumentar un 50%.': 'step.bulkFerment',
      'Formar y retardar en frío en banetones por 12-16 horas.': 'step.shape',
      'Hornear en olla holandesa a 230°C (20 min cubierto, 20 min descubierto).': 'step.bake',
      'Sellar las costillas por todos lados hasta que estén bien doradas.': 'step.searRibs',
      'Brasear con vino tinto, aromáticos y caldo de res a 160°C durante 3 horas.': 'step.braise',
      'Dejar reposar, colar y reducir el líquido de cocción hasta obtener un glaseado.': 'step.restGlaze',
      'Cortar los filetes de salmón en porciones de 200g.': 'step.portionSalmon',
      'Sellar al vacío con aceite de oliva, sal y hierbas frescas.': 'step.sealSalmon',
      'Cocinar al baño maría a 50°C por 40 minutos, luego sellar la piel si se desea.': 'step.cookSalmon',
      'Tostar el arroz arborio en una sartén honda.': 'step.toastRice',
      'Añadir poco a poco el caldo caliente, revolviendo continuamente hasta que se absorba por completo.': 'step.addStock',
      'Terminar con mantequilla, queso parmesano y un chorrito de aceite de truco (trufa).': 'step.finishRisotto',
      'Combinar los ingredientes.': 'step.combine',
      'Procesar, porcionar y hornear.': 'step.process'
    };

    const key = stepMappings[stepText];
    if (key && (dict as any)[key]) {
      return (dict as any)[key];
    }
    return stepText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateItem, translateCategory, translateUnit, translateStep }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
