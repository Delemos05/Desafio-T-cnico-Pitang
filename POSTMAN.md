# 📮 Postman Collection - Pitang Reimbursement API

## 🚀 Como Importar a Coleção

1. **Abra o Postman**
2. **Importe o arquivo JSON**:
   - Clique em "Import" → "File" → "Upload Files"
   - Selecione o arquivo `postman_collection.json`
   - Escolha "Collection" e clique em "Import"

3. **Configure as variáveis**:
   - A collection já tem as variáveis pré-configuradas
   - `baseUrl`: http://localhost:3333 (ajuste se necessário)

## 🔐 Autenticação Automática

A coleção usa **Bearer Token** automaticamente. O fluxo é:

1. **Faça Login** → Salva automaticamente `accessToken` e `refreshToken`
2. **Demais requests** → Usa o token automaticamente
3. **Refresh Token** → Atualiza automaticamente quando expirar
4. **Logout** → Limpa todas as variáveis

## 👥 Credenciais para Teste

| Role | Email | Senha | Permissões |
|------|-------|-------|------------|
| **ADMIN** | `admin@email.com` | `123456` | Gerenciar categorias, usuários |
| **MANAGER** | `manager@email.com` | `123456` | Aprovar/rejeitar solicitações |
| **FINANCE** | `finance@email.com` | `123456` | Pagar solicitações aprovadas |
| **EMPLOYEE** | `employee@email.com` | `123456` | Criar/editar próprias solicitações |

## 📋 Estrutura da Coleção

### 🔐 Autenticação
- **Login** - Entrar no sistema
- **Refresh Token** - Atualizar token expirado  
- **Logout** - Sair do sistema
- **Get Profile** - Dados do usuário logado
- **Create User** - Criar usuário (ADMIN only)

### 📋 Solicitações
- **List** - Listar com paginação e filtros
- **Create** - Criar nova solicitação
- **Get by ID** - Detalhes da solicitação
- **Update** - Editar (apenas DRAFT)
- **Submit** - Enviar para aprovação
- **Approve** - Aprovar (MANAGER)
- **Reject** - Rejeitar (MANAGER)  
- **Pay** - Pagar (FINANCE)
- **Cancel** - Cancelar
- **History** - Histórico completo

### 🏷️ Categorias
- **List** - Todas as categorias ativas
- **Create** - Criar categoria (ADMIN)
- **Get by ID** - Detalhes
- **Update** - Atualizar (ADMIN)
- **Delete** - Desativar (ADMIN)

### 🧪 Testes de Workflow
- **Workflow Completo** - Teste integrado: Criar → Enviar → Aprovar → Pagar

## 🎯 Exemplos de Uso

### 1. Fluxo Básico (Employee)
1. **Login** com `employee@email.com`
2. **List Categories** → Copie o ID de uma categoria
3. **Create Solicitation** → Use o ID da categoria
4. **Submit Solicitation** → Envia para aprovação

### 2. Fluxo de Aprovação (Manager)
1. **Login** com `manager@email.com`
2. **List Solicitations** → Filtre por `status=SUBMITTED`
3. **Approve** ou **Reject** → Use o ID da solicitação

### 3. Fluxo de Pagamento (Finance)
1. **Login** com `finance@email.com`
2. **List Solicitations** → Filtre por `status=APPROVED`
3. **Pay** → Confirma o pagamento

### 4. Gestão de Categorias (Admin)
1. **Login** com `admin@email.com`
2. **Create Category** → Adicione novas categorias
3. **List Categories** → Verifique as criadas

## 🔍 Filtros Úteis

### List Solicitations
```
?status=SUBMITTED&limit=5&sortBy=createdAt&sortOrder=desc
?categoryId={{categoryId}}&userId={{userId}}
?search=transporte&limit=10
```

### Parâmetros de Paginação
- `page`: Número da página (default: 1)
- `limit`: Itens por página (default: 50)
- `sortBy`: createdAt, amount, title
- `sortOrder`: asc, desc

## 🐛 Troubleshooting

### Erro 401 - Não Autorizado
- **Causa**: Token expirou ou inválido
- **Solução**: Execute o **Login** novamente

### Erro 403 - Proibido  
- **Causa**: Role insuficiente para a operação
- **Solução**: Use usuário com permissão adequada

### Erro 404 - Não Encontrado
- **Causa**: ID inválido ou recurso não existe
- **Solução**: Verifique se as variáveis `{{solicitationId}}` e `{{categoryId}}` estão preenchidas

### Erro 400 - Bad Request
- **Causa**: Dados inválidos no body
- **Solução**: Verifique o JSON enviado

## 📱 Testes Automáticos

A coleção inclui **scripts de teste** que:

✅ **Salvam variáveis automaticamente**:
- `accessToken` e `refreshToken` no login
- `solicitationId` na primeira solicitação criada
- `categoryId` na primeira categoria listada

✅ **Exibem logs detalhados** no console:
- Status de cada request
- Erros com mensagens claras
- Progresso do workflow

✅ **Validam respostas**:
- Status codes 2xx = ✅ Sucesso
- Status codes 4xx/5xx = ❌ Erro

## 🎓 Dicas Avançadas

1. **Teste com diferentes roles** para validar RBAC
2. **Use o Postman Runner** para executar workflows completos
3. **Monitore o console** para ver os logs detalhados
4. **Salve ambientes** diferentes (dev, staging, prod)
5. **Use os testes automatizados** para validação

---

**Pronto!** Agora você pode testar toda a API facilmente pelo Postman! 🚀
