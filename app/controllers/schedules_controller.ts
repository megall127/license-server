import type { HttpContext } from '@adonisjs/core/http'
import Schedule from '#models/schedule'
import { DateTime } from 'luxon'

export default class SchedulesController {
  /**
   * Listar todos os agendamentos
   */
  async index({ response }: HttpContext) {
    try {
      const schedules = await Schedule.query()
        .preload('company')
        .orderBy('scheduled_date', 'asc')
        .orderBy('scheduled_time', 'asc')

      return response.json({
        success: true,
        data: schedules
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao buscar agendamentos',
        details: error.message
      })
    }
  }

  /**
   * Listar agendamentos por empresa
   */
  async getByCompany({ params, response }: HttpContext) {
    try {
      const { companyId } = params
      
      const schedules = await Schedule.query()
        .where('company_id', companyId)
        .preload('company')
        .orderBy('scheduled_date', 'asc')
        .orderBy('scheduled_time', 'asc')

      return response.json({
        success: true,
        data: schedules
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao buscar agendamentos da empresa',
        details: error.message
      })
    }
  }

  /**
   * Buscar agendamento por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const { id } = params
      
      const schedule = await Schedule.query()
        .where('id', id)
        .preload('company')
        .first()

      if (!schedule) {
        return response.status(404).json({
          success: false,
          error: 'Agendamento não encontrado'
        })
      }

      return response.json({
        success: true,
        data: schedule
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao buscar agendamento',
        details: error.message
      })
    }
  }

  /**
   * Criar novo agendamento
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'companyId',
        'customerName',
        'customerPhone',
        'customerEmail',
        'serviceType',
        'serviceDescription',
        'scheduledDate',
        'scheduledTime',
        'duration',
        'status',
        'notes'
      ])

      // Validar dados obrigatórios
      if (!data.companyId || !data.customerName || !data.customerPhone || 
          !data.serviceType || !data.serviceDescription || !data.scheduledDate || 
          !data.scheduledTime) {
        return response.status(400).json({
          success: false,
          error: 'Dados obrigatórios não fornecidos'
        })
      }

      // Converter data para formato correto
      const scheduledDate = DateTime.fromISO(data.scheduledDate)
      if (!scheduledDate.isValid) {
        return response.status(400).json({
          success: false,
          error: 'Data inválida'
        })
      }

      const schedule = await Schedule.create({
        companyId: data.companyId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        serviceType: data.serviceType,
        serviceDescription: data.serviceDescription,
        scheduledDate: scheduledDate,
        scheduledTime: data.scheduledTime,
        duration: data.duration || 60,
        status: data.status || 'agendado',
        notes: data.notes || null
      })

      await schedule.load('company')

      return response.status(201).json({
        success: true,
        data: schedule
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao criar agendamento',
        details: error.message
      })
    }
  }

  /**
   * Atualizar agendamento
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      
      const schedule = await Schedule.find(id)
      if (!schedule) {
        return response.status(404).json({
          success: false,
          error: 'Agendamento não encontrado'
        })
      }

      const data = request.only([
        'customerName',
        'customerPhone',
        'customerEmail',
        'serviceType',
        'serviceDescription',
        'scheduledDate',
        'scheduledTime',
        'duration',
        'status',
        'notes'
      ])

      // Atualizar apenas os campos fornecidos
      if (data.customerName) schedule.customerName = data.customerName
      if (data.customerPhone) schedule.customerPhone = data.customerPhone
      if (data.customerEmail !== undefined) schedule.customerEmail = data.customerEmail
      if (data.serviceType) schedule.serviceType = data.serviceType
      if (data.serviceDescription) schedule.serviceDescription = data.serviceDescription
      if (data.scheduledDate) {
        const scheduledDate = DateTime.fromISO(data.scheduledDate)
        if (scheduledDate.isValid) {
          schedule.scheduledDate = scheduledDate
        }
      }
      if (data.scheduledTime) schedule.scheduledTime = data.scheduledTime
      if (data.duration) schedule.duration = data.duration
      if (data.status) schedule.status = data.status
      if (data.notes !== undefined) schedule.notes = data.notes

      await schedule.save()
      await schedule.load('company')

      return response.json({
        success: true,
        data: schedule
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao atualizar agendamento',
        details: error.message
      })
    }
  }

  /**
   * Excluir agendamento
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const { id } = params
      
      const schedule = await Schedule.find(id)
      if (!schedule) {
        return response.status(404).json({
          success: false,
          error: 'Agendamento não encontrado'
        })
      }

      await schedule.delete()

      return response.json({
        success: true,
        message: 'Agendamento excluído com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao excluir agendamento',
        details: error.message
      })
    }
  }

  /**
   * Buscar agendamentos por período
   */
  async getByDateRange({ params, request, response }: HttpContext) {
    try {
      const { companyId } = params
      const { startDate, endDate } = request.qs()

      if (!startDate || !endDate) {
        return response.status(400).json({
          success: false,
          error: 'Data inicial e final são obrigatórias'
        })
      }

      const start = DateTime.fromISO(startDate)
      const end = DateTime.fromISO(endDate)

      if (!start.isValid || !end.isValid) {
        return response.status(400).json({
          success: false,
          error: 'Datas inválidas'
        })
      }

      const schedules = await Schedule.query()
        .where('company_id', companyId)
        .whereBetween('scheduled_date', [start.toISODate(), end.toISODate()])
        .preload('company')
        .orderBy('scheduled_date', 'asc')
        .orderBy('scheduled_time', 'asc')

      return response.json({
        success: true,
        data: schedules
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao buscar agendamentos por período',
        details: error.message
      })
    }
  }
}