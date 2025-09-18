import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import './EditProfileModal.css';

const EditProfileModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  onAvatarUpload
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    interests: []
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [newInterest, setNewInterest] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

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
    }
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
      // Upload avatar primeiro se houver
      if (avatarFile && onAvatarUpload) {
        await onAvatarUpload(avatarFile);
      }

      // Salvar dados do perfil
      await onSave(formData);

    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && formData.interests.length < MAX_INTERESTS) {
      const interest = {
        name: newInterest.trim(),
        color: selectedColor
      };
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      setNewInterest('');
    }
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
      footer={
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Salvar'}
        </button>
      }
    >
      <div className="edit-profile-content">
        {/* Banner */}
        <div className="banner-section">
          <button className="banner-edit-btn">
            <i className="fas fa-camera"></i>
          </button>
        </div>

        {/* Avatar e Info */}
        <div className="avatar-section">
          <div className="avatar-container">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="avatar-preview" />
            ) : (
              <div className="avatar-placeholder">
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <button
              className="avatar-edit-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <i className="fas fa-camera"></i>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>
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
            />
            {errors.fullName && <div className="error-message">{errors.fullName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Nome de usuário</label>
            <input
              type="text"
              className="form-input"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="@seunomeusuario"
              disabled={loading}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
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
            {errors.bio && <div className="error-message">{errors.bio}</div>}
          </div>

          {/* Interesses */}
          <div className="interests-section">
            <label className="form-label">Interesses</label>
            <div className="interests-list">
              {formData.interests.map((interest, index) => (
                <div
                  key={index}
                  className="interest-tag"
                  style={{ backgroundColor: interest.color }}
                >
                  <span>{interest.name}</span>
                  <button
                    className="interest-remove"
                    onClick={() => removeInterest(index)}
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>

            {formData.interests.length < MAX_INTERESTS && (
              <div className="add-interest-form">
                <input
                  type="text"
                  className="add-interest-input"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Adicionar interesse..."
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  disabled={loading}
                />

                <div className="color-picker-container">
                  <div
                    className="color-preview"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />

                  {showColorPicker && (
                    <div className="color-palette">
                      {colorPalette.map(color => (
                        <button
                          key={color}
                          className="color-option"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setSelectedColor(color);
                            setShowColorPicker(false);
                          }}
                        >
                          {selectedColor === color && <i className="fas fa-check check-icon"></i>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="add-interest-btn"
                  onClick={addInterest}
                  disabled={!newInterest.trim() || loading}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            )}

            <div className={`interests-limit ${formData.interests.length >= MAX_INTERESTS ? 'error' : formData.interests.length >= MAX_INTERESTS - 2 ? 'warning' : ''}`}>
              {formData.interests.length}/{MAX_INTERESTS} interesses
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;