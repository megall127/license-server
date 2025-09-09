# Como Testar a API

## 🚀 Testes Básicos

### 1. Health Check (Railway)
```
GET /api
```
**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Teste com Informações do Sistema
```
GET /api/test
```
**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "API test endpoint",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "port": "3000",
  "database": {
    "host": "license-server.railway.internal",
    "port": "3306",
    "user": "root",
    "database": "railway"
  }
}
```

## 🧪 Testes de Funcionalidade

### 3. Registro de Usuário
```
POST /api/register
Content-Type: application/json

{
  "name": "Teste User",
  "email": "teste@example.com",
  "password": "123456"
}
```

### 4. Login
```
POST /api/login
Content-Type: application/json

{
  "email": "teste@example.com",
  "password": "123456"
}
```

### 5. Listar Empresas
```
GET /api/get-all-company
```

### 6. Entrada de Dinheiro no Caixa (Venda) - ÚNICA FUNCIONALIDADE
```
POST /api/cash-flow/entry
Content-Type: application/json

{
  "productId": 1,
  "companyId": 1,
  "amount": 25.50,
  "quantity": 1,
  "description": "Venda de produto",
  "paymentMethod": "dinheiro",
  "customerName": "João Silva",
  "customerDocument": "123.456.789-00"
}
```

**Resposta esperada:**
```json
{
  "message": "Entrada de dinheiro registrada com sucesso",
  "transaction": {
    "id": 1,
    "transactionType": "entrada",
    "amount": 25.50,
    "quantity": 1,
    "status": "confirmado",
    "product": { "name": "Produto", "amount": 9 },
    "company": { "name": "Empresa" }
  },
  "newStock": 9
}
```

## 🛠️ Ferramentas para Testar

### Postman/Insomnia
1. Importe as rotas acima
2. Configure a URL base: `https://seu-app.railway.app`
3. Teste cada endpoint

### cURL
```bash
# Health check
curl https://seu-app.railway.app/api

# Teste do sistema
curl https://seu-app.railway.app/api/test

# Registro
curl -X POST https://seu-app.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@example.com","password":"123456"}'
```

### Browser
- Acesse diretamente: `https://seu-app.railway.app/api`
- Acesse: `https://seu-app.railway.app/api/test`

## 🔍 Verificações Importantes

1. **Status 200**: Todas as rotas devem retornar status 200
2. **JSON válido**: Respostas devem ser JSON válido
3. **Variáveis de ambiente**: `/api/test` deve mostrar as variáveis do Railway
4. **Banco de dados**: Se conectar, deve funcionar sem erros

## 🚨 Troubleshooting

### Se `/api` não funcionar:
- Verifique se o deploy foi bem-sucedido
- Confira os logs do Railway
- Verifique se a porta está correta

### Se `/api/test` mostrar "not set":
- As variáveis do Railway não estão sendo lidas
- Verifique se o MySQL está conectado no Railway

### Se registro/login falhar:
- Verifique se o banco de dados está funcionando
- Confira se as migrations foram executadas
