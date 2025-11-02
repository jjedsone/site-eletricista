# ⚡ Sistema Completo de Serviços Elétricos

Sistema profissional com **Site Público** para clientes + **Painel Administrativo** para gestão, desenvolvido com React e Firebase.

## 🎯 Duas Interfaces em Uma

### 🌍 **Site Público** - Para Seus Clientes
- Landing page profissional e moderna
- Formulário de solicitação de orçamento
- Galeria de serviços
- Informações de contato
- Botão flutuante do WhatsApp
- 100% responsivo

### 🔐 **Painel Administrativo** - Para Você
- Gerenciamento completo de clientes
- Dashboard com estatísticas em tempo real
- Histórico de atividades
- Upload de fotos
- Filtros avançados

## 🌟 Funcionalidades do Sistema

- 🔐 **Sistema de Autenticação** - Login seguro com Firebase Authentication
- 👥 **Gestão de Clientes** - CRUD completo com informações detalhadas
- 📍 **Filtros Avançados** - Por região, status, urgência e busca por texto
- 📊 **Dashboard com Estatísticas** - Visão geral em tempo real
- 📋 **Histórico de Atividades** - Registre cada serviço realizado
- 📸 **Upload de Fotos** - Documentação visual das atividades
- 🚨 **Marcação de Urgência** - Destaque para serviços prioritários
- 🎨 **Interface Moderna** - Design responsivo e intuitivo
- ☁️ **Sincronização em Tempo Real** - Dados sempre atualizados

## 🛠️ Tecnologias

- **React 19** - Framework JavaScript
- **Vite** - Build tool e dev server
- **Firebase** - Backend as a Service
  - Authentication (autenticação)
  - Firestore (banco de dados)
  - Storage (armazenamento de imagens)

## 📋 Pré-requisitos

- Node.js 16+ instalado
- Conta no Firebase (gratuita)
- Navegador moderno

## 🚀 Instalação Rápida

### 1. Instalar Dependências

```bash
cd eletrica
npm install
```

### 2. Configurar Firebase

Siga o guia completo em: **[INSTRUCOES_FIREBASE.md](./INSTRUCOES_FIREBASE.md)**

Resumo:
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Habilite Authentication (Email/Password)
3. Crie o Firestore Database
4. Habilite o Storage
5. Copie as credenciais

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `eletrica`:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Executar o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 🌐 Acessando as Interfaces

### Site Público (Clientes)
**URL:** http://localhost:5173/

O que seus clientes podem fazer:
- Ver os serviços oferecidos
- Solicitar orçamento (salva automaticamente no sistema)
- Ver portfólio de trabalhos
- Entrar em contato via WhatsApp

### Painel Admin (Você)
**URL:** http://localhost:5173/admin

**Primeiro Acesso:**
1. Crie um usuário no Firebase Console (Authentication > Users > Add user)
2. Acesse http://localhost:5173/admin
3. Faça login com o email e senha criados

### Navegação Entre Páginas
- Do site público → admin: Clique em "Área Admin" no menu
- Do admin → site público: Clique em "🏠 Site Público" no header

## 📱 Como Usar o Sistema

### Gerenciar Clientes (Painel Admin)

1. **Adicionar Cliente**: Preencha o formulário e clique em "Adicionar Cliente"
2. **Editar Cliente**: Clique no botão "Editar" no card do cliente
3. **Excluir Cliente**: Clique no botão "Excluir" (confirmação necessária)
4. **Ver Detalhes**: Clique em "Ver Detalhes" para expandir as informações

### Registrar Atividades

1. Clique em "Ver Detalhes" no cliente
2. Digite a descrição da atividade
3. Adicione uma foto (opcional)
4. Clique em "Adicionar Atividade"

### Filtrar Clientes

Use os filtros para encontrar rapidamente:
- 🔍 **Busca**: Por nome, telefone ou observações
- 📍 **Região**: Filtre por região de São Paulo
- 📊 **Status**: Pendente, Em Andamento, Concluído, Cancelado
- 🚨 **Urgentes**: Mostre apenas serviços urgentes

## 🌍 Regiões Disponíveis

- Centro
- Zona Norte
- Zona Sul
- Zona Leste
- Zona Oeste
- Grande ABC
- Guarulhos
- Osasco
- Santo Amaro
- Itaquera

## 📊 Status de Serviço

- **Pendente**: Aguardando início
- **Em Andamento**: Sendo executado
- **Concluído**: Finalizado com sucesso
- **Cancelado**: Serviço cancelado

## ⚡ Níveis de Serviço

- **Básico**: Instalações simples
- **Intermediário**: Reparos e manutenções
- **Avançado**: Projetos complexos
- **Emergência**: Atendimento urgente

## 🏗️ Estrutura do Projeto

```
eletrica/
├── src/
│   ├── ElectricalServiceApp.jsx   # Componente principal
│   ├── ElectricalServiceApp.css   # Estilos
│   ├── App.jsx                     # App wrapper
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Estilos globais
├── public/                         # Assets estáticos
├── .env                            # Variáveis de ambiente (criar)
├── .env.example                    # Exemplo de variáveis
├── package.json                    # Dependências
├── vite.config.js                  # Configuração do Vite
├── INSTRUCOES_FIREBASE.md          # Guia de configuração
└── README.md                       # Este arquivo
```

## 🔒 Segurança

- ✅ Arquivo `.env` está no `.gitignore`
- ✅ Autenticação obrigatória para todas as operações
- ✅ Regras de segurança configuráveis no Firebase
- ⚠️ Configure regras mais restritas para produção

## 📝 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Cria build de produção
npm run preview  # Preview do build de produção
npm run lint     # Executa linter
```

## 🐛 Solução de Problemas

### App não carrega / tela branca
- Verifique o console do navegador (F12)
- Confirme que o `.env` está configurado
- Reinicie o servidor após alterar `.env`

### Erro de autenticação
- Verifique se o Authentication está habilitado no Firebase
- Confirme que o email/senha estão corretos
- Verifique as credenciais no `.env`

### Erro ao salvar dados
- Verifique as regras do Firestore
- Confirme que está autenticado
- Veja o console do Firebase para erros

### Erro ao fazer upload de imagem
- Verifique as regras do Storage
- Confirme que o Storage está habilitado
- Verifique o tamanho do arquivo

## 🎨 Personalizando o Site Público

### Informações Básicas
Edite `src/PublicWebsite.jsx`:
- **Nome da empresa:** Linha 53
- **Telefones:** Linhas 84, 588-602, 654
- **Email:** Linha 597
- **Regiões atendidas:** Linhas 28-32
- **Serviços:** Linhas 34-55

### WhatsApp
Troque o número em 3 lugares (formato: `5511999999999`):
1. Botão Hero (linha 84)
2. Botão flutuante (linha 654)
3. Seção de contato (linha 588)

### Cores e Estilos
Edite `src/PublicWebsite.css` (linhas 2-10):
```css
--primary: #2563eb;    /* Cor principal */
--secondary: #10b981;   /* Cor secundária */
```

### Adicionar Fotos Reais
1. Coloque imagens em `public/portfolio/`
2. Edite linha 50-65 de `PublicWebsite.jsx`

📖 **Guia completo:** Veja `SITE_PUBLICO.md` para instruções detalhadas

## 📚 Recursos

- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do React](https://react.dev)
- [Documentação do Vite](https://vitejs.dev)
- [Guia do Site Público](./SITE_PUBLICO.md) - Personalização completa

## 🚀 Deploy

### Opções de Deploy

1. **Firebase Hosting** (Recomendado)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

2. **Vercel**
```bash
npm install -g vercel
vercel
```

3. **Netlify**
```bash
npm install -g netlify-cli
netlify deploy
```

## 📄 Licença

Projeto de uso livre para fins educacionais e comerciais.

## 👨‍💻 Desenvolvimento

Desenvolvido com ❤️ usando React e Firebase

---

**Dúvidas?** Consulte o arquivo [INSTRUCOES_FIREBASE.md](./INSTRUCOES_FIREBASE.md) para instruções detalhadas de configuração.
