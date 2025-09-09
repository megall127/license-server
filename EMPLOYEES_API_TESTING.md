# Testando API de Funcionários

## Endpoints Disponíveis

### 1. Listar todos os funcionários
```bash
GET /api/employees
```

### 2. Listar funcionários de uma empresa específica
```bash
GET /api/employees/company/{companyId}
```

### 3. Buscar funcionário por ID
```bash
GET /api/employees/{id}
```

### 4. Criar novo funcionário
```bash
POST /api/employees
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao.silva@empresa.com",
  "phone": "(11) 99999-9999",
  "position": "Vendedor",
  "companyId": 1,
  "salary": 2500.00,
  "hireDate": "2024-01-15",
  "status": "ativo"
}
```

### 5. Atualizar funcionário
```bash
PUT /api/employees/{id}
Content-Type: application/json

{
  "name": "João Silva Santos",
  "email": "joao.santos@empresa.com",
  "phone": "(11) 88888-8888",
  "position": "Gerente de Vendas",
  "companyId": 1,
  "salary": 3500.00,
  "hireDate": "2024-01-15",
  "status": "ativo"
}
```

### 6. Excluir funcionário
```bash
DELETE /api/employees/{id}
```

## Exemplos de Teste com cURL

### Criar funcionário
```bash
curl -X POST http://localhost:3333/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria.santos@empresa.com",
    "phone": "(11) 77777-7777",
    "position": "Assistente Administrativo",
    "companyId": 1,
    "salary": 2000.00,
    "hireDate": "2024-02-01",
    "status": "ativo"
  }'
```

### Listar todos os funcionários
```bash
curl -X GET http://localhost:3333/api/employees
```

### Listar funcionários de uma empresa
```bash
curl -X GET http://localhost:3333/api/employees/company/1
```

### Buscar funcionário específico
```bash
curl -X GET http://localhost:3333/api/employees/1
```

### Atualizar funcionário
```bash
curl -X PUT http://localhost:3333/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos Silva",
    "salary": 2200.00,
    "position": "Coordenadora Administrativa"
  }'
```

### Excluir funcionário
```bash
curl -X DELETE http://localhost:3333/api/employees/1
```

## Respostas da API

### Sucesso (200/201)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao.silva@empresa.com",
    "phone": "(11) 99999-9999",
    "position": "Vendedor",
    "companyId": 1,
    "salary": 2500.00,
    "hireDate": "2024-01-15",
    "status": "ativo",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "company": {
      "id": 1,
      "name": "Empresa Exemplo",
      "email": "contato@empresa.com",
      "phone": "(11) 3333-3333",
      "address": "Rua Exemplo, 123",
      "location": "São Paulo, SP",
      "employees": "10",
      "dayValue": 0,
      "monthValue": 0,
      "anualValue": 0,
      "leaveValue": 0,
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Funcionário criado com sucesso"
}
```

### Erro (400/404)
```json
{
  "success": false,
  "message": "Empresa não encontrada"
}
```

## Validações

- **name**: Obrigatório, string
- **email**: Obrigatório, string, único
- **phone**: Opcional, string
- **position**: Obrigatório, string
- **companyId**: Obrigatório, deve existir na tabela companies
- **salary**: Opcional, número decimal
- **hireDate**: Opcional, data no formato YYYY-MM-DD
- **status**: Opcional, enum ('ativo' ou 'inativo'), padrão 'ativo'

## Relacionamentos

- Cada funcionário pertence a uma empresa (companyId)
- A empresa é carregada automaticamente nas consultas (preload)
- Exclusão em cascata: se uma empresa for excluída, seus funcionários também serão
