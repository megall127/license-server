import TransitionsBuySells from '#models/buy_and_sell'
import Company from '#models/company'
import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class CashFlowController {
  // Registrar uma nova transação
  public async createTransaction({ request, response, auth }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()
      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const {
        productId,
        companyId,
        transactionType,
        amount,
        quantity,
        description,
        paymentMethod,
        customerName,
        customerDocument
      } = request.only([
        'productId',
        'companyId',
        'transactionType',
        'amount',
        'quantity',
        'description',
        'paymentMethod',
        'customerName',
        'customerDocument'
      ])

      // Validar se o produto existe
      const product = await Product.find(productId)
      if (!product) {
        return response.status(404).json({ error: 'Produto não encontrado' })
      }

      // Validar se a empresa existe
      const company = await Company.find(companyId)
      if (!company) {
        return response.status(404).json({ error: 'Empresa não encontrada' })
      }

      // Verificar se há estoque suficiente (apenas para produtos com controle de estoque ativado)
      if (product.stockEnabled && product.amount < quantity) {
        return response.status(400).json({ 
          error: 'Estoque insuficiente',
          available: product.amount,
          requested: quantity
        })
      }

      // Criar a transação
      const transaction = new TransitionsBuySells()
      transaction.productId = productId
      transaction.companyId = companyId
      transaction.transactionType = transactionType
      transaction.amount = amount
      transaction.quantity = quantity
      transaction.description = description
      transaction.paymentMethod = paymentMethod
      transaction.customerName = customerName
      transaction.customerDocument = customerDocument
      transaction.status = 'confirmado'

      await transaction.save()

      // Atualizar estoque do produto (apenas diminui para vendas)
      product.amount -= quantity
      await product.save()

      // Atualizar valores da empresa (apenas entrada de dinheiro)
      company.dayValue += amount
      company.monthValue += amount
      company.anualValue += amount
      await company.save()

      // Buscar a transação com relacionamentos
      const transactionWithRelations = await TransitionsBuySells.query()
        .where('id', transaction.id)
        .preload('product')
        .preload('company')
        .first()

      return response.json({
        message: 'Transação registrada com sucesso',
        transaction: transactionWithRelations
      })

    } catch (error) {
      console.error('Erro ao criar transação:', error)
      return response.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  // Buscar todas as transações de uma empresa
  public async getTransactions({ response, auth, params, request }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()
      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const companyId = params.id
      const { page = 1, limit = 20, type, startDate, endDate } = request.qs()

      let query = TransitionsBuySells.query()
        .where('companyId', companyId)
        .preload('product')
        .preload('company')
        .orderBy('createdAt', 'desc')

      // Filtros
      if (type) {
        query = query.where('transactionType', type)
      }

      if (startDate && endDate) {
        const startSQL = DateTime.fromISO(startDate).toSQL()
        const endSQL = DateTime.fromISO(endDate).toSQL()
        if (startSQL && endSQL) {
          query = query.whereBetween('createdAt', [startSQL, endSQL])
        }
      }

      const transactions = await query.paginate(page, limit)

      return response.json(transactions)

    } catch (error) {
      console.error('Erro ao buscar transações:', error)
      return response.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  // Buscar resumo do fluxo de caixa
  public async getCashFlowSummary({ response, auth, params, request }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()
      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const companyId = params.id
      const { period = 'today' } = request.qs()

      let startDate: DateTime
      let endDate: DateTime = DateTime.now()

      switch (period) {
        case 'today':
          startDate = DateTime.now().startOf('day')
          break
        case 'week':
          startDate = DateTime.now().startOf('week')
          break
        case 'month':
          startDate = DateTime.now().startOf('month')
          break
        case 'year':
          startDate = DateTime.now().startOf('year')
          break
        default:
          startDate = DateTime.now().startOf('day')
      }

      // Buscar transações do período
      const startSQL = startDate.toSQL()
      const endSQL = endDate.toSQL()
      if (startSQL && endSQL) {
        const transactions = await TransitionsBuySells.query()
          .where('companyId', companyId)
          .whereBetween('createdAt', [startSQL, endSQL])
          .where('status', 'confirmado')

        // Calcular totais (apenas entradas)
        const totalEntradas = transactions
          .filter(t => t.transactionType === 'entrada')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const saldo = totalEntradas

        // Agrupar por método de pagamento
        const paymentMethods: Record<string, number> = transactions.reduce((acc, t) => {
          const method = t.paymentMethod
          if (!acc[method]) acc[method] = 0
          acc[method] += Number(t.amount)
          return acc
        }, {} as Record<string, number>)

        // Top produtos mais vendidos
        const topProducts = await TransitionsBuySells.query()
          .where('companyId', companyId)
          .where('transactionType', 'entrada')
          .whereBetween('createdAt', [startSQL, endSQL])
          .preload('product')
          .groupBy('productId')
          .select('productId')
          .sum('quantity as totalQuantity')
          .orderBy('totalQuantity', 'desc')
          .limit(5)

        return response.json({
          period,
          startDate: startDate.toISO(),
          endDate: endDate.toISO(),
          summary: {
            totalEntradas,
            saldo,
            totalTransactions: transactions.length
          },
          paymentMethods,
          topProducts
        })
      }

      return response.json({
        period,
        startDate: startDate.toISO(),
        endDate: endDate.toISO(),
        summary: {
          totalEntradas: 0,
          saldo: 0,
          totalTransactions: 0
        },
        paymentMethods: {},
        topProducts: []
      })

    } catch (error) {
      console.error('Erro ao buscar resumo:', error)
      return response.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  // Entrada de dinheiro no caixa (venda) - diminui estoque automaticamente
  public async cashEntry({ request, response, auth }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()
      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const {
        productId,
        companyId,
        amount,
        quantity = 1, // Por padrão, vende 1 unidade
        description,
        paymentMethod = 'dinheiro',
        customerName,
        customerDocument
      } = request.only([
        'productId',
        'companyId',
        'amount',
        'quantity',
        'description',
        'paymentMethod',
        'customerName',
        'customerDocument'
      ])

      // Validar se o produto existe
      const product = await Product.find(productId)
      if (!product) {
        return response.status(404).json({ error: 'Produto não encontrado' })
      }

      // Validar se a empresa existe
      const company = await Company.find(companyId)
      if (!company) {
        return response.status(404).json({ error: 'Empresa não encontrada' })
      }

      // Verificar se há estoque suficiente (apenas para produtos com controle de estoque ativado)
      if (product.stockEnabled && product.amount < quantity) {
        return response.status(400).json({ 
          error: 'Estoque insuficiente',
          available: product.amount,
          requested: quantity
        })
      }

      // Criar a transação de entrada (venda)
      const transaction = new TransitionsBuySells()
      transaction.productId = productId
      transaction.companyId = companyId
      transaction.transactionType = 'entrada' // Entrada de dinheiro
      transaction.amount = amount
      transaction.quantity = quantity
      transaction.description = description || `Venda de ${product.name}`
      transaction.paymentMethod = paymentMethod
      transaction.customerName = customerName
      transaction.customerDocument = customerDocument
      transaction.status = 'confirmado'

      await transaction.save()

      // Diminuir estoque do produto
      product.amount -= quantity
      await product.save()

      // Aumentar valores da empresa (entrada de dinheiro)
      company.dayValue += amount
      company.monthValue += amount
      company.anualValue += amount
      await company.save()

      // Buscar a transação com relacionamentos
      const transactionWithRelations = await TransitionsBuySells.query()
        .where('id', transaction.id)
        .preload('product')
        .preload('company')
        .first()

      return response.json({
        message: 'Entrada de dinheiro registrada com sucesso',
        transaction: transactionWithRelations,
        newStock: product.amount
      })

    } catch (error) {
      console.error('Erro ao registrar entrada de dinheiro:', error)
      return response.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  // Cancelar uma transação
  public async cancelTransaction({ response, auth, params }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()
      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const transactionId = params.id
      const transaction = await TransitionsBuySells.find(transactionId)

      if (!transaction) {
        return response.status(404).json({ error: 'Transação não encontrada' })
      }

      if (transaction.status === 'cancelado') {
        return response.status(400).json({ error: 'Transação já está cancelada' })
      }

      // Reverter estoque (apenas para entradas/vendas)
      const product = await Product.find(transaction.productId)
      if (product && transaction.transactionType === 'entrada') {
        product.amount += transaction.quantity
        await product.save()
      }

      // Reverter valores da empresa (apenas para entradas/vendas)
      const company = await Company.find(transaction.companyId)
      if (company && transaction.transactionType === 'entrada') {
        company.dayValue -= transaction.amount
        company.monthValue -= transaction.amount
        company.anualValue -= transaction.amount
        await company.save()
      }

      // Cancelar transação
      transaction.status = 'cancelado'
      await transaction.save()

      return response.json({
        message: 'Transação cancelada com sucesso',
        transaction
      })

    } catch (error) {
      console.error('Erro ao cancelar transação:', error)
      return response.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}
