import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { OpenAI } from 'openai'
import env from '#start/env'

@inject()
export default class AiChatController {
  private openai: OpenAI

  constructor() {
    if (!env.get('OPENAI_API_KEY')) {
      console.warn('OPENAI_API_KEY não configurada. Chat de IA não funcionará.')
    }
    
    this.openai = new OpenAI({
      apiKey: env.get('OPENAI_API_KEY'),
    })
  }

  /**
   * Processa mensagem do usuário e retorna resposta da IA
   */
  async chat({ request, response }: HttpContext) {
    try {
      const { message, companyId } = request.only(['message', 'companyId'])

      if (!message) {
        return response.badRequest({
          error: 'Mensagem é obrigatória'
        })
      }

      if (!env.get('OPENAI_API_KEY')) {
        return response.serviceUnavailable({
          error: 'Serviço de IA temporariamente indisponível',
          message: 'A chave da API do OpenAI não está configurada. Entre em contato com o administrador.'
        })
      }

      // Contexto otimizado do ERP
      const systemPrompt = `Você é um assistente do Nexos ERP. Responda de forma concisa e prática em português.

      SISTEMA NEXOS ERP:
      
      📦 PRODUTOS: "Produtos e Serviços" → "Novo Produto"
      - Obrigatório: Nome e Tipo
      - Opcional: Código, Fornecedor, Observações
      - Estoque: marque "Ativar estoque" para produtos físicos
      - Serviços: desmarque "Ativar estoque"
      
      💰 FLUXO DE CAIXA: Menu "Fluxo de Caixa"
      - Registre vendas com método de pagamento
      - Visualize resumos por período
      
      👥 FUNCIONÁRIOS: Cadastro com Nome, Email, Cargo, Salário
      📅 AGENDAMENTOS: Cliente, Data, Hora, Tipo de Serviço
      🏢 EMPRESAS: Sistema multi-empresa - selecione empresa primeiro
      
      Seja direto e específico. Máximo 3-4 frases por resposta.`

      // Verificar se é uma pergunta específica sobre adicionar produtos
      const isProductQuestion = this.isProductRelatedQuestion(message)
      
      let enhancedPrompt = systemPrompt
      
      if (isProductQuestion) {
        enhancedPrompt += `
        
        RESPOSTA RÁPIDA PARA PRODUTOS:
        
        1. Vá em "Produtos e Serviços" → "Novo Produto"
        2. Preencha Nome e Tipo (obrigatório)
        3. Marque "Ativar estoque" para produtos físicos
        4. Desmarque para serviços (ex: corte de cabelo)
        5. Preencha campos opcionais (código, fornecedor, etc.)
        6. Clique "Salvar Produto"
        
        Dica: Selecione uma empresa primeiro no Nexos ERP!`
      }

      // Timeout de 10 segundos para evitar travamentos
      const completionPromise = this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: enhancedPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
      })

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )

      const completion = await Promise.race([completionPromise, timeoutPromise]) as any
      const aiResponse = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'

      return response.ok({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Erro no chat de IA:', error)
      
      // Tratamento específico para timeout
      if (error instanceof Error && error.message === 'Timeout') {
        return response.requestTimeout({
          error: 'Timeout na resposta da IA',
          message: 'A resposta está demorando mais que o esperado. Tente novamente com uma pergunta mais específica.'
        })
      }
      
      return response.internalServerError({
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar sua mensagem no momento. Tente novamente.'
      })
    }
  }

  /**
   * Verifica se a pergunta é relacionada a produtos (otimizado)
   */
  private isProductRelatedQuestion(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    
    // Palavras-chave principais para detecção rápida
    const mainKeywords = ['produto', 'estoque', 'adicionar', 'cadastrar', 'novo']
    
    return mainKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  /**
   * Retorna sugestões de perguntas comuns
   */
  async getSuggestions({ response }: HttpContext) {
    const suggestions = [
      "Como adicionar um novo produto ao estoque?",
      "Qual a diferença entre produto e serviço no sistema?",
      "Como configurar estoque mínimo para produtos?",
      "Como registrar uma venda no fluxo de caixa?",
      "Como cadastrar um novo funcionário?",
      "Como criar um agendamento para um cliente?",
      "Como visualizar o resumo financeiro do mês?",
      "Como gerenciar tipos de produtos e serviços?",
      "Como cancelar uma transação já registrada?",
      "Como cadastrar um novo cliente?",
      "Como configurar uma nova empresa?",
      "Como visualizar produtos com estoque baixo?"
    ]

    return response.ok({
      success: true,
      suggestions
    })
  }
}
