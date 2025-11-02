import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, doc } from 'firebase/firestore';
import './PublicWebsite.css';

// Configuração do Firebase (mesma do admin)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function PublicWebsite() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    region: 'Centro',
    serviceType: 'Instalação',
    message: '',
    urgent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');

  const REGIONS = [
    'Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste',
    'Grande ABC', 'Guarulhos', 'Osasco', 'Santo Amaro', 'Itaquera'
  ];

  const SERVICES = [
    {
      icon: '💡',
      title: 'Instalação Elétrica',
      description: 'Instalação completa de sistemas elétricos residenciais e comerciais'
    },
    {
      icon: '🔧',
      title: 'Manutenção',
      description: 'Manutenção preventiva e corretiva de instalações elétricas'
    },
    {
      icon: '🚨',
      title: 'Emergência 24h',
      description: 'Atendimento emergencial para problemas elétricos urgentes'
    },
    {
      icon: '⚡',
      title: 'Retrofit',
      description: 'Modernização e adequação de instalações antigas'
    },
    {
      icon: '🏢',
      title: 'Automação',
      description: 'Sistemas inteligentes e automação residencial/comercial'
    },
    {
      icon: '📊',
      title: 'Laudos Técnicos',
      description: 'Laudos e inspeções técnicas para conformidade'
    }
  ];

  // Carregar portfólio do Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'portfolio'), snapshot => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPortfolioItems(items.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    return () => unsub();
  }, []);

  // Carregar foto de perfil e logo da empresa
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'profile'), docSnap => {
      if (docSnap.exists()) {
        setProfilePhoto(docSnap.data().photoURL || '');
        setCompanyLogo(docSnap.data().logoURL || '');
      }
    }, () => {
      // Ignora erro se documento não existe
    });
    return () => unsub();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('Por favor, preencha nome e telefone');
      return;
    }

    setIsSubmitting(true);
    setShowError(false);

    try {
      // Salva a solicitação na coleção "clients"
      await addDoc(collection(db, 'clients'), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || '',
        region: formData.region,
        level: formData.serviceType,
        notes: `Tipo de Serviço: ${formData.serviceType}\n\nMensagem: ${formData.message}`,
        urgent: formData.urgent,
        status: 'Pendente',
        createdAt: serverTimestamp(),
        activities: [],
        source: 'website' // Identifica que veio do site público
      });

      setShowSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        region: 'Centro',
        serviceType: 'Instalação',
        message: '',
        urgent: false
      });

      // Esconde a mensagem após 5 segundos
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="public-website">
      {/* HEADER / NAVEGAÇÃO */}
      <header className="header">
        <nav className="nav-container">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">ElétricaPro</span>
          </div>
          <ul className="nav-menu">
            <li><a onClick={() => scrollToSection('home')}>Início</a></li>
            <li><a onClick={() => scrollToSection('services')}>Serviços</a></li>
            <li><a onClick={() => scrollToSection('portfolio')}>Portfólio</a></li>
            <li><a onClick={() => scrollToSection('contact')}>Contato</a></li>
            <li><a href="/admin" className="admin-link">Área Admin</a></li>
          </ul>
        </nav>
      </header>

      {/* PROFILE CARD - REDE SOCIAL */}
      <section id="home" className="profile-card-section">
        <div className="profile-card">
          <div className="profile-cover">
            {companyLogo && (
              <div className="profile-logo-container">
                <img src={companyLogo} alt="Logo da empresa" className="profile-logo" />
              </div>
            )}
          </div>
          <div className="profile-info">
            <div className="profile-photo-wrapper">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Foto de perfil" className="profile-photo" />
              ) : (
                <div className="profile-photo-placeholder">👤</div>
              )}
            </div>
            <div className="profile-details">
              <h1 className="profile-name">ElétricaPro</h1>
              <p className="profile-title">Serviços Elétricos Profissionais</p>
              <p className="profile-location">📍 Atendimento em toda região de São Paulo</p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">✓</span>
                  <span className="stat-label">Certificado</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">✓</span>
                  <span className="stat-label">Garantia</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">✓</span>
                  <span className="stat-label">24h</span>
                </div>
              </div>
              <div className="profile-actions">
                <button 
                  className="btn-profile-primary" 
                  onClick={() => scrollToSection('contact')}
                >
                  Solicitar Orçamento
                </button>
                <a 
                  href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar um orçamento." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-profile-whatsapp"
                >
                  <span>💬</span>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="services" className="services-section">
        <div className="container">
          <h2 className="section-title">Nossos Serviços</h2>
          <p className="section-subtitle">
            Soluções completas em elétrica para residências, comércios e indústrias
          </p>
          <div className="services-grid">
            {SERVICES.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGIÕES ATENDIDAS */}
      <section className="regions-section">
        <div className="container">
          <h2 className="section-title">Regiões Atendidas</h2>
          <p className="section-subtitle">
            Atendemos toda a Grande São Paulo
          </p>
          <div className="regions-grid">
            {REGIONS.map((region, index) => (
              <div key={index} className="region-item">
                <span className="region-icon">📍</span>
                <span className="region-name">{region}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFÓLIO */}
      <section id="portfolio" className="portfolio-section">
        <div className="container">
          <h2 className="section-title">Nossos Trabalhos</h2>
          <p className="section-subtitle">
            Veja alguns dos nossos projetos realizados
          </p>
          <div className="portfolio-grid">
            {portfolioItems.length === 0 ? (
              <div className="portfolio-empty">
                <p>Em breve mais trabalhos realizados!</p>
              </div>
            ) : (
              portfolioItems.map((item) => (
                <div key={item.id} className="portfolio-card">
                  <div className="portfolio-image-container">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="portfolio-image-real" />
                    ) : (
                      <div className="portfolio-image-placeholder">📸</div>
                    )}
                    {item.category && (
                      <span className="portfolio-category">{item.category}</span>
                    )}
                  </div>
                  <div className="portfolio-info">
                    <h3 className="portfolio-title">{item.title}</h3>
                    {item.location && <p className="portfolio-location">📍 {item.location}</p>}
                    <p className="portfolio-description">{item.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* POR QUE ESCOLHER */}
      <section className="why-choose-section">
        <div className="container">
          <h2 className="section-title">Por Que Nos Escolher?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">👨‍🔧</div>
              <h3>Profissionais Qualificados</h3>
              <p>Equipe com certificação técnica e anos de experiência</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⭐</div>
              <h3>Qualidade Garantida</h3>
              <p>Garantia em todos os serviços realizados</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Atendimento Rápido</h3>
              <p>Resposta em até 2 horas para emergências</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Preço Justo</h3>
              <p>Orçamento transparente sem custos ocultos</p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO DE CONTATO */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title">Solicite Seu Orçamento</h2>
          <p className="section-subtitle">
            Preencha o formulário e entraremos em contato em breve
          </p>

          {showSuccess && (
            <div className="alert alert-success">
              ✅ Solicitação enviada com sucesso! Entraremos em contato em breve.
            </div>
          )}

          {showError && (
            <div className="alert alert-error">
              ❌ Erro ao enviar solicitação. Tente novamente ou entre em contato via WhatsApp.
            </div>
          )}

          <div className="contact-container">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nome Completo *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="region">Região</label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                  >
                    {REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="serviceType">Tipo de Serviço</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                >
                  <option value="Instalação">Instalação Elétrica</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Emergência">Emergência</option>
                  <option value="Retrofit">Retrofit</option>
                  <option value="Automação">Automação</option>
                  <option value="Laudo">Laudo Técnico</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Descreva o Serviço</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhadamente o que precisa..."
                  rows="5"
                ></textarea>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="urgent"
                    checked={formData.urgent}
                    onChange={handleInputChange}
                  />
                  <span>🚨 É urgente (atendimento prioritário)</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </form>

            <div className="contact-info">
              <div className="contact-card">
                <h3>📱 Contato Direto</h3>
                <p className="contact-item">
                  <strong>WhatsApp:</strong><br/>
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                    (11) 99999-9999
                  </a>
                </p>
                <p className="contact-item">
                  <strong>Telefone:</strong><br/>
                  (11) 3333-3333
                </p>
                <p className="contact-item">
                  <strong>E-mail:</strong><br/>
                  contato@eletricapro.com.br
                </p>
              </div>

              <div className="contact-card">
                <h3>🕐 Horário de Atendimento</h3>
                <p className="contact-item">
                  <strong>Segunda a Sexta:</strong><br/>
                  08:00 às 18:00
                </p>
                <p className="contact-item">
                  <strong>Sábado:</strong><br/>
                  08:00 às 13:00
                </p>
                <p className="contact-item">
                  <strong>Emergências:</strong><br/>
                  24 horas por dia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>⚡ ElétricaPro</h4>
              <p>Soluções elétricas profissionais para toda São Paulo</p>
            </div>
            <div className="footer-section">
              <h4>Navegação</h4>
              <ul>
                <li><a onClick={() => scrollToSection('home')}>Início</a></li>
                <li><a onClick={() => scrollToSection('services')}>Serviços</a></li>
                <li><a onClick={() => scrollToSection('portfolio')}>Portfólio</a></li>
                <li><a onClick={() => scrollToSection('contact')}>Contato</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contato</h4>
              <p>📱 (11) 99999-9999</p>
              <p>📞 (11) 3333-3333</p>
              <p>✉️ contato@eletricapro.com.br</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ElétricaPro - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>

      {/* BOTÃO FLUTUANTE WHATSAPP */}
      <a 
        href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar um orçamento." 
        target="_blank" 
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Fale conosco no WhatsApp"
      >
        <span className="whatsapp-float-icon">💬</span>
      </a>
    </div>
  );
}

