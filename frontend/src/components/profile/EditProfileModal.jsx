import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Plus, Check, XCircle, Trash2, Image as ImageIcon } from 'react-feather';
import Modal from '../common/Modal';
import './EditProfileModal.css';

const EditProfileModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  onAvatarUpload,
  onBannerUpload,
  onAvatarRemove,
  onBannerRemove
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    interests: []
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [newInterest, setNewInterest] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const MAX_INTERESTS = 8;
  const MAX_BIO_LENGTH = 160;

  const colorPalette = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#84cc16', '#10b981', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6d28d9', '#a855f7'
  ];

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        bio: user.bio || '',
        interests: user.interests || []
      });
      setAvatarPreview(user.avatar_url);
      setBannerPreview(user.banner_url);
    }
    
    // Reset states when modal closes
    return () => {
      setAvatarFile(null);
      setBannerFile(null);
      setNewInterest('');
      setShowColorPicker(false);
      setErrors({});
    };
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showColorPicker) {
        setShowColorPicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, showColorPicker]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Nome de usuário deve conter apenas letras, números e underscore';
    }

    if (formData.bio.length > MAX_BIO_LENGTH) {
      newErrors.bio = `Bio deve ter no máximo ${MAX_BIO_LENGTH} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Upload banner primeiro se houver
      if (bannerFile && onBannerUpload) {
        await onBannerUpload(bannerFile);
      }
      
      // Upload avatar se houver
      if (avatarFile && onAvatarUpload) {
        await onAvatarUpload(avatarFile);
      }

      // Salvar dados do perfil
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors(prev => ({
        ...prev,
        save: 'Ocorreu um erro ao salvar as alterações. Tente novamente.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setErrors(prev => ({
        ...prev,
        [type]: 'Por favor, selecione um arquivo de imagem válido.'
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [type]: 'A imagem deve ter no máximo 5MB.'
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') {
        setAvatarPreview(reader.result);
        setAvatarFile(file);
      } else {
        setBannerPreview(reader.result);
        setBannerFile(file);
      }
      // Clear any previous errors
      setErrors(prev => ({ ...prev, [type]: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (onAvatarRemove) {
      onAvatarRemove();
    }
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveBanner = () => {
    if (onBannerRemove) {
      onBannerRemove();
    }
    setBannerPreview(null);
    setBannerFile(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
  };

  const addInterest = (e) => {
    e.preventDefault();
    const interestText = newInterest.trim();
    
    if (!interestText || formData.interests.length >= MAX_INTERESTS) return;
    
    // Check if interest already exists (case insensitive)
    const exists = formData.interests.some(
      interest => interest.name.toLowerCase() === interestText.toLowerCase()
    );
    
    if (exists) {
      setErrors(prev => ({
        ...prev,
        interest: 'Este interesse já foi adicionado.'
      }));
      return;
    }
    
    const interest = {
      name: interestText,
      color: selectedColor
    };
    
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, interest]
    }));
    
    setNewInterest('');
    setSelectedColor('#6366f1');
    setErrors(prev => ({ ...prev, interest: null }));
  };

  const removeInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar perfil"
      className="edit-profile-modal"
      footer={
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Salvando...
              </>
            ) : (
              'Salvar alterações'
            )}
          </button>
        </div>
      }
    >
      <div className="edit-profile-content">
        {/* Banner */}
        <div 
          className="banner-section"
          style={bannerPreview ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          onClick={() => bannerInputRef.current?.click()}
        >
          <div className="banner-edit-overlay">
            <button 
              className="banner-edit-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                bannerInputRef.current?.click();
              }}
            >
              <Camera size={16} />
              <span>Alterar banner</span>
            </button>
            {bannerPreview && (
              <button 
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveBanner();
                }}
                type="button"
              >
                <Trash2 size={14} />
                Remover
              </button>
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFileChange(e, 'banner')}
          />
          {errors.banner && <div className="error-message">{errors.banner}</div>}
        </div>

        {/* Avatar */}
        <div className="avatar-section">
          <div className="avatar-container">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="avatar-preview" />
            ) : (
              <div className="avatar-placeholder">
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div 
              className="avatar-edit-overlay"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={20} />
              <span>Alterar</span>
              {avatarPreview && (
                <button 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAvatar();
                  }}
                  type="button"
                >
                  <Trash2 size={12} />
                  Remover
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFileChange(e, 'avatar')}
            />
          </div>
          {errors.avatar && <div className="error-message">{errors.avatar}</div>}
        </div>

        {/* Formulário */}
        <div className="form-content">
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input
              type="text"
              className="form-input"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Seu nome completo"
              disabled={loading}
              maxLength={50}
            />
            {errors.fullName && <div className="error-message">{errors.fullName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Nome de usuário</label>
            <div className="input-with-prefix">
              <span className="input-prefix">@</span>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                  setFormData(prev => ({ ...prev, username: value }));
                }}
                placeholder="seunomeusuario"
                disabled={loading}
                maxLength={15}
              />
            </div>
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <div className="textarea-container">
              <textarea
                className="form-textarea"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você..."
                rows="3"
                maxLength={MAX_BIO_LENGTH}
                disabled={loading}
              />
              <div className={`char-count ${formData.bio.length > MAX_BIO_LENGTH * 0.8 ? 'warning' : ''}`}>
                {formData.bio.length}/{MAX_BIO_LENGTH}
              </div>
            </div>
            {errors.bio && <div className="error-message">{errors.bio}</div>}
          </div>

          {/* Interesses */}
          <div className="interests-section">
            <label className="form-label">Interesses</label>
            <p className="interests-description">Adicione até {MAX_INTERESTS} interesses para ajudar outros usuários a te conhecerem melhor</p>
            
            <div className="interests-list">
              {formData.interests.map((interest, index) => (
                <div
                  key={`${interest.name}-${index}`}
                  className="interest-tag"
                  style={{ backgroundColor: interest.color }}
                >
                  <span>{interest.name}</span>
                  <button
                    type="button"
                    className="interest-remove"
                    onClick={() => removeInterest(index)}
                    disabled={loading}
                    aria-label={`Remover ${interest.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {formData.interests.length < MAX_INTERESTS && (
              <form onSubmit={addInterest} className="add-interest-form">
                <div className="form-input-group">
                  <input
                    type="text"
                    className="add-interest-input"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Ex: Desenvolvimento Web"
                    disabled={loading}
                    maxLength={30}
                  />
                  <div className="color-picker-container">
                    <button
                      type="button"
                      className="color-preview"
                      style={{ backgroundColor: selectedColor }}
                      onClick={(e) => {
                        e.preventDefault();
                        setShowColorPicker(!showColorPicker);
                      }}
                      aria-label="Selecionar cor"
                    >
                      {showColorPicker && (
                        <div className="color-palette">
                          {colorPalette.map(color => (
                            <button
                              key={color}
                              type="button"
                              className="color-option"
                              style={{ backgroundColor: color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedColor(color);
                                setShowColorPicker(false);
                              }}
                              aria-label={`Selecionar cor ${color}`}
                            >
                              {selectedColor === color && <Check size={14} className="check-icon" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="add-interest-btn"
                    disabled={!newInterest.trim() || loading}
                    aria-label="Adicionar interesse"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                {errors.interest && <div className="error-message">{errors.interest}</div>}
              </form>
            )}

            <div className={`interests-limit ${formData.interests.length >= MAX_INTERESTS ? 'error' : formData.interests.length >= MAX_INTERESTS - 2 ? 'warning' : ''}`}>
              {formData.interests.length} de {MAX_INTERESTS} interesses adicionados
            </div>
          </div>
        </div>
        
        {errors.save && (
          <div className="alert alert-error">
            <XCircle size={18} />
            <span>{errors.save}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditProfileModal;