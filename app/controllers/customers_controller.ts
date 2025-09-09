import Customer from '#models/customer'
import type { HttpContext } from '@adonisjs/core/http'

export default class CustomersController {
  /**
   * Lista todos os clientes
   */
  public async index({ response, auth }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()

      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const customers = await Customer.query()
        .orderBy('name', 'asc')

      return response.json({ customers })
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return response.status(500).json({ error: 'Erro ao buscar clientes' })
    }
  }

  /**
   * Lista todos os clientes de uma empresa
   */
  public async getByCompany({ response, auth, params }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()

      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const companyId = params.companyId

      if (!companyId) {
        return response.status(400).json({ error: 'ID da empresa é obrigatório' })
      }

      const customers = await Customer.query()
        .where('companyId', companyId)
        .orderBy('name', 'asc')

      return response.json({ customers })
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return response.status(500).json({ error: 'Erro ao buscar clientes' })
    }
  }

  /**
   * Mostra um cliente específico
   */
  public async show({ response, auth, params }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()

      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const customerId = params.id

      if (!customerId) {
        return response.status(400).json({ error: 'ID do cliente é obrigatório' })
      }

      const customer = await Customer.find(customerId)

      if (!customer) {
        return response.status(404).json({ error: 'Cliente não encontrado' })
      }

      return response.json({ customer })
    } catch (error) {
      console.error('Erro ao buscar cliente:', error)
      return response.status(500).json({ error: 'Erro ao buscar cliente' })
    }
  }

  /**
   * Cria um novo cliente
   */
  public async store({ request, response, auth }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()

      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { name, email, phone, address, companyId } = request.only(['name', 'email', 'phone', 'address', 'companyId'])

      if (!name || !companyId) {
        return response.status(400).json({ 
          error: 'Nome e ID da empresa são obrigatórios' 
        })
      }

      // Verificar se já existe um cliente com o mesmo nome na empresa
      const existingCustomer = await Customer.query()
        .where('name', name)
        .where('companyId', companyId)
        .first()

      if (existingCustomer) {
        return response.status(409).json({ 
          error: 'Já existe um cliente com este nome nesta empresa' 
        })
      }

      const customer = new Customer()
      customer.name = name
      customer.email = email || null
      customer.phone = phone || null
      customer.address = address || null
      customer.companyId = companyId

      await customer.save()

      return response.status(201).json({ 
        message: 'Cliente criado com sucesso', 
        customer 
      })
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      return response.status(500).json({ error: 'Erro ao criar cliente' })
    }
  }

  /**
   * Atualiza um cliente
   */
  public async update({ request, response, auth, params }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()

      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const customerId = params.id

      if (!customerId) {
        return response.status(400).json({ error: 'ID do cliente é obrigatório' })
      }

      const customer = await Customer.find(customerId)

      if (!customer) {
        return response.status(404).json({ error: 'Cliente não encontrado' })
      }

      const { name, email, phone, address } = request.only(['name', 'email', 'phone', 'address'])

      if (name) {
        // Verificar se já existe outro cliente com o mesmo nome na empresa
        const existingCustomer = await Customer.query()
          .where('name', name)
          .where('companyId', customer.companyId)
          .where('id', '!=', customerId)
          .first()

        if (existingCustomer) {
          return response.status(409).json({ 
            error: 'Já existe um cliente com este nome nesta empresa' 
          })
        }

        customer.name = name
      }

      if (email !== undefined) customer.email = email || null
      if (phone !== undefined) customer.phone = phone || null
      if (address !== undefined) customer.address = address || null

      await customer.save()

      return response.json({ 
        message: 'Cliente atualizado com sucesso', 
        customer 
      })
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      return response.status(500).json({ error: 'Erro ao atualizar cliente' })
    }
  }

  /**
   * Remove um cliente
   */
  public async destroy({ response, auth, params }: HttpContext) {
    try {
      const check = await auth.use('api').authenticate()

      if (!check) {
        return response.status(401).json({ error: 'Usuário não autenticado' })
      }

      const customerId = params.id

      if (!customerId) {
        return response.status(400).json({ error: 'ID do cliente é obrigatório' })
      }

      const customer = await Customer.find(customerId)

      if (!customer) {
        return response.status(404).json({ error: 'Cliente não encontrado' })
      }

      await customer.delete()

      return response.json({ message: 'Cliente removido com sucesso' })
    } catch (error) {
      console.error('Erro ao remover cliente:', error)
      return response.status(500).json({ error: 'Erro ao remover cliente' })
    }
  }
}