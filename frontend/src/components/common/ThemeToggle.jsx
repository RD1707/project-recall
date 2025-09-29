import React from 'react';
import { useTheme } from 'frontend/src/context/ThemeContext';
import 'frontend/src/assets\css/ThemeToggle';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-container">
      <label className="theme-switch" htmlFor="theme-switch-checkbox" title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}>
        <input
          type="checkbox"
          id="theme-switch-checkbox"
          onChange={toggleTheme}
          checked={theme === 'dark'}
        />
        <div className="slider round">
          <span className="sun-icon">☀️</span>
          <span className="moon-icon">🌙</span>
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;