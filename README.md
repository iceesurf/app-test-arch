# 🚀 Plataforma de Automação WhatsApp

Uma plataforma SaaS completa para automação de WhatsApp com editor visual de fluxos, inbox humano e sistema white-label.

## ✨ Funcionalidades

### 🤖 Editor de Fluxos Visual
- Editor drag & drop com React Flow
- Biblioteca completa de nós (gatilhos, ações, lógica)
- Configuração dinâmica de nós
- Auto-layout com Dagre
- Validação visual de configurações

### 💬 Inbox Humano
- Interface de chat em tempo real
- Visualização de conversas ativas
- Transferência bot → humano
- Histórico completo de mensagens

### 📊 Gestão de Leads
- Captura automática de leads
- Qualificação inteligente
- Importação em lote
- Métricas e relatórios

### 📈 Campanhas Publicitárias
- Múltiplas plataformas
- Métricas em tempo real
- Agendamento inteligente
- Rate limiting e segurança

### 🎨 Sistema White-Label
- Branding personalizado
- Configurações por tenant
- Integrações próprias
- Multi-tenant completo

## 🏗️ Arquitetura

### Backend
- **Firebase Cloud Functions** (arquitetura de função única)
- **Firestore** para banco de dados
- **Express.js** para API REST
- **Winston** para logging estruturado
- **Rate Limiting** para segurança

### Frontend
- **React** com Vite
- **React Flow** para editor visual
- **Firebase SDK** para autenticação
- **CSS Variables** para theming
- **Responsive Design** completo

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Firebase CLI
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/iceesurf/app-test-arch.git
cd app-test-arch
```

### 2. Instale as dependências
```bash
# Backend
cd functions
npm install

# Frontend
cd ../apps/web
npm install
```

### 3. Configure as variáveis de ambiente

#### Frontend (`apps/web/.env`)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_API_BASE_URL=http://localhost:5173/api
```

#### Backend (`functions/.env`)
```env
FIREBASE_PROJECT_ID=your-project-id
META_WHATSAPP_TOKEN=your-meta-token
META_PHONE_NUMBER_ID=your-phone-id
META_VERIFY_TOKEN=your-verify-token
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
JWT_SECRET=your-super-secret-jwt-key
```

### 4. Configure o Firebase
```bash
firebase login
firebase use your-project-id
```

### 5. Execute em desenvolvimento
```bash
# Terminal 1 - Emuladores Firebase
npm run emulators

# Terminal 2 - Frontend
cd apps/web
npm run dev

# Terminal 3 - Backend (opcional para desenvolvimento)
cd functions
npm run serve
```

## 🧪 Testes

### Backend
```bash
cd functions
npm test
npm run test:coverage
```

### Frontend
```bash
cd apps/web
npm test
npm run build
```

## 📦 Deploy

### Desenvolvimento
```bash
firebase deploy --only functions
firebase deploy --only hosting
```

### Produção
```bash
# Configure as variáveis de ambiente de produção
firebase deploy
```

## 🔧 Scripts Disponíveis

### Root
- `npm run emulators` - Inicia emuladores Firebase
- `npm run deploy` - Deploy para produção

### Frontend (`apps/web/`)
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run test` - Executa testes

### Backend (`functions/`)
- `npm run serve` - Servidor local
- `npm run deploy` - Deploy das functions
- `npm run test` - Executa testes
- `npm run test:coverage` - Testes com cobertura

## 🏛️ Estrutura do Projeto

```
app-arch-main/
├── apps/
│   └── web/                    # Frontend React
│       ├── src/
│       │   ├── pages/          # Páginas da aplicação
│       │   ├── flows/          # Editor de fluxos
│       │   ├── components/     # Componentes reutilizáveis
│       │   └── services/       # Serviços e APIs
│       └── public/             # Assets estáticos
├── functions/                  # Backend Firebase Functions
│   ├── src/
│   │   ├── routes/            # Rotas da API
│   │   ├── utils/             # Utilitários
│   │   └── [modules]/         # Módulos de negócio
│   └── __tests__/             # Testes automatizados
├── .github/
│   └── workflows/             # CI/CD Pipeline
└── firebase.json              # Configuração Firebase
```

## 🔒 Segurança

- **Rate Limiting**: Proteção contra abuso da API
- **Logging Estruturado**: Monitoramento completo
- **Autenticação Firebase**: Segurança robusta
- **Validação de Entrada**: Prevenção de ataques
- **Auditoria de Segurança**: npm audit integrado

## 📊 Monitoramento

- **Logs Estruturados**: Winston com formato JSON
- **Métricas de Performance**: Tempo de resposta das APIs
- **Tratamento de Erros**: Middleware centralizado
- **Health Checks**: Endpoints de monitoramento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/iceesurf/app-test-arch/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/iceesurf/app-test-arch/wiki)
- **Email**: suporte@seudominio.com

## 🚀 Status do Projeto

- ✅ **Backend**: 100% funcional
- ✅ **Frontend**: 100% funcional
- ✅ **Testes**: Suite completa
- ✅ **CI/CD**: Pipeline configurado
- ✅ **Segurança**: Rate limiting e logging
- ✅ **Documentação**: Completa

**Sistema pronto para produção!** 🎯



