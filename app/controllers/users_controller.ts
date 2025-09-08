import type { HttpContext } from '@adonisjs/core/http'

import User from "#models/user";

export default class UsersController {


    public async create({ request, response }: HttpContext) {
        const user = new User()

        const emailExists = await User.findBy('email', request.input('email'))

        if (emailExists) {
            return response.json({ message: 'Email já está em uso' })
        } else {
            user.email = request.input('email');
            user.password = request.input('password');
            user.fullName = request.input('name');
            user.tell_number = request.input('tell_number')

            console.log('user', user)
            await user.save()

            return response.json({ message: 'Usuário criado com sucesso', user })
        }
    }

    public async login({ request, response }: HttpContext) {
        const email = request.input('email');
        const password = request.input('password');
        const emailExists = await User.findBy('email', request.input('email'))
    
        try {
            const user = await User.verifyCredentials(email, password);
    
            const token = await User.accessTokens.create(user);
    
            return {
                user: user,
                token: token
            };
    
        } catch (error) {

            if(!emailExists){
                response.status(404);
                return response.send({ error: 'Email não cadastrado.' });

            }else if (error.code === 'E_INVALID_CREDENTIALS') { 
                response.status(401);
                return response.send({ error: 'Senha incorreta.' });
            }
    
            response.status(500);
            console.log(error)
            return response.send({ error: 'Ocorreu um erro inesperado.' });
        }
    }


}