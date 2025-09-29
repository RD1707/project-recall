import React, { createContext, useState, useEffect, useContext } from 'react';

// Cria o Contexto
const ThemeContext = createContext();

// Hook customizado para facilitar o uso do contexto
export const useTheme = () => useContext(ThemeContext);

// Componente Provedor que irá envolver sua aplicação
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Verifica se já existe um tema salvo no localStorage do navegador
    const savedTheme = localStorage.getItem('theme');
    // Se existir, usa o tema salvo. Senão, o padrão é 'light' (claro).
    return savedTheme || 'light';
  });

  // Este efeito é executado sempre que o estado 'theme' muda
  useEffect(() => {
    // 1. Aplica o atributo 'data-theme' ao body do HTML
    document.body.setAttribute('data-theme', theme);
    // 2. Salva a escolha do usuário no localStorage para persistir a seleção
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Função para alternar entre 'light' e 'dark'
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Fornece o tema atual e a função de troca para os componentes filhos
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};