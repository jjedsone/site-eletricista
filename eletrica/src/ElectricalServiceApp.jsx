import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PortfolioManager from './PortfolioManager';
import './ElectricalServiceApp.css';

// --------------------------
// CONFIGURAÇÃO DO FIREBASE
// --------------------------
// Instruções de configuração:
// 1. Crie um projeto no Firebase Console (https://console.firebase.google.com)
// 2. Habilite Authentication -> Email/Password
// 3. Crie o Firestore Database (modo de teste inicialmente)
// 4. Habilite o Storage para upload de imagens
// 5. Preencha as variáveis no arquivo .env

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default function ElectricalServiceApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    region: 'Centro', 
    level: 'Básico', 
    notes: '',
    urgent: false,
    status: 'Pendente'
  });
  
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [activityFile, setActivityFile] = useState(null);
  const [activityText, setActivityText] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [currentTab, setCurrentTab] = useState('clients'); // 'clients' ou 'portfolio'

  const SAO_PAULO_REGIONS = [
    'Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste',
    'Grande ABC', 'Guarulhos', 'Osasco', 'Santo Amaro', 'Itaquera'
  ];

  const SERVICE_LEVELS = ['Básico', 'Intermediário', 'Avançado', 'Emergência'];
  const STATUS_OPTIONS = ['Pendente', 'Em Andamento', 'Concluído', 'Cancelado'];

  // Monitor autenticação
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Monitor Firestore (coleção clients)
  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, 
      snapshot => {
        const data = snapshot.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || new Date()
        }));
        setClients(data);
      }, 
      err => {
        console.error('Erro ao carregar clientes:', err);
        alert('Erro ao carregar clientes do Firestore');
      }
    );
    return () => unsub();
  }, [user]);

  // --- AUTENTICAÇÃO ---
  async function doLogin(e) {
    e?.preventDefault();
    setLoginError('');
    
    if (!email || !password) {
      setLoginError('Preencha email e senha');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginError('Erro ao fazer login. Verifique suas credenciais.');
    }
  }

  async function doLogout() {
    try {
      await signOut(auth);
      setClients([]);
      setForm({ name: '', phone: '', region: 'Centro', level: 'Básico', notes: '', urgent: false, status: 'Pendente' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // --- RECUPERAÇÃO DE SENHA ---
  async function handleResetPassword(e) {
    e?.preventDefault();
    setResetError('');
    setResetMessage('');
    
    if (!resetEmail) {
      setResetError('Digite seu email');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setResetEmail('');
      setTimeout(() => {
        setShowResetPassword(false);
        setResetMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      if (error.code === 'auth/user-not-found') {
        setResetError('Este email não está cadastrado no sistema.');
      } else if (error.code === 'auth/invalid-email') {
        setResetError('Email inválido. Verifique o formato.');
      } else {
        setResetError('Erro ao enviar email. Tente novamente mais tarde.');
      }
    }
  }

  // --- CRUD CLIENTES ---
  async function handleAddOrUpdate(e) {
    e.preventDefault();
    
    if (!form.name || !form.phone) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    try {
      if (editingId) {
        // Atualizar
        await updateDoc(doc(db, 'clients', editingId), {
          ...form,
          updatedAt: serverTimestamp()
        });
        setEditingId(null);
      } else {
        // Adicionar novo
        await addDoc(collection(db, 'clients'), {
          ...form,
          createdAt: serverTimestamp(),
          activities: []
        });
      }
      
      setForm({ name: '', phone: '', region: 'Centro', level: 'Básico', notes: '', urgent: false, status: 'Pendente' });
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    }
  }

  function handleEdit(client) {
    setEditingId(client.id);
    setForm({
      name: client.name,
      phone: client.phone,
      region: client.region,
      level: client.level,
      notes: client.notes || '',
      urgent: client.urgent || false,
      status: client.status || 'Pendente'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ name: '', phone: '', region: 'Centro', level: 'Básico', notes: '', urgent: false, status: 'Pendente' });
  }

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente');
    }
  }

  // --- ATIVIDADES ---
  async function handleAddActivity(clientId) {
    if (!activityText && !activityFile) {
      alert('Adicione um texto ou arquivo');
      return;
    }

    try {
      let imageUrl = null;
      
      if (activityFile) {
        const storageRef = ref(storage, `activities/${clientId}/${Date.now()}_${activityFile.name}`);
        await uploadBytes(storageRef, activityFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const client = clients.find(c => c.id === clientId);
      const activities = client.activities || [];
      
      activities.push({
        text: activityText,
        imageUrl,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('pt-BR')
      });

      await updateDoc(doc(db, 'clients', clientId), {
        activities,
        updatedAt: serverTimestamp()
      });

      setActivityText('');
      setActivityFile(null);
      alert('Atividade adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      alert('Erro ao adicionar atividade');
    }
  }

  // --- FILTROS ---
  const filteredClients = clients.filter(c => {
    const matchSearch = !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()));
    
    const matchRegion = filterRegion === 'Todas' || c.region === filterRegion;
    const matchStatus = filterStatus === 'Todos' || c.status === filterStatus;
    const matchUrgent = !urgentOnly || c.urgent;
    
    return matchSearch && matchRegion && matchStatus && matchUrgent;
  });

  // --- ESTATÍSTICAS ---
  const stats = {
    total: clients.length,
    pending: clients.filter(c => c.status === 'Pendente').length,
    inProgress: clients.filter(c => c.status === 'Em Andamento').length,
    completed: clients.filter(c => c.status === 'Concluído').length,
    urgent: clients.filter(c => c.urgent).length
  };

  // --- RENDERIZAÇÃO ---
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>⚡ Sistema de Gestão Elétrica</h1>
            <p>Faça login para acessar o painel administrativo</p>
          </div>
          
          <form onSubmit={doLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            {loginError && <div className="error-message">{loginError}</div>}
            
            <button type="submit" className="btn btn-primary btn-block">
              Entrar
            </button>
          </form>

          {!showResetPassword ? (
            <div className="login-footer">
              <button 
                type="button" 
                onClick={() => setShowResetPassword(true)}
                className="link-button"
              >
                Esqueci minha senha
              </button>
              <p>⚠️ Primeiro acesso? Crie um usuário no Firebase Authentication</p>
            </div>
          ) : (
            <div className="reset-password-form">
              <h3>Recuperar Senha</h3>
              <p className="reset-instructions">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>
              
              <form onSubmit={handleResetPassword} className="login-form">
                <div className="form-group">
                  <label htmlFor="resetEmail">Email</label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                {resetError && <div className="error-message">{resetError}</div>}
                {resetMessage && <div className="success-message">{resetMessage}</div>}
                
                <div className="reset-actions">
                  <button type="submit" className="btn btn-primary btn-block">
                    Enviar Email de Recuperação
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetEmail('');
                      setResetError('');
                      setResetMessage('');
                    }}
                    className="btn btn-secondary btn-block"
                  >
                    Voltar ao Login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-content">
          <h1>⚡ Gestão de Serviços Elétricos</h1>
          <div className="header-actions">
            <a href="/" className="btn btn-info" style={{ textDecoration: 'none' }}>
              🏠 Site Público
            </a>
            <span className="user-info">👤 {user.email}</span>
            <button onClick={doLogout} className="btn btn-secondary">
              Sair
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${currentTab === 'clients' ? 'active' : ''}`}
            onClick={() => setCurrentTab('clients')}
          >
            👥 Gerenciar Clientes
          </button>
          <button
            className={`tab-btn ${currentTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setCurrentTab('portfolio')}
          >
            📸 Gerenciar Portfólio
          </button>
        </div>
      </header>

      {/* CONTEÚDO BASEADO NA ABA */}
      {currentTab === 'portfolio' ? (
        <PortfolioManager firebaseApp={app} />
      ) : (
        <>
      {/* ESTATÍSTICAS */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total de Clientes</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pendentes</div>
          </div>
        </div>
        
        <div className="stat-card progress">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">Em Andamento</div>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Concluídos</div>
          </div>
        </div>
        
        <div className="stat-card urgent">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats.urgent}</div>
            <div className="stat-label">Urgentes</div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section className="form-section">
        <h2>{editingId ? '✏️ Editar Cliente' : '➕ Adicionar Novo Cliente'}</h2>
        <form onSubmit={handleAddOrUpdate} className="client-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nome *</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Telefone *</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="region">Região</label>
              <select
                id="region"
                value={form.region}
                onChange={e => setForm({ ...form, region: e.target.value })}
              >
                {SAO_PAULO_REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="level">Nível de Serviço</label>
              <select
                id="level"
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
              >
                {SERVICE_LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Detalhes do serviço, endereço, etc."
              rows="3"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={form.urgent}
                onChange={e => setForm({ ...form, urgent: e.target.checked })}
              />
              <span>🚨 Marcar como urgente</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Atualizar Cliente' : 'Adicionar Cliente'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </section>

      {/* FILTROS */}
      <section className="filters-section">
        <h2>🔍 Filtros</h2>
        <div className="filters-container">
          <div className="form-group">
            <label htmlFor="search">Buscar</label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nome, telefone ou observações..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="filterRegion">Região</label>
            <select
              id="filterRegion"
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {SAO_PAULO_REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="filterStatus">Status</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="Todos">Todos</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={urgentOnly}
                onChange={e => setUrgentOnly(e.target.checked)}
              />
              <span>Apenas urgentes</span>
            </label>
          </div>
        </div>
        
        <div className="filter-info">
          Mostrando {filteredClients.length} de {clients.length} clientes
        </div>
      </section>

      {/* LISTA DE CLIENTES */}
      <section className="clients-section">
        <h2>👥 Clientes ({filteredClients.length})</h2>
        
        {filteredClients.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="clients-grid">
            {filteredClients.map(client => (
              <div key={client.id} className={`client-card ${client.urgent ? 'urgent' : ''}`}>
                <div className="client-header">
                  <h3>{client.name}</h3>
                  {client.urgent && <span className="badge urgent-badge">🚨 Urgente</span>}
                  <span className={`badge status-badge status-${client.status?.toLowerCase().replace(' ', '-')}`}>
                    {client.status || 'Pendente'}
                  </span>
                </div>

                <div className="client-info">
                  <div className="info-row">
                    <span className="info-label">📱 Telefone:</span>
                    <span className="info-value">{client.phone}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">📍 Região:</span>
                    <span className="info-value">{client.region}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">⚡ Nível:</span>
                    <span className="info-value">{client.level}</span>
                  </div>
                  
                  {client.notes && (
                    <div className="info-row notes">
                      <span className="info-label">📝 Obs:</span>
                      <span className="info-value">{client.notes}</span>
                    </div>
                  )}
                  
                  <div className="info-row">
                    <span className="info-label">📅 Criado:</span>
                    <span className="info-value">
                      {client.createdAt instanceof Date 
                        ? client.createdAt.toLocaleDateString('pt-BR')
                        : 'Data indisponível'}
                    </span>
                  </div>
                </div>

                {client.activities && client.activities.length > 0 && (
                  <div className="activities-summary">
                    <strong>📋 Atividades: {client.activities.length}</strong>
                  </div>
                )}

                <div className="client-actions">
                  <button
                    onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                    className="btn btn-info btn-sm"
                  >
                    {selectedClient?.id === client.id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                  </button>
                  <button onClick={() => handleEdit(client)} className="btn btn-primary btn-sm">
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="btn btn-danger btn-sm">
                    🗑️ Excluir
                  </button>
                </div>

                {/* DETALHES E ATIVIDADES */}
                {selectedClient?.id === client.id && (
                  <div className="client-details">
                    <h4>Adicionar Atividade</h4>
                    <div className="activity-form">
                      <textarea
                        value={activityText}
                        onChange={e => setActivityText(e.target.value)}
                        placeholder="Descreva a atividade realizada..."
                        rows="3"
                      />
                      
                      <div className="file-input-group">
                        <label htmlFor={`file-${client.id}`} className="file-label">
                          📎 {activityFile ? activityFile.name : 'Adicionar foto (opcional)'}
                        </label>
                        <input
                          id={`file-${client.id}`}
                          type="file"
                          accept="image/*"
                          onChange={e => setActivityFile(e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                      </div>
                      
                      <button
                        onClick={() => handleAddActivity(client.id)}
                        className="btn btn-success btn-sm"
                      >
                        ➕ Adicionar Atividade
                      </button>
                    </div>

                    {client.activities && client.activities.length > 0 && (
                      <div className="activities-list">
                        <h4>📋 Histórico de Atividades</h4>
                        {client.activities.map((act, idx) => (
                          <div key={idx} className="activity-item">
                            <div className="activity-date">{act.date}</div>
                            {act.text && <p className="activity-text">{act.text}</p>}
                            {act.imageUrl && (
                              <img 
                                src={act.imageUrl} 
                                alt="Atividade" 
                                className="activity-image"
                                onClick={() => window.open(act.imageUrl, '_blank')}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
        </>
      )}
    </div>
  );
}

