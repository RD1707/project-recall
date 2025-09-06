import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { updateProfile } from '../../api/profile'; 
import Modal from '../common/Modal';


// Componente de força da senha
const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, text: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const levels = [
      { level: 0, text: '', color: '' },
      { level: 1, text: 'Muito fraca', color: '#ef4444' },
      { level: 2, text: 'Fraca', color: '#f59e0b' },
      { level: 3, text: 'Razoável', color: '#eab308' },
      { level: 4, text: 'Forte', color: '#22c55e' },
      { level: 5, text: 'Muito forte', color: '#16a34a' }
    ];
    
    return levels[score];
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div 
          className="strength-fill" 
          style={{ 
            width: `${(strength.level / 5) * 100}%`,
            backgroundColor: strength.color 
          }}
        />
      </div>
      <span className="strength-text" style={{ color: strength.color }}>
        {strength.text}
      </span>
    </div>
  );
};

// Componente de campo de input aprimorado
const FormField = ({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder, 
  disabled = false,
  maxLength,
  showToggle = false,
  children 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="form-group enhanced">
      <label htmlFor={id} className="form-label">
        {label}
        {maxLength && (
          <span className="char-counter">
            {value?.length || 0}/{maxLength}
          </span>
        )}
      </label>
      <div className="input-wrapper">
        <input
          type={inputType}
          id={id}
          className={`form-control ${error ? 'error' : ''} ${value && !error ? 'valid' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
        />
        {showToggle && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        )}
        {value && !error && !disabled && (
          <div className="input-success-icon">
            <i className="fas fa-check"></i>
          </div>
        )}
      </div>
      {error && <span className="field-error">{error}</span>}
      {children}
    </div>
  );
};

// Componente principal do modal
function ProfileModal({ isOpen, onClose, user, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        bio: user.bio || '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      setHasChanges(false);
      setActiveTab('general');
    }
  }, [user, isOpen]);

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Nome completo é obrigatório';
        if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
        return '';
      
      case 'username':
        if (!value.trim()) return 'Nome de usuário é obrigatório';
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
          return 'Use 3-20 caracteres (letras, números ou _)';
        }
        return '';
      
      case 'bio':
        if (value.length > 160) return 'Bio deve ter no máximo 160 caracteres';
        return '';
      
      case 'password':
        if (value && value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
        return '';
      
      case 'confirmPassword':
        if (formData.password && value !== formData.password) {
          return 'Senhas não coincidem';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [id]: value };
      
      // Verificar se houve mudanças
      const originalData = {
        fullName: user?.fullName || '',
        username: user?.username || '',
        bio: user?.bio || ''
      };
      
      const hasChanged = Object.keys(originalData).some(key => 
        newData[key] !== originalData[key]
      ) || newData.password || newData.confirmPassword;
      
      setHasChanges(hasChanged);
      return newData;
    });

    // Validação em tempo real
    const error = validateField(id, value);
    setErrors(prev => ({ ...prev, [id]: error }));

    // Se é confirmação de senha, também validar a senha principal
    if (id === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Imagem deve ter no máximo 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Arquivo deve ser uma imagem');
        return;
      }
      
      // Aqui você implementaria o upload da imagem
      toast.success('Funcionalidade de avatar será implementada em breve!');
    }
  };

  
  const validateForm = () => {
    const newErrors = {};
    
    // Validar todos os campos
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros antes de salvar');
      return;
    }

    if (!hasChanges) {
      toast.info('Nenhuma alteração foi feita');
      return;
    }

    setLoading(true);
    
    try {
      const dataToUpdate = {};
      
      // Apenas incluir campos que mudaram
      if (formData.fullName !== (user?.fullName || '')) {
        dataToUpdate.full_name = formData.fullName;
      }
      
      if (formData.username !== (user?.username || '')) {
        dataToUpdate.username = formData.username;
      }
      
      if (formData.bio !== (user?.bio || '')) {
        dataToUpdate.bio = formData.bio;
      }
      
      if (formData.password) {
        dataToUpdate.password = formData.password;
      }
      
      await updateProfile(dataToUpdate);
      
      toast.success('Perfil atualizado com sucesso!');
      
      // Atualizar dados do usuário
      onProfileUpdate({ 
        ...user, 
        fullName: formData.fullName,
        username: formData.username,
        bio: formData.bio
      });
      
      setHasChanges(false);
      onClose();
      
    } catch (error) {
      // Erro já tratado pela API
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Perfil"
      footer={
        <div className="modal-footer-enhanced">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="profile-form" 
            className={`btn btn-primary ${hasChanges ? 'has-changes' : ''}`}
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Salvando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="profile-modal-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-container" onClick={handleAvatarClick}>
            <div className="avatar-image">
              <span className="avatar-text">{user?.initial}</span>
              <div className="avatar-overlay">
                <i className="fas fa-camera"></i>
                <span>Alterar foto</span>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="sr-only"
          />
          <div className="user-info">
            <h3>{user?.fullName || 'Usuário'}</h3>
            <p>@{user?.username || 'username'}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="fas fa-user"></i>
            Geral
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="fas fa-shield-alt"></i>
            Segurança
          </button>
        </div>

        {/* Form */}
        <form id="profile-form" onSubmit={handleSubmit}>
          {activeTab === 'general' && (
            <div className="tab-content">
              <FormField
                label="Nome Completo"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                placeholder="Seu nome completo"
                maxLength={50}
              />

              <FormField
                label="Nome de Usuário"
                id="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="seu_username"
                maxLength={20}
              />

              <FormField
                label="Bio"
                id="bio"
                value={formData.bio}
                onChange={handleChange}
                error={errors.bio}
                placeholder="Conte um pouco sobre você..."
                maxLength={160}
              />

              <FormField
                label="E-mail"
                id="email"
                value={user?.email || ''}
                disabled={true}
                placeholder="seu@email.com"
              >
                <small className="field-help">
                  <i className="fas fa-info-circle"></i>
                  E-mail não pode ser alterado no momento
                </small>
              </FormField>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="security-info">
                <i className="fas fa-shield-alt"></i>
                <div>
                  <h4>Alterar Senha</h4>
                  <p>Deixe em branco se não quiser alterar sua senha</p>
                </div>
              </div>

              <FormField
                label="Nova Senha"
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Digite sua nova senha"
                showToggle={true}
              >
                <PasswordStrengthIndicator password={formData.password} />
              </FormField>

              <FormField
                label="Confirmar Nova Senha"
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirme sua nova senha"
                showToggle={true}
              />

              <div className="password-requirements">
                <h4>Requisitos da senha:</h4>
                <ul>
                  <li className={formData.password.length >= 6 ? 'valid' : ''}>
                    <i className="fas fa-check"></i>
                    Pelo menos 6 caracteres
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                    <i className="fas fa-check"></i>
                    Uma letra maiúscula
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                    <i className="fas fa-check"></i>
                    Um número
                  </li>
                </ul>
              </div>
            </div>
          )}
        </form>

        {/* Changes indicator */}
        {hasChanges && (
          <div className="changes-indicator">
            <i className="fas fa-circle"></i>
            Você tem alterações não salvas
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ProfileModal;