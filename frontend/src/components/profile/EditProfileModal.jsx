import React, { useState, useEffect, useRef } from 'react';
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
    
    return () => {
      setAvatarFile(null);
      setBannerFile(null);
      setNewInterest('');
      setShowColorPicker(false);
      setErrors({});
    };
  }, [isOpen, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (bannerFile && onBannerUpload) await onBannerUpload(bannerFile);
      if (avatarFile && onAvatarUpload) await onAvatarUpload(avatarFile);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors(prev => ({
        ...prev,
        save: 'Ocorreu um erro ao salvar as alterações.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') {
        setAvatarPreview(reader.result);
        setAvatarFile(file);
      } else {
        setBannerPreview(reader.result);
        setBannerFile(file);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveAvatar = (e) => {
    e.stopPropagation();
    if (onAvatarRemove) onAvatarRemove();
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveBanner = (e) => {
    e.stopPropagation();
    if (onBannerRemove) onBannerRemove();
    setBannerPreview(null);
    setBannerFile(null);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
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

    const interest = { name: interestText, color: selectedColor };
    setFormData(prev => ({ ...prev, interests: [...prev.interests, interest] }));
    setNewInterest('');
    setSelectedColor('#6366f1'); // Reset to default color
    setErrors(prev => ({ ...prev, interest: null })); // Clear any error
  };

  const removeInterest = (index) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter((_, i) => i !== index) }));
  };

  const customHeader = (
    <div className="edit-profile-header">
      <div className="header-left">
        <button className="close-modal-btn" onClick={onClose} aria-label="Fechar modal">
          <i className="fas fa-times"></i>
        </button>
        <h2 className="modal-title">Editar perfil</h2>
      </div>
      <button
        className="save-profile-btn"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            Salvando...
          </>
        ) : (
          'Salvar alterações'
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="edit-profile-modal"
      customHeader={customHeader}
    >
      <div className="edit-profile-content">
        <div className="banner-section" onClick={() => bannerInputRef.current?.click()}>
          <div className="banner-image" style={bannerPreview ? { backgroundImage: `url(${bannerPreview})` } : {}}></div>
          <div className="banner-edit-overlay">
            <button className="banner-edit-btn" type="button" onClick={(e) => { e.stopPropagation(); bannerInputRef.current?.click(); }}>
              <i className="fas fa-camera"></i>
              <span>Alterar Banner</span>
            </button>
            {bannerPreview && (
              <button className="remove-btn" onClick={handleRemoveBanner} type="button">
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden-file-input" onChange={(e) => handleFileChange(e, 'banner')} />
        </div>

        <div className="avatar-section">
          <div className="avatar-container" onClick={() => fileInputRef.current?.click()}>
            {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="avatar-preview" /> : <div className="avatar-placeholder">{formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}</div>}
            <div className="avatar-edit-overlay">
              <button className="avatar-change-btn" type="button">
                <i className="fas fa-camera"></i>
                <span>Alterar</span>
              </button>
              {avatarPreview && (
                <button className="remove-btn" onClick={handleRemoveAvatar} type="button">
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden-file-input" onChange={(e) => handleFileChange(e, 'avatar')} />
          </div>
        </div>

        <div className="form-content">
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input type="text" className="form-input" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} disabled={loading} />
          </div>
          <div className="form-group">
            <label className="form-label">Nome de usuário</label>
            <div className="input-with-prefix">
              <span className="input-prefix">@</span>
              <input type="text" className="form-input" value={formData.username} onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') }))} disabled={loading} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-textarea" value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} rows="3" maxLength={MAX_BIO_LENGTH} disabled={loading} />
            <div className="char-count">{formData.bio.length}/{MAX_BIO_LENGTH}</div>
          </div>
          <div className="interests-section">
            <label className="form-label">Interesses</label>
            <p className="interests-description">
              Adicione até {MAX_INTERESTS} interesses para personalizar seu perfil
            </p>

            <div className="interests-list">
              {formData.interests.map((interest, index) => (
                <div key={index} className="interest-tag" style={{ backgroundColor: interest.color }}>
                  <span>{interest.name}</span>
                  <button
                    type="button"
                    className="interest-remove"
                    onClick={() => removeInterest(index)}
                    disabled={loading}
                    aria-label={`Remover ${interest.name}`}
                  >
                    <i className="fas fa-times"></i>
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
                    placeholder="Ex: Programação, Design, Música..."
                    disabled={loading}
                    maxLength={30}
                  />

                  <div className="color-picker-container">
                    <button
                      type="button"
                      className="color-preview"
                      style={{ backgroundColor: selectedColor }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
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
                              onClick={() => {
                                setSelectedColor(color);
                                setShowColorPicker(false);
                              }}
                              aria-label={`Selecionar cor ${color}`}
                            >
                              {selectedColor === color && (
                                <i className="fas fa-check check-icon"></i>
                              )}
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
                    <i className="fas fa-plus"></i>
                  </button>
                </div>

                {errors.interest && (
                  <div className="error-message">{errors.interest}</div>
                )}
              </form>
            )}

            <div className={`interests-limit ${formData.interests.length >= MAX_INTERESTS ? 'error' : formData.interests.length >= MAX_INTERESTS - 2 ? 'warning' : ''}`}>
              {formData.interests.length} de {MAX_INTERESTS} interesses adicionados
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;