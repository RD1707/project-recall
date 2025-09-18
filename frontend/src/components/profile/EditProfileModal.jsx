import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Plus, Check, Loader2 } from 'lucide-react';

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
  
  const modalRef = useRef(null);
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
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!loading) {
      setFormData({
        fullName: '',
        username: '',
        bio: '',
        interests: []
      });
      setAvatarPreview(null);
      setAvatarFile(null);
      setNewInterest('');
      setErrors({});
      onClose();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'Imagem deve ter menos de 5MB' });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setErrors({ ...errors, avatar: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    if (formData.interests.length >= MAX_INTERESTS) {
      setErrors({ ...errors, interests: `Máximo de ${MAX_INTERESTS} interesses` });
      return;
    }

    const interest = {
      id: Date.now(),
      name: newInterest.trim(),
      color: selectedColor
    };

    setFormData({
      ...formData,
      interests: [...formData.interests, interest]
    });
    setNewInterest('');
    setErrors({ ...errors, interests: null });
  };

  const handleRemoveInterest = (id) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i.id !== id)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome é obrigatório';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Use apenas letras, números e _';
    }
    
    if (formData.bio.length > MAX_BIO_LENGTH) {
      newErrors.bio = `Máximo de ${MAX_BIO_LENGTH} caracteres`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Upload avatar primeiro se houver mudança
      if (avatarFile && onAvatarUpload) {
        await onAvatarUpload(avatarFile);
      }
      
      // Salvar dados do perfil
      await onSave(formData);
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Erro ao salvar alterações' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        {/* Header */}
        <div className="modal-header">
          <button 
            className="close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
          <h2>Editar perfil</h2>
          <button 
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="spin" /> : 'Salvar'}
          </button>
        </div>

        {/* Banner */}
        <div className="banner-section">
          <div className="banner-placeholder">
            <button className="banner-edit-btn">
              <Camera size={20} />
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {formData.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <button 
              className="avatar-edit-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              hidden
            />
          </div>
          {errors.avatar && (
            <span className="error-text">{errors.avatar}</span>
          )}
        </div>

        {/* Form Fields */}
        <div className="form-container">
          {/* Nome */}
          <div className="form-field">
            <label htmlFor="fullName">Nome</label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Seu nome completo"
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && (
              <span className="error-text">{errors.fullName}</span>
            )}
          </div>

          {/* Username */}
          <div className="form-field">
            <label htmlFor="username">Nome de usuário</label>
            <div className="username-input">
              <span className="username-prefix">@</span>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="seu_username"
                className={errors.username ? 'error' : ''}
              />
            </div>
            {errors.username && (
              <span className="error-text">{errors.username}</span>
            )}
          </div>

          {/* Bio */}
          <div className="form-field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Conte um pouco sobre você..."
              rows={3}
              className={errors.bio ? 'error' : ''}
            />
            <div className="char-count">
              <span className={formData.bio.length > MAX_BIO_LENGTH ? 'error' : ''}>
                {formData.bio.length}/{MAX_BIO_LENGTH}
              </span>
            </div>
            {errors.bio && (
              <span className="error-text">{errors.bio}</span>
            )}
          </div>

          {/* Interesses */}
          <div className="form-field">
            <label>Interesses</label>
            <div className="interests-container">
              {formData.interests.map((interest) => (
                <div 
                  key={interest.id}
                  className="interest-tag"
                  style={{ backgroundColor: interest.color }}
                >
                  <span>{interest.name}</span>
                  <button
                    onClick={() => handleRemoveInterest(interest.id)}
                    className="remove-interest"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {formData.interests.length < MAX_INTERESTS && (
                <div className="add-interest-wrapper">
                  <div className="add-interest-input">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                      placeholder="Adicionar interesse..."
                      maxLength={20}
                    />
                    <button
                      className="color-picker-btn"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      style={{ backgroundColor: selectedColor }}
                    />
                    <button
                      onClick={handleAddInterest}
                      className="add-btn"
                      disabled={!newInterest.trim()}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  {showColorPicker && (
                    <div className="color-picker-dropdown">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setSelectedColor(color);
                            setShowColorPicker(false);
                          }}
                        >
                          {selectedColor === color && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="field-hint">
              {formData.interests.length}/{MAX_INTERESTS} interesses
            </span>
            {errors.interests && (
              <span className="error-text">{errors.interests}</span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { 
            transform: translateY(20px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
        }

        .save-btn {
          padding: 6px 16px;
          background: #1d1d1d;
          color: white;
          border: none;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .banner-section {
          height: 120px;
          position: relative;
        }

        .banner-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
        }

        .banner-edit-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .banner-edit-btn:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .avatar-section {
          padding: 0 20px;
          margin-top: -48px;
          margin-bottom: 20px;
        }

        .avatar-wrapper {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 4px solid white;
          position: relative;
          background: white;
        }

        .avatar-wrapper img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 600;
          color: white;
        }

        .avatar-edit-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #6366f1;
          border: 3px solid white;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .avatar-edit-btn:hover {
          background: #5558e3;
        }

        .form-container {
          padding: 0 20px 20px;
        }

        .form-field {
          margin-bottom: 24px;
        }

        .form-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-field input,
        .form-field textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.2s;
          background: #f9fafb;
        }

        .form-field input:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #6366f1;
          background: white;
        }

        .form-field input.error,
        .form-field textarea.error {
          border-color: #ef4444;
        }

        .username-input {
          position: relative;
        }

        .username-prefix {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 15px;
        }

        .username-input input {
          padding-left: 36px;
        }

        .char-count {
          text-align: right;
          margin-top: 4px;
          font-size: 13px;
          color: #9ca3af;
        }

        .char-count .error {
          color: #ef4444;
        }

        .error-text {
          display: block;
          margin-top: 4px;
          font-size: 13px;
          color: #ef4444;
        }

        .interests-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          min-height: 42px;
          padding: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .interest-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 16px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          animation: slideIn 0.2s ease;
        }

        @keyframes slideIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .remove-interest {
          background: transparent;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .remove-interest:hover {
          opacity: 1;
        }

        .add-interest-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .add-interest-input {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .add-interest-input input {
          flex: 1;
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          font-size: 14px;
          background: white;
        }

        .color-picker-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 1px #e5e7eb;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .color-picker-btn:hover {
          transform: scale(1.1);
        }

        .add-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #6366f1;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover:not(:disabled) {
          background: #5558e3;
        }

        .add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .color-picker-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .color-option {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: white;
          box-shadow: 0 0 0 2px #e5e7eb;
        }

        .field-hint {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          color: #9ca3af;
        }

        @media (max-width: 640px) {
          .modal-container {
            width: 100%;
            height: 100%;
            max-height: 100vh;
            border-radius: 0;
          }

          .color-picker-dropdown {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .modal-container {
            background: #1f2937;
            color: #f3f4f6;
          }

          .modal-header {
            border-bottom-color: #374151;
          }

          .modal-header h2 {
            color: #f3f4f6;
          }

          .close-btn:hover {
            background: #374151;
          }

          .form-field label {
            color: #d1d5db;
          }

          .form-field input,
          .form-field textarea {
            background: #111827;
            border-color: #374151;
            color: #f3f4f6;
          }

          .form-field input:focus,
          .form-field textarea:focus {
            background: #1f2937;
          }

          .interests-container {
            background: #111827;
            border-color: #374151;
          }

          .add-interest-input input {
            background: #1f2937;
            border-color: #374151;
            color: #f3f4f6;
          }

          .color-picker-dropdown {
            background: #1f2937;
            border-color: #374151;
          }
        }
      `}</style>
    </div>
  );
};

export default EditProfileModal;