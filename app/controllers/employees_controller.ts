import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import Company from '#models/company'

export default class EmployeesController {
  /**
   * Listar todos os funcionários
   */
  async index({ response }: HttpContext) {
    try {
      const employees = await Employee.query()
        .orderBy('created_at', 'desc')

      return response.ok({
        success: true,
        data: employees,
        message: 'Funcionários listados com sucesso'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Erro ao listar funcionários',
        error: error.message
      })
    }
  }

  /**
   * Listar funcionários de uma empresa específica
   */
  async getByCompany({ params, response }: HttpContext) {
    try {
      const { companyId } = params

      const employees = await Employee.query()
        .where('company_id', companyId)
        .orderBy('created_at', 'desc')

      return response.ok({
        success: true,
        data: employees,
        message: 'Funcionários da empresa listados com sucesso'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Erro ao listar funcionários da empresa',
        error: error.message
      })
    }
  }

  /**
   * Buscar funcionário por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const { id } = params

      const employee = await Employee.query()
        .where('id', id)
        .first()

      if (!employee) {
        return response.notFound({
          success: false,
          message: 'Funcionário não encontrado'
        })
      }

      return response.ok({
        success: true,
        data: employee,
        message: 'Funcionário encontrado com sucesso'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Erro ao buscar funcionário',
        error: error.message
      })
    }
  }

  /**
   * Criar novo funcionário
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'name',
        'email',
        'phone',
        'position',
        'companyId',
        'salary',
        'hireDate',
        'status'
      ])

      console.log('Dados recebidos para criar funcionário:', data)

      // Validar campos obrigatórios
      if (!data.name || !data.email || !data.position || !data.companyId) {
        return response.badRequest({
          success: false,
          message: 'Nome, email, posição e ID da empresa são obrigatórios'
        })
      }

      // Validar se a empresa existe
      const company = await Company.find(data.companyId)
      if (!company) {
        return response.badRequest({
          success: false,
          message: 'Empresa não encontrada'
        })
      }

      // Verificar se o email já existe
      const existingEmployee = await Employee.findBy('email', data.email)
      if (existingEmployee) {
        return response.badRequest({
          success: false,
          message: 'Já existe um funcionário com este e-mail'
        })
      }

      console.log('Empresa encontrada:', company)
      console.log('Email não existe, prosseguindo com criação...')

      console.log('Tentando criar funcionário com dados:', {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        position: data.position,
        companyId: data.companyId,
        salary: data.salary || 0,
        hireDate: data.hireDate || null,
        status: data.status || 'ativo'
      })

      const employee = await Employee.create({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        position: data.position,
        companyId: data.companyId,
        salary: data.salary || 0,
        hireDate: data.hireDate || null,
        status: data.status || 'ativo'
      })

      console.log('Funcionário criado com sucesso:', employee)

      // await employee.load('company') // Relacionamento temporariamente removido

      return response.created({
        success: true,
        data: employee,
        message: 'Funcionário criado com sucesso'
      })
    } catch (error) {
      console.error('Erro detalhado ao criar funcionário:', error)
      return response.badRequest({
        success: false,
        message: 'Erro ao criar funcionário',
        error: error.message,
        details: error
      })
    }
  }

  /**
   * Atualizar funcionário
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const data = request.only([
        'name',
        'email',
        'phone',
        'position',
        'companyId',
        'salary',
        'hireDate',
        'status'
      ])

      const employee = await Employee.find(id)
      if (!employee) {
        return response.notFound({
          success: false,
          message: 'Funcionário não encontrado'
        })
      }

      // Verificar se a empresa existe (se foi fornecida)
      if (data.companyId) {
        const company = await Company.find(data.companyId)
        if (!company) {
          return response.badRequest({
            success: false,
            message: 'Empresa não encontrada'
          })
        }
      }

      // Verificar se o email já existe (se foi alterado)
      if (data.email && data.email !== employee.email) {
        const existingEmployee = await Employee.findBy('email', data.email)
        if (existingEmployee) {
          return response.badRequest({
            success: false,
            message: 'Já existe um funcionário com este e-mail'
          })
        }
      }

      employee.merge(data)
      await employee.save()
      // await employee.load('company') // Relacionamento temporariamente removido

      return response.ok({
        success: true,
        data: employee,
        message: 'Funcionário atualizado com sucesso'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Erro ao atualizar funcionário',
        error: error.message
      })
    }
  }

  /**
   * Excluir funcionário
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const { id } = params

      const employee = await Employee.find(id)
      if (!employee) {
        return response.notFound({
          success: false,
          message: 'Funcionário não encontrado'
        })
      }

      await employee.delete()

      return response.ok({
        success: true,
        message: 'Funcionário excluído com sucesso'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Erro ao excluir funcionário',
        error: error.message
      })
    }
  }
}