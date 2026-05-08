# Sistema de Reembolso

Sistema completo de gerenciamento de reembolsos com máquina de estados, RBAC e auditoria completa.

## 🧠 Visão Global

- **Máquina de Estados**: Fluxo controlado (DRAFT → SUBMITTED → APPROVED → PAID/REJECTED)
- **RBAC**: Controle de acesso por perfil (EMPLOYEE, MANAGER, FINANCE, ADMIN)
- **Auditoria**: Histórico obrigatório em todas as ações
- **Validação**: Zod + regras de negócio rigorosas
- **API REST**: Consistente com status HTTP adequados

## 🏗️ Estrutura do Projeto

```
pitang/
├── backend/          # API Node.js + Express + TypeScript
├── frontend/         # React + TypeScript
└── README.md         # Este arquivo
```

## 🔽 Instalação

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## � Docker

### Iniciar com Docker Compose (Produção)
```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Desenvolvimento com Docker
```bash
# Apenas banco de dados
docker-compose -f docker-compose.dev.yml up -d

# Rodar backend localmente
cd backend && npm run dev

# Rodar frontend localmente
cd frontend && npm start
```

### Comandos úteis
```bash
# Rebuildar imagens
docker-compose up -d --build

# Resetar banco
docker-compose down -v
docker-compose up -d

# Acessar container
docker exec -it pitang-backend sh
docker exec -it pitang-db psql -U pitang -d reimbursement
```

## �🔐 Credenciais Padrão

- **ADMIN**: admin@email.com / 123456
- **MANAGER**: manager@email.com / 123456
- **FINANCE**: finance@email.com / 123456
- **EMPLOYEE**: employee@email.com / 123456

## 📋 Fluxo de Estados

```
DRAFT → SUBMITTED → APPROVED → PAID
      → REJECTED
DRAFT → CANCELED
```

## 👥 Roles e Permissões

| Role | Permissões |
|------|------------|
| EMPLOYEE | Criar, editar (DRAFT), enviar solicitações |
| MANAGER | Aprovar/rejeitar solicitações |
| FINANCE | Pagar solicitações aprovadas |
| ADMIN | Gerenciar categorias |

## 🌐 API Endpoints

### Autenticação
- `POST /auth/login` - Login
- `POST /users` - Criar usuário

### Categorias
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria (ADMIN)
- `PUT /categories/:id` - Atualizar categoria (ADMIN)

### Solicitações de Reembolso
- `GET /solicitations` - Listar solicitações
- `POST /solicitations` - Criar solicitação
- `PUT /solicitations/:id` - Editar solicitação (DRAFT)
- `POST /solicitations/:id/submit` - Enviar solicitação
- `POST /solicitations/:id/approve` - Aprovar (MANAGER)
- `POST /solicitations/:id/reject` - Rejeitar (MANAGER)
- `POST /solicitations/:id/pay` - Pagar (FINANCE)
- `GET /solicitations/:id/history` - Histórico

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📋 Checklist de Implementação

- [x] Login funciona
- [x] JWT protege rotas
- [x] CRUD funcionando
- [x] Estados corretos
- [x] Histórico em todas ações
- [x] RBAC funcionando
- [x] Validações completas
- [x] Status HTTP corretos
- [x] Frontend funcional
- [x] Erros visíveis
- [x] Loop de carregamento resolvido
- [x] Autenticação persistente
- [x] Paginação implementada
- [x] Filtros funcionando
