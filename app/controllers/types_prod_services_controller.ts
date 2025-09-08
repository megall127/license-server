import TypesProdService from '#models/types_prod_service';
import Company from '#models/company';
import type { HttpContext } from '@adonisjs/core/http'

export default class TypesProdServicesController {

        public async createTypesProductService({ request, response, auth }: HttpContext) {
            const type = new TypesProdService()
            const check = await auth.use('api').authenticate()
    
            if (!check) {
                return response.status(401).json({ error: 'Usuário não autenticado' });
            }

            const user = await auth.use('api').user;

            if (!user) {
                return response.status(401).json({ error: 'Usuário não encontrado' });
            }

            // Verificar se a empresa pertence ao usuário
            const company = await Company.findBy('id', request.input('companyId'));
            if (!company || company.userId !== user.id) {
                return response.status(403).json({ error: 'Empresa não encontrada ou não pertence ao usuário' });
            }

            // Verificar se já existe tipo com o mesmo nome na empresa
            const typeExists = await TypesProdService.query()
                .where('name', request.input('name'))
                .where('companyId', request.input('companyId'))
                .first();
    
            if (typeExists) {
                return response.status(403).json({ error: 'Tipo já está cadastrado nesta empresa' });
            }
    
            try {
                type.name = request.input('name');
                type.companyId = request.input('companyId');
                await type.save()
    
                return response.json({ message: 'Tipo criado com sucesso', type })
    
            } catch (error) {
                console.error('Erro ao criar tipo:', error);
                response.status(500);
                return response.send({ error: 'Ocorreu um erro inesperado.' });
            }
        }
    
        public async getAllTypesProductService({ response, auth, params }: HttpContext) {
            try {
                const check = await auth.use('api').authenticate();
        
                if (!check) {
                    return response.status(401).json({ error: 'Usuário não autenticado' });
                }
        
                const user = await auth.use('api').user;
        
                if (!user) {
                    return response.status(401).json({ error: 'Usuário não encontrado' });
                }
        
                const companyId = params.id;
        
                if (!companyId) {
                    return response.status(400).json({ error: 'ID da empresa é obrigatório' });
                }

                // Verificar se a empresa pertence ao usuário
                const company = await Company.findBy('id', companyId);
                if (!company || company.userId !== user.id) {
                    return response.status(403).json({ error: 'Empresa não encontrada ou não pertence ao usuário' });
                }
        
                const allTypes = await TypesProdService.query().where('companyId', companyId);
        
                return response.json({ types: allTypes });
            } catch (error) {
                console.error("Erro ao buscar tipos:", error);
                return response.status(500).json({ error: 'Erro ao buscar tipos' });
            }
        }

        public async getTypeById({ response, auth, params }: HttpContext) {
            try {
                const check = await auth.use('api').authenticate();

                if (!check) {
                    return response.status(401).json({ error: 'Usuário não autenticado' });
                }

                const user = await auth.use('api').user;

                if (!user) {
                    return response.status(401).json({ error: 'Usuário não encontrado' });
                }

                const typeId = params.id;

                if (!typeId) {
                    return response.status(400).json({ error: 'ID do tipo é obrigatório' });
                }

                const type = await TypesProdService.findBy('id', typeId);

                if (!type) {
                    return response.status(404).json({ error: 'Tipo não encontrado' });
                }

                // Verificar se a empresa do tipo pertence ao usuário
                const company = await Company.findBy('id', type.companyId);
                if (!company || company.userId !== user.id) {
                    return response.status(403).json({ error: 'Tipo não pertence ao usuário' });
                }

                return response.json({ type });
            } catch (error) {
                console.error("Erro ao buscar tipo:", error);
                return response.status(500).json({ error: 'Erro ao buscar tipo' });
            }
        }

        public async updateType({ request, response, auth, params }: HttpContext) {
            try {
                const check = await auth.use('api').authenticate();

                if (!check) {
                    return response.status(401).json({ error: 'Usuário não autenticado' });
                }

                const user = await auth.use('api').user;

                if (!user) {
                    return response.status(401).json({ error: 'Usuário não encontrado' });
                }

                const typeId = params.id;

                if (!typeId) {
                    return response.status(400).json({ error: 'ID do tipo é obrigatório' });
                }

                const type = await TypesProdService.findBy('id', typeId);

                if (!type) {
                    return response.status(404).json({ error: 'Tipo não encontrado' });
                }

                // Verificar se a empresa do tipo pertence ao usuário
                const company = await Company.findBy('id', type.companyId);
                if (!company || company.userId !== user.id) {
                    return response.status(403).json({ error: 'Tipo não pertence ao usuário' });
                }

                // Verificar se já existe outro tipo com o mesmo nome na empresa
                const typeExists = await TypesProdService.query()
                    .where('name', request.input('name'))
                    .where('companyId', type.companyId)
                    .where('id', '!=', typeId)
                    .first();

                if (typeExists) {
                    return response.status(403).json({ error: 'Já existe um tipo com este nome nesta empresa' });
                }

                // Atualizar campos
                type.name = request.input('name', type.name);

                await type.save();

                return response.json({ message: 'Tipo atualizado com sucesso', type });
            } catch (error) {
                console.error("Erro ao atualizar tipo:", error);
                return response.status(500).json({ error: 'Erro ao atualizar tipo' });
            }
        }

        public async deleteType({ response, auth, params }: HttpContext) {
            try {
                const check = await auth.use('api').authenticate();

                if (!check) {
                    return response.status(401).json({ error: 'Usuário não autenticado' });
                }

                const user = await auth.use('api').user;

                if (!user) {
                    return response.status(401).json({ error: 'Usuário não encontrado' });
                }

                const typeId = params.id;

                if (!typeId) {
                    return response.status(400).json({ error: 'ID do tipo é obrigatório' });
                }

                const type = await TypesProdService.findBy('id', typeId);

                if (!type) {
                    return response.status(404).json({ error: 'Tipo não encontrado' });
                }

                // Verificar se a empresa do tipo pertence ao usuário
                const company = await Company.findBy('id', type.companyId);
                if (!company || company.userId !== user.id) {
                    return response.status(403).json({ error: 'Tipo não pertence ao usuário' });
                }

                await type.delete();

                return response.json({ message: 'Tipo deletado com sucesso' });
            } catch (error) {
                console.error("Erro ao deletar tipo:", error);
                return response.status(500).json({ error: 'Erro ao deletar tipo' });
            }
        }
        
}