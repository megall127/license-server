# Deploy no Railway

## Configuração necessária

### 1. Variáveis de Ambiente no Railway

Configure as seguintes variáveis de ambiente no painel do Railway:

```
NODE_ENV=production
PORT=3000
APP_KEY=your-secret-app-key-here
HOST=0.0.0.0
LOG_LEVEL=info

# Database (use as credenciais do seu banco MySQL no Railway)
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=your-db-name
```

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

A aplicação responde em `/api` para health checks.
