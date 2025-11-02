import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './PortfolioManager.css';

export default function PortfolioManager({ firebaseApp }) {
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Instalação',
    location: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const CATEGORIES = ['Instalação', 'Manutenção', 'Retrofit', 'Automação', 'Emergência', 'Outro'];

  // Carregar itens do portfólio
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'portfolio'), snapshot => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPortfolioItems(items.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    return () => unsub();
  }, [db]);

  // Carregar foto de perfil e logo da empresa
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'profile'), docSnap => {
      if (docSnap.exists()) {
        setProfilePhoto(docSnap.data().photoURL || '');
        setCompanyLogo(docSnap.data().logoURL || '');
      }
    });
    return () => unsub();
  }, [db]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.description) {
      alert('Preencha título e descrição');
      return;
    }

    if (!editingId && !imageFile) {
      alert('Adicione uma imagem do trabalho realizado');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = editingId ? portfolioItems.find(p => p.id === editingId)?.imageUrl : '';

      // Upload da imagem se houver uma nova
      if (imageFile) {
        const storageRef = ref(storage, `portfolio/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const portfolioData = {
        ...form,
        imageUrl,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'portfolio', editingId), portfolioData);
        alert('Trabalho atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'portfolio'), {
          ...portfolioData,
          createdAt: serverTimestamp()
        });
        alert('Trabalho adicionado com sucesso!');
      }

      resetForm();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      location: item.location || ''
    });
    setImagePreview(item.imageUrl);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este trabalho?')) return;
    
    try {
      await deleteDoc(doc(db, 'portfolio', id));
      alert('Trabalho excluído com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir');
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'Instalação', location: '' });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const storageRef = ref(storage, `profile/photo_${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      const settingsRef = doc(db, 'settings', 'profile');
      await updateDoc(settingsRef, {
        photoURL,
        updatedAt: serverTimestamp()
      }).catch(async () => {
        // Se não existe, cria
        await addDoc(collection(db, 'settings'), {
          photoURL,
          logoURL: '',
          updatedAt: serverTimestamp()
        });
      });

      setProfilePhoto(photoURL);
      alert('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
    }
  };

  const handleCompanyLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const storageRef = ref(storage, `profile/logo_${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const logoURL = await getDownloadURL(storageRef);

      const settingsRef = doc(db, 'settings', 'profile');
      await updateDoc(settingsRef, {
        logoURL,
        updatedAt: serverTimestamp()
      }).catch(async () => {
        // Se não existe, cria
        await addDoc(collection(db, 'settings'), {
          photoURL: '',
          logoURL,
          updatedAt: serverTimestamp()
        });
      });

      setCompanyLogo(logoURL);
      alert('Logo da empresa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload da logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="portfolio-manager">
      {/* Foto de Perfil e Logo da Empresa */}
      <section className="profile-photo-section">
        <h2>👤 Perfil Profissional</h2>
        
        <div className="profile-images-container">
          {/* Foto de Perfil */}
          <div className="profile-image-item">
            <h3>Foto de Perfil</h3>
            <div className="profile-photo-container">
              <div className="profile-photo-preview">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Foto de perfil" />
                ) : (
                  <div className="no-photo">Sem foto</div>
                )}
              </div>
              <div className="profile-photo-actions">
                <label htmlFor="profile-photo-input" className="btn btn-primary">
                  {profilePhoto ? 'Trocar Foto' : 'Adicionar Foto'}
                </label>
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <p className="help-text">Esta foto aparecerá no site público</p>
              </div>
            </div>
          </div>

          {/* Logo da Empresa */}
          <div className="profile-image-item">
            <h3>Logo da Empresa</h3>
            <div className="profile-photo-container">
              <div className="profile-photo-preview logo-preview">
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo da empresa" />
                ) : (
                  <div className="no-photo">Sem logo</div>
                )}
              </div>
              <div className="profile-photo-actions">
                <label htmlFor="company-logo-input" className="btn btn-primary">
                  {companyLogo ? 'Trocar Logo' : 'Adicionar Logo'}
                </label>
                <input
                  id="company-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyLogoChange}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <p className="help-text">Esta logo aparecerá no site público</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfólio de Trabalhos */}
      <section className="portfolio-items-section">
        <div className="section-header">
          <h2>📸 Galeria de Serviços Realizados</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Adicionar Trabalho'}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="portfolio-form-container">
            <h3>{editingId ? 'Editar Trabalho' : 'Novo Trabalho'}</h3>
            <form onSubmit={handleSubmit} className="portfolio-form">
              <div className="form-group">
                <label>Título do Trabalho *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Instalação Elétrica Residencial"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Localização</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="Ex: Zona Sul, SP"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descrição do Trabalho *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreva o trabalho realizado..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Foto do Trabalho {!editingId && '*'}</label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                      >
                        ✕ Remover
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="image-input" className="upload-label">
                      <div className="upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span>Clique para adicionar foto</span>
                      </div>
                    </label>
                  )}
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success" disabled={uploading}>
                  {uploading ? 'Salvando...' : editingId ? 'Atualizar Trabalho' : 'Adicionar Trabalho'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Trabalhos */}
        <div className="portfolio-items-grid">
          {portfolioItems.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum trabalho adicionado ainda. Clique em "Adicionar Trabalho" para começar!</p>
            </div>
          ) : (
            portfolioItems.map(item => (
              <div key={item.id} className="portfolio-item-card">
                <div className="portfolio-item-image">
                  <img src={item.imageUrl} alt={item.title} />
                  <span className="portfolio-category-badge">{item.category}</span>
                </div>
                <div className="portfolio-item-content">
                  <h3>{item.title}</h3>
                  {item.location && <p className="location">📍 {item.location}</p>}
                  <p className="description">{item.description}</p>
                  <div className="portfolio-item-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(item)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

