import Company from '#models/company'
import type { HttpContext } from '@adonisjs/core/http'

export default class CompaniesController {


    public async createCompany({ request, response, auth }: HttpContext) {
        const company = new Company()
        const check = await auth.use('api').authenticate()

        if (!check) {
            return response.status(401).json({ error: 'Usuário não autenticado' });
        }

        const companyExists = await Company.findBy('name', request.input('name'))

        if (companyExists) {
            response.status(403);
            return response.json({ error: `Empresa já está cadastrada` })
        }

        try {
            company.employees = request.input('employees') || '';
            company.name = request.input('name');
            company.location = request.input('location');
            company.email = request.input('email');
            company.phone = request.input('phone');
            company.address = request.input('address');
            company.userId = check?.id;
            company.dayValue = 0;
            company.monthValue = 0;
            company.anualValue = 0;

            console.log('company', company)
            await company.save()

            return response.json({ message: 'Empresa criada com sucesso', company })

        } catch (error) {
            console.error('Erro ao criar empresa:', error);
            response.status(500);
            return response.send({ error: 'Ocorreu um erro inesperado.' });
        }



    }


    public async getAllCompany({ response, auth }: HttpContext) {
        try {
            const check = await auth.use('api').authenticate();

            if (!check) {
                return response.status(401).json({ error: 'Usuário não autenticado' });
            }

            const user = await auth.use('api').user;

            if (!user) {
                return response.status(401).json({ error: 'Usuário não encontrado' });
            }

            const allCompanies = await Company.findManyBy('userId', user.id);

            return response.json({ companies: allCompanies });
        } catch (error) {
            console.error("Erro ao buscar empresas:", error);
            return response.status(500).json({ error: 'Erro ao buscar empresas' });
        }
    }


    public async getCompanyById({response, auth, params}: HttpContext){

        try {
            const check = await auth.use('api').authenticate();

            if (!check) {
                return response.status(401).json({ error: 'Usuário não autenticado' });
            }


            const companyId = params.id;
    
            if (!companyId) {
                return response.status(400).json({ error: 'ID da empresa é obrigatório' });
            }

                
            const companyFound = await Company.findBy('id', companyId )

            return companyFound

        } catch (error) {
            return response.status(500).json({ error: 'Erro ao buscar empresa' });
        }
    }

    public async deleteCompany({response, auth, params}: HttpContext) {
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

            const company = await Company.findBy('id', companyId);

            if (!company) {
                return response.status(404).json({ error: 'Empresa não encontrada' });
            }

            // Verificar se a empresa pertence ao usuário
            if (company.userId !== user.id) {
                return response.status(403).json({ error: 'Você não tem permissão para deletar esta empresa' });
            }

            await company.delete();

            return response.json({ message: 'Empresa deletada com sucesso' });

        } catch (error) {
            console.error("Erro ao deletar empresa:", error);
            return response.status(500).json({ error: 'Erro ao deletar empresa' });
        }
    }

}