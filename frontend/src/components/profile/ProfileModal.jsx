import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { updateProfile, uploadAvatar, deleteAccount } from '../../api/profile';
import Modal from '../common/Modal';

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
          className={`form-control ${error ? 'error' : ''}`}
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
      </div>
      {error && <span className="field-error">{error}</span>}
      {children}
    </div>
  );
};

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setHasChanges(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { 
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('O arquivo deve ser uma imagem.');
      return;
    }

    const promise = uploadAvatar(file);
    toast.promise(promise, {
        loading: 'Enviando avatar...',
        success: (data) => {
            onProfileUpdate({ ...user, avatar_url: data.avatarUrl });
            return 'Avatar atualizado com sucesso!';
        },
        error: 'Não foi possível atualizar o avatar.'
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) {
        toast.info('Nenhuma alteração para salvar.');
        return;
    }
    setLoading(true);
    
    try {
      const dataToUpdate = {};
      if (formData.fullName !== (user?.fullName || '')) dataToUpdate.full_name = formData.fullName;
      if (formData.username !== (user?.username || '')) dataToUpdate.username = formData.username;
      if (formData.bio !== (user?.bio || '')) dataToUpdate.bio = formData.bio;
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
            toast.error("As senhas não coincidem.");
            setLoading(false);
            return;
        }
        dataToUpdate.password = formData.password;
      }
      
      const result = await updateProfile(dataToUpdate);
      toast.success('Perfil atualizado com sucesso!');
      
      onProfileUpdate({ ...user, ...result.profile });
      setHasChanges(false);
      onClose();
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Por favor, insira sua senha para confirmar a exclusão.');
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);

      toast.success('Conta excluída com sucesso!');
      localStorage.clear();
      window.location.href = '/';

    } catch (error) {
      toast.error(error.message || 'Erro ao excluir conta');
    } finally {
      setDeleteLoading(false);
    }
  };

  const avatarContent = user?.avatar_url
    ? <img src={user.avatar_url} alt="Avatar do usuário" className="avatar-img" />
    : <span className="avatar-text">{user?.initial}</span>;

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Perfil"
      footer={
        <div className="modal-footer-enhanced">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            type="submit" 
            form="profile-form" 
            className={`btn btn-primary ${hasChanges ? 'has-changes' : ''}`}
            disabled={loading || !hasChanges}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      }
    >
      <div className="profile-modal-content">
        <div className="avatar-section">
          <div className="avatar-container" onClick={handleAvatarClick}>
            <div className="avatar-image">
              {avatarContent}
              <div className="avatar-overlay">
                <i className="fas fa-camera"></i>
                <span>Alterar</span>
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
          <h3>{user?.username || 'Usuário'}</h3>
          <p className="user-email">{user?.email}</p>
        </div>
        </div>

        <div className="profile-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="fas fa-user-edit"></i> Geral
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="fas fa-shield-alt"></i> Segurança
          </button>
        </div>

        <form id="profile-form" onSubmit={handleSubmit}>
          {activeTab === 'general' && (
            <div className="tab-content">
              <FormField label="Nome Completo" id="fullName" value={formData.fullName} onChange={handleChange} />
              <FormField label="Nome de Usuário" id="username" value={formData.username} onChange={handleChange} />
              <FormField label="Bio" id="bio" value={formData.bio} onChange={handleChange} maxLength={160} placeholder="Conte um pouco sobre você..." />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
               <FormField
                label="Nova Senha"
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Deixe em branco para não alterar"
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
              
              <div className="danger-zone">
                <p>Excluir sua conta é uma ação permanente e não pode ser desfeita.</p>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="fas fa-trash-alt"></i>
                  Excluir Conta
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
    
    {/* Modal de Confirmação de Exclusão */}
    <Modal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Excluir Conta"
      footer={
        <div className="modal-footer-enhanced">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setShowDeleteModal(false)}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn btn-danger"
            onClick={handleDeleteAccount}
            disabled={deleteLoading || !deletePassword.trim()}
          >
            {deleteLoading ? 'Excluindo...' : 'Excluir Conta'}
          </button>
        </div>
      }
    >
      <div className="delete-account-content">
        <div className="warning-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Você tem certeza?</h3>
        <p>Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá todos os seus dados do nosso servidor.</p>
        
        <FormField
          label="Digite sua senha para confirmar:"
          id="deletePassword"
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder="Sua senha atual"
          showToggle={true}
        />
        
        <div className="warning-list">
          <h4>O que será excluído:</h4>
          <ul>
            <li>Seu perfil e dados pessoais</li>
            <li>Todos os seus decks e flashcards</li>
            <li>Histórico de estudos e progresso</li>
            <li>Conquistas e estatísticas</li>
            <li>Participação em comunidades</li>
          </ul>
        </div>
      </div>
    </Modal>
    </>
  );
}

export default ProfileModal;