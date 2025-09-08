# Deploy no Railway

## Configuração necessária

### 1. Variáveis de Ambiente no Railway

**IMPORTANTE**: O Railway já fornece automaticamente as variáveis do MySQL. Você só precisa adicionar:

```
NODE_ENV=production
PORT=3000
APP_KEY=your-secret-app-key-here
HOST=0.0.0.0
LOG_LEVEL=info
```

**Configuração do Banco de Dados:**

O sistema agora suporta **duas formas** de conexão:

1. **Via URL (Recomendado para Railway):**
   - Use a variável `MYSQL_URL` que o Railway fornece automaticamente
   - Formato: `mysql://user:password@host:port/database`

2. **Via variáveis individuais (Fallback):**
   - `MYSQLHOST` → `DB_HOST`
   - `MYSQLPORT` → `DB_PORT` 
   - `MYSQLUSER` → `DB_USER`
   - `MYSQLPASSWORD` → `DB_PASSWORD`
   - `MYSQLDATABASE` → `DB_DATABASE`

**A URL do Railway é automaticamente detectada e usada!**

### 2. Comandos de Build

O Railway executará automaticamente:
1. `npm install` - instala as dependências
2. `npm run build` - compila o TypeScript
3. `npm start` - inicia o servidor

### 3. Estrutura de Arquivos

- `Procfile` - define o comando de start
- `railway.json` - configurações específicas do Railway
- `package.json` - scripts e dependências

### 4. Troubleshooting

Se ainda houver erro `MODULE_NOT_FOUND`:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Certifique-se de que o banco de dados está acessível
3. Verifique os logs do Railway para mais detalhes

### 5. Health Check

A aplicação agora tem uma rota de health check em `/api` que retorna:
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Esta rota é usada pelo Railway para verificar se a aplicação está funcionando corretamente.
