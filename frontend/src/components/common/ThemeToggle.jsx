import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react'; // Usando lucide-react para ícones
import '../../assets/css/ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="theme-icon" />
      ) : (
        <Sun className="theme-icon" />
      )}
    </button>
  );
};

export default ThemeToggle;