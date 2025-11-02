# 📋 Instruções de Configuração do Firebase

Este guia vai te ajudar a configurar o Firebase para o sistema de gestão de serviços elétricos.

## 🚀 Passo 1: Criar Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Digite um nome para o projeto (ex: "gestao-eletrica")
4. Siga os passos do assistente (pode desabilitar Google Analytics se quiser)
5. Aguarde a criação do projeto

## 🔐 Passo 2: Configurar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Vamos começar"**
3. Na aba **"Sign-in method"**, habilite **"Email/Password"**
4. Clique em **"Ativar"** e depois em **"Salvar"**

### Criar Usuário Admin

1. Na aba **"Users"**, clique em **"Adicionar usuário"**
2. Digite seu email e uma senha forte
3. Clique em **"Adicionar usuário"**

## 📦 Passo 3: Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Selecione **"Iniciar no modo de teste"** (para desenvolvimento)
4. Escolha a localização (recomendado: `southamerica-east1` - São Paulo)
5. Clique em **"Ativar"**

### ⚠️ Regras de Segurança (Desenvolvimento)

Para desenvolvimento, você pode usar estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 🔒 Regras de Segurança (Produção)

Para produção, use regras mais restritas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🖼️ Passo 4: Configurar Storage

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Vamos começar"**
3. Aceite as regras padrão de segurança
4. Escolha a mesma localização do Firestore
5. Clique em **"Concluído"**

### Regras de Segurança do Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /activities/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔑 Passo 5: Obter Credenciais

1. No menu lateral, clique no ícone de **engrenagem** ⚙️ ao lado de "Visão geral do projeto"
2. Clique em **"Configurações do projeto"**
3. Role até a seção **"Seus aplicativos"**
4. Clique no ícone **"</>"** (Web)
5. Digite um apelido para o app (ex: "app-web")
6. **NÃO** marque "Configurar o Firebase Hosting"
7. Clique em **"Registrar app"**
8. Copie as configurações que aparecem

## 📝 Passo 6: Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto `eletrica`
2. Preencha com as credenciais que você copiou:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. Salve o arquivo

## 📦 Passo 7: Instalar Dependências

Abra o terminal na pasta `eletrica` e execute:

```bash
npm install
```

## 🚀 Passo 8: Executar o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 🔐 Login

Use o email e senha que você criou no Firebase Authentication (Passo 2).

## ✅ Estrutura do Firestore

A aplicação criará automaticamente a seguinte estrutura:

```
clients (coleção)
├── documento_id_1
│   ├── name: string
│   ├── phone: string
│   ├── region: string
│   ├── level: string
│   ├── notes: string
│   ├── urgent: boolean
│   ├── status: string
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── activities: array
│       └── [
│           {
│             text: string,
│             imageUrl: string,
│             timestamp: string,
│             date: string
│           }
│         ]
└── documento_id_2
    └── ...
```

## 🎨 Funcionalidades

- ✅ Sistema de autenticação
- ✅ CRUD completo de clientes
- ✅ Filtros por região, status e urgência
- ✅ Busca por nome, telefone ou observações
- ✅ Histórico de atividades por cliente
- ✅ Upload de fotos das atividades
- ✅ Estatísticas em tempo real
- ✅ Interface moderna e responsiva

## 🐛 Solução de Problemas

### Erro: "Firebase: Error (auth/configuration-not-found)"
- Verifique se todas as variáveis de ambiente estão preenchidas corretamente no arquivo `.env`
- Certifique-se de que reiniciou o servidor após alterar o `.env`

### Erro: "Missing or insufficient permissions"
- Verifique as regras de segurança do Firestore
- Certifique-se de que o Authentication está habilitado

### Erro ao fazer upload de imagem
- Verifique as regras de segurança do Storage
- Confirme que o Storage está habilitado no projeto

## 📚 Recursos Adicionais

- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do React](https://react.dev)
- [Documentação do Vite](https://vitejs.dev)

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- Nunca compartilhe o arquivo `.env` publicamente
- Não faça commit do `.env` no Git
- Para produção, configure regras de segurança mais restritas
- Use variáveis de ambiente do servidor para deploy

## 📧 Suporte

Se tiver problemas, verifique:
1. Console do navegador (F12)
2. Terminal onde o servidor está rodando
3. Console do Firebase para erros

Boa sorte! 🚀

