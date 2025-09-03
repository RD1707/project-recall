import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateProfile } from '../../api/profile'; 
import Modal from '../common/Modal';

function ProfileModal({ isOpen, onClose, user, onProfileUpdate }) {
  const [formData, setFormData] = useState({ fullName: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName || '', password: '' });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToUpdate = { full_name: formData.fullName };
      if (formData.password) {
        if (formData.password.length < 6) {
          toast.error('A nova senha deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }
        dataToUpdate.password = formData.password;
      }
      
      await updateProfile(dataToUpdate);
      toast.success('Perfil atualizado com sucesso!');
      onProfileUpdate({ ...user, fullName: formData.fullName });
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meu Perfil"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" form="profile-form" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="profile-email">E-mail</label>
          <input type="email" id="profile-email" value={user.email || ''} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="fullName">Nome Completo</label>
          <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Nova Senha</label>
          <input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="Deixe em branco para não alterar" />
        </div>
      </form>
    </Modal>
  );
}

export default ProfileModal;