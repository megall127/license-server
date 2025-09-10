import TransitionsBuySells from '#models/buy_and_sell';
import Company from '#models/company';
import Product from '#models/product';
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
    public async createProduct({ request, response, auth }: HttpContext) {
        const product = new Product()
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

        // Verificar se já existe produto com o mesmo nome na empresa
        const productExists = await Product.query()
            .where('name', request.input('name'))
            .where('companyId', request.input('companyId'))
            .first();

        if (productExists) {
            return response.status(403).json({ error: 'Produto já está cadastrado nesta empresa' });
        }

        try {
            product.name = request.input('name');
            product.type = request.input('type');
            product.amount = request.input('amount') || 0;
            product.minAmount = request.input('minAmount') || 0;
            product.stockEnabled = request.input('stockEnabled') || false;
            product.valueCoast = request.input('valueCoast') || 0;
            product.supplier = request.input('supplier') || '';
            product.internalCod = request.input('internalCod') || '';
            product.barcode = request.input('barcode') || '';
            product.observation = request.input('observation') || '';
            product.companyId = request.input('companyId');

            await product.save()

            return response.json({ message: 'Produto criado com sucesso', product })

        } catch (error) {
            console.error('Erro ao criar produto:', error);
            response.status(500);
            return response.send({ error: 'Ocorreu um erro inesperado.' });
        }
    }

    public async getAllProduct({ response, auth, params }: HttpContext) {
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

            const allProducts = await Product.query().where('companyId', companyId);

            return response.json({ products: allProducts });
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            return response.status(500).json({ error: 'Erro ao buscar produtos' });
        }
    }

    public async getProductById({ response, auth, params }: HttpContext) {
        try {
            const check = await auth.use('api').authenticate();

            if (!check) {
                return response.status(401).json({ error: 'Usuário não autenticado' });
            }

            const user = await auth.use('api').user;

            if (!user) {
                return response.status(401).json({ error: 'Usuário não encontrado' });
            }

            const productId = params.id;

            if (!productId) {
                return response.status(400).json({ error: 'ID do produto é obrigatório' });
            }

            const product = await Product.findBy('id', productId);

            if (!product) {
                return response.status(404).json({ error: 'Produto não encontrado' });
            }

            // Verificar se a empresa do produto pertence ao usuário
            const company = await Company.findBy('id', product.companyId);
            if (!company || company.userId !== user.id) {
                return response.status(403).json({ error: 'Produto não pertence ao usuário' });
            }

            return response.json({ product });
        } catch (error) {
            console.error("Erro ao buscar produto:", error);
            return response.status(500).json({ error: 'Erro ao buscar produto' });
        }
    }

    public async updateProduct({ request, response, auth, params }: HttpContext) {
        try {
            const check = await auth.use('api').authenticate();

            if (!check) {
                return response.status(401).json({ error: 'Usuário não autenticado' });
            }

            const user = await auth.use('api').user;

            if (!user) {
                return response.status(401).json({ error: 'Usuário não encontrado' });
            }

            const productId = params.id;

            if (!productId) {
                return response.status(400).json({ error: 'ID do produto é obrigatório' });
            }

            const product = await Product.findBy('id', productId);

            if (!product) {
                return response.status(404).json({ error: 'Produto não encontrado' });
            }

            // Verificar se a empresa do produto pertence ao usuário
            const company = await Company.findBy('id', product.companyId);
            if (!company || company.userId !== user.id) {
                return response.status(403).json({ error: 'Produto não pertence ao usuário' });
            }

            // Atualizar campos
            product.name = request.input('name', product.name);
            product.type = request.input('type', product.type);
            product.amount = request.input('amount', product.amount);
            product.minAmount = request.input('minAmount', product.minAmount);
            product.stockEnabled = request.input('stockEnabled', product.stockEnabled);
            product.valueCoast = request.input('valueCoast', product.valueCoast);
            product.supplier = request.input('supplier', product.supplier);
            product.internalCod = request.input('internalCod', product.internalCod);
            product.barcode = request.input('barcode', product.barcode);
            product.observation = request.input('observation', product.observation);

            await product.save();

            return response.json({ message: 'Produto atualizado com sucesso', product });
        } catch (error) {
            console.error("Erro ao atualizar produto:", error);
            return response.status(500).json({ error: 'Erro ao atualizar produto' });
        }
    }

    public async deleteProduct({ response, auth, params }: HttpContext) {
        try {
            const check = await auth.use('api').authenticate();

            if (!check) {
                return response.status(401).json({ error: 'Usuário não autenticado' });
            }

            const user = await auth.use('api').user;

            if (!user) {
                return response.status(401).json({ error: 'Usuário não encontrado' });
            }

            const productId = params.id;

            if (!productId) {
                return response.status(400).json({ error: 'ID do produto é obrigatório' });
            }

            const product = await Product.findBy('id', productId);

            if (!product) {
                return response.status(404).json({ error: 'Produto não encontrado' });
            }

            // Verificar se a empresa do produto pertence ao usuário
            const company = await Company.findBy('id', product.companyId);
            if (!company || company.userId !== user.id) {
                return response.status(403).json({ error: 'Produto não pertence ao usuário' });
            }

            await product.delete();

            return response.json({ message: 'Produto deletado com sucesso' });
        } catch (error) {
            console.error("Erro ao deletar produto:", error);
            return response.status(500).json({ error: 'Erro ao deletar produto' });
        }
    }


    public async transitiosBuySell({ response, auth, request }: HttpContext) {
        const flowProd = new TransitionsBuySells()

        try {
            const check = await auth.use('api').authenticate();

            if (!check) {
                return response.status(401).json({ error: 'Usuário não autenticado' });
            }

            flowProd.companyId = request.input('companyId')
            flowProd.productId = request.input('productId')

            const responseProduct = await Product.findBy('id', request.input('productId'))
            const responseCompany = await Company.findBy('id', request.input('companyId'))

            //validar quando não tiver mais produtos no estoque se tiver retirar 1

            await flowProd.save()

            return {
                product: responseProduct,
                company: responseCompany
            }
        } catch (error) {
            console.log(error)
            return {
                erro: 'algo deu errado'
            }
        }
    }
}