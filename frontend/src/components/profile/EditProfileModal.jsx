import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { STUDY_AREAS, searchAreas, getCategories } from '../../constants/studyAreas';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showAreaSelection, setShowAreaSelection] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState(STUDY_AREAS);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const MAX_INTERESTS = 6;
  const MAX_BIO_LENGTH = 160;

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
      setSearchTerm('');
      setShowAreaSelection(false);
      setFilteredAreas(STUDY_AREAS);
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

  // Função para filtrar áreas baseada na busca
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredAreas(searchAreas(term));
  };

  // Função para adicionar área de interesse
  const addArea = (area) => {
    if (formData.interests.length >= MAX_INTERESTS) return;

    // Verificar se a área já foi selecionada
    const exists = formData.interests.some(
      interest => interest.name === area.name
    );

    if (exists) return;

    const newArea = { name: area.name, color: area.color };
    setFormData(prev => ({ ...prev, interests: [...prev.interests, newArea] }));
    setShowAreaSelection(false);
    setSearchTerm('');
    setFilteredAreas(STUDY_AREAS);
  };

  // Função para remover área de interesse
  const removeArea = (index) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter((_, i) => i !== index) }));
  };

  // Função para fechar o modal de seleção de áreas
  const closeAreaSelection = () => {
    setShowAreaSelection(false);
    setSearchTerm('');
    setFilteredAreas(STUDY_AREAS);
  };

  // Função para lidar com clique no backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeAreaSelection();
    }
  };

  // Adicionar suporte à tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showAreaSelection) {
        closeAreaSelection();
      }
    };

    if (showAreaSelection) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [showAreaSelection]);

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
            <label className="form-label">Áreas de Interesse</label>
            <p className="interests-description">
              Selecione até {MAX_INTERESTS} áreas de estudo do seu interesse
            </p>

            {/* Áreas Selecionadas */}
            <div className="interests-list">
              {formData.interests.map((interest, index) => (
                <div key={index} className="interest-tag" style={{ backgroundColor: interest.color }}>
                  <span>{interest.name}</span>
                  <button
                    type="button"
                    className="interest-remove"
                    onClick={() => removeArea(index)}
                    disabled={loading}
                    aria-label={`Remover ${interest.name}`}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Botão para adicionar nova área */}
            {formData.interests.length < MAX_INTERESTS && (
              <div className="add-area-section">
                <button
                  type="button"
                  className="add-area-btn"
                  onClick={() => setShowAreaSelection(true)}
                  disabled={loading}
                >
                  <i className="fas fa-plus"></i>
                  Adicionar área de interesse
                </button>
              </div>
            )}

            {/* Modal de seleção de áreas */}
            {showAreaSelection && (
              <div className="area-selection-backdrop" onClick={handleBackdropClick}>
                <div className="area-selection-modal">
                  <div className="area-selection-header">
                    <h3>Selecionar Área de Interesse</h3>
                    <button
                      type="button"
                      className="close-area-selection"
                      onClick={closeAreaSelection}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  {/* Campo de busca */}
                  <div className="area-search-container">
                    <input
                      type="text"
                      className="area-search-input"
                      placeholder="Buscar área de interesse..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      autoFocus
                    />
                    <i className="fas fa-search search-icon"></i>
                  </div>

                  {/* Lista de áreas */}
                  <div className="areas-list">
                    {filteredAreas.map((area, index) => {
                      const isSelected = formData.interests.some(interest => interest.name === area.name);
                      return (
                        <button
                          key={index}
                          type="button"
                          className={`area-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => addArea(area)}
                          disabled={isSelected || formData.interests.length >= MAX_INTERESTS}
                        >
                          <span className="area-name">{area.name}</span>
                          <span className="area-category" style={{ color: area.color }}>
                            {area.category}
                          </span>
                          {isSelected && <i className="fas fa-check selected-icon"></i>}
                        </button>
                      );
                    })}
                  </div>

                  {filteredAreas.length === 0 && (
                    <div className="no-areas-found">
                      <i className="fas fa-search"></i>
                      <p>Nenhuma área encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={`interests-limit ${formData.interests.length >= MAX_INTERESTS ? 'error' : formData.interests.length >= MAX_INTERESTS - 2 ? 'warning' : ''}`}>
              {formData.interests.length} de {MAX_INTERESTS} áreas selecionadas
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;