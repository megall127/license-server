
import CompaniesController from '#controllers/companies_controller'
import ProductsController from '#controllers/products_controller'
import TypesProdServicesController from '#controllers/types_prod_services_controller'
import UsersController from '#controllers/users_controller'
import CashFlowController from '#controllers/cash_flow_controller'
import router from '@adonisjs/core/services/router'

// Rota de health check para o Railway
router.get('/api', ({ response }) => {
  return response.json({ 
    status: 'ok', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  })
})

// Rota de teste com informações do sistema
router.get('/api/test', ({ response }) => {
  return response.json({
    status: 'ok',
    message: 'API test endpoint',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
      host: process.env.MYSQLHOST || 'not set',
      port: process.env.MYSQLPORT || 'not set',
      user: process.env.MYSQLUSER || 'not set',
      database: process.env.MYSQLDATABASE || 'not set'
    }
  })
})

// Agrupamento de rotas de autenticação (usuários)
router.group(() => {
  router.post('/register', [UsersController, 'create'])
  router.post('/login', [UsersController, 'login'])

  router.post('/register-company', [CompaniesController, 'createCompany'])
  router.get('/get-all-company', [CompaniesController, 'getAllCompany'])
  router.get('/get-company/:id', [CompaniesController, 'getCompanyById'])
  router.delete('/delete-company/:id', [CompaniesController, 'deleteCompany'])

  router.post('/register-product', [ProductsController, 'createProduct'])
  router.get('/get-all-product/:id', [ProductsController, 'getAllProduct'])
  router.get('/get-product/:id', [ProductsController, 'getProductById'])
  router.put('/update-product/:id', [ProductsController, 'updateProduct'])
  router.delete('/delete-product/:id', [ProductsController, 'deleteProduct'])
  router.post('/buy-and-sell', [ProductsController, 'transitiosBuySell'])

  router.post('/register-types', [TypesProdServicesController, 'createTypesProductService'])
  router.get('/get-all-types/:id', [TypesProdServicesController, 'getAllTypesProductService'])
  router.get('/get-type/:id', [TypesProdServicesController, 'getTypeById'])
  router.put('/update-type/:id', [TypesProdServicesController, 'updateType'])
  router.delete('/delete-type/:id', [TypesProdServicesController, 'deleteType'])

  // Novas rotas para fluxo de caixa
  router.post('/cash-flow/transaction', [CashFlowController, 'createTransaction'])
  router.get('/cash-flow/transactions/:id', [CashFlowController, 'getTransactions'])
  router.get('/cash-flow/summary/:id', [CashFlowController, 'getCashFlowSummary'])
  router.put('/cash-flow/transaction/:id/cancel', [CashFlowController, 'cancelTransaction'])

}).prefix('api')
