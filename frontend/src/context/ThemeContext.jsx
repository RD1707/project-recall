// frontend/src/context/ThemeContext.jsx

import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';

// 1. Cria o Contexto
const ThemeContext = createContext();

// 2. Hook customizado para facilitar o uso (boa prática da Versão 1)
export const useTheme = () => useContext(ThemeContext);

/**
 * Provedor do Tema: A versão final e otimizada.
 * Gerencia o tema da aplicação com detecção de preferência do sistema e otimização de performance.
 */
export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Memoiza o valor para otimizar a performance, evitando re-renderizações
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};