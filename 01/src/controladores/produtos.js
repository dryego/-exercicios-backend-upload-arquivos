const knex = require('../conexao');
const { envioArquivos } = require('../servicos/uplodArquivo');

const listarProdutos = async (req, res) => {
    const { usuario } = req;
    const { categoria } = req.query;

    try {
        const produtos = await knex('produtos')
            .where({ usuario_id: usuario.id })
            .where(query => {
                if (categoria) {
                    return query.where('categoria', 'ilike', `%${categoria}%`);
                }
            });

        return res.status(200).json(produtos);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado');
        }

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarProduto = async (req, res) => {
    const { usuario, files } = req;
    const { nome, estoque, preco, categoria, descricao, imagem } = req.body;

    if (!nome) {
        return res.status(404).json('O campo nome é obrigatório');
    }

    if (!estoque) {
        return res.status(404).json('O campo estoque é obrigatório');
    }

    if (!preco) {
        return res.status(404).json('O campo preco é obrigatório');
    }

    if (!descricao) {
        return res.status(404).json('O campo descricao é obrigatório');
    }
    const imagens = [];
    if (files) {
        for (const file of files) {
            const imagem = await envioArquivos(
                `imagem/${usuario.id}/${file.originalname}`,
                file.buffer,
                file.mimetype
            );

            imagens.push(imagem);
        }
    }

    // const urlImagem = imagens.map((imagem) => {
    //     imagem = imagem.url
    //     return imagem
    // });

    try {

        const produto = await knex('produtos').insert({
            usuario_id: usuario.id,
            nome,
            estoque,
            preco,
            categoria,
            descricao,
            imagem: imagens//urlImagem
        }).returning('*');

        if (!produto) {
            return res.status(400).json('O produto não foi cadastrado');
        }

        return res.status(200).json(produto);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error.message);
    }
}

const atualizarProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;
    const { nome, estoque, preco, categoria, descricao, imagem } = req.body;

    if (!nome && !estoque && !preco && !categoria && !descricao) {
        return res.status(404).json('Informe ao menos um campo para atualizaçao do produto');
    }

    if (imagem) {
        return res.status(404).json('Imagem não pode ser atualizada.');
    }

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        const produto = await knex('produtos')
            .where({ id })
            .update({
                nome,
                estoque,
                preco,
                categoria,
                descricao
            });

        if (!produto) {
            return res.status(400).json("O produto não foi atualizado");
        }

        return res.status(200).json('produto foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarImagemProduto = async (req, res) => {
    const { usuario, files } = req;
    const { id } = req.params;

    const produtoEncontrado = await knex('produtos').where({
        id,
        usuario_id: usuario.id
    }).first();

    if (!produtoEncontrado) {
        return res.status(404).json('Produto não encontrado');
    }

    const buscarImagensProduto = produtoEncontrado.imagem

    if (buscarImagensProduto) {
        return res.status(200).json(pathImagens);
    }


}

const excluirProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        const produtoExcluido = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).del();

        if (!produtoExcluido) {
            return res.status(400).json("O produto não foi excluido");
        }

        return res.status(200).json('Produto excluido com sucesso');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarProdutos,
    obterProduto,
    cadastrarProduto,
    atualizarProduto,
    atualizarImagemProduto,
    excluirProduto
}