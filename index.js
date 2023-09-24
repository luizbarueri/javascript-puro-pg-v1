const express = require('express')
const app = express()
const db = require('./db.json')
const fs = require('fs')

app.use(express.json())
require('dotenv').config();


//Mensagem do servidor online
// app.get('/', (req, res) => {
//     return res.status(200).send( dadosPG() )
// })    
  
// Rota para buscar dados do PostgreSQL
app.get('/', async (req, res) => {
    const dados = await dadosPG();
    return res.status(200).send(dados);
});


//Buscar todos clientes
app.get('/cliente', (req, res) => {
    return res.status(200).json(db)
})

//Buscar Cliente por ID
app.get('/cliente/:id', (req, res) => {
    const id = req.params.id
    const result = db.find(cliente => cliente.id === id)
    if (!result) {
        return res.status(404).send()
    }
    return res.status(200).json(result)
})

//Incluiir Novo cliente
app.post('/cliente', (req, res) => {
    const body = req.body
    const data = [...db, body]
    fs.writeFileSync('db.json', JSON.stringify(data))
    return res.status(201).json(body) 
})

//Deletar cliente por ID
app.delete('/cliente/:id', (req, res) => {
    const id = req.params.id
    const result = db.find(cliente => cliente.id === id)
    if (!result) {
        return res.status(404).send()
    }
    const data = db.filter((cliente) => {
        return  cliente.id != id
    })
    fs.writeFileSync('db.json', JSON.stringify(data))
    return res.status(204).send()
})

//Altera um cliente por ID
app.put('/cliente/:id', (req, res) => {
    const body = req.body
    const id = req.params.id
    const result = db.find(cliente => cliente.id === id)
    if (!result) {
        return res.status(404).send()
    }
    const data = db.map((cliente) => {
        if (cliente.id === id) {
            const dados = {
                id: id,
                ...body
            }
            return dados
        }
        return cliente
    })
    fs.writeFileSync('db.json', JSON.stringify(data))
    return res.status(200).json(body)
})

//INICIAR SERVIDOR
app.listen('3000', () => {
    console.log("API escuntando na poeta 3000")
})

function pegaLink() {
    return "<a href='http://localhost:3000/cliente/3'>pegaLink!! todos os clientes</a>"  
}

// function dadosPG() {
//     var pg = require('pg');
//     //or native libpq bindings
//     //var pg = require('pg').native
//     var dados = "nada pra começar"
//     var urlPG = process.env.DATABASE_URL;
//     var conString =  urlPG //Can be found in the Details page
//     var client = new pg.Client(conString);
//     client.connect(function(err) {
//         if(err) {
//             return console.error('could not connect to postgres', err);
//         }
//         client.query('SELECT * FROM "public"."produtos" LIMIT 100', function(err, result) {
//             if(err) {
//                 return console.error('error running query', err);
//             }
//             console.log(result.rows[1]);
//             console.table(result.rows[1].produto)
//             dados = result.rows[1].produto;
//             client.end();

//         });
    
//     });

//     return dados
// }

async function dadosPG() {
    const pg = require('pg');
    const urlPG = process.env.DATABASE_URL;
    const conString = urlPG;

    const client = new pg.Client(conString);

    try {
        await client.connect();

        const result = await client.query('SELECT * FROM "public"."contatos" LIMIT 100');

        console.log(result.rows[1]);
        //console.table(result.rows[1].produto);
        //const dados = result.rows[1].produto;
        const dados = result.rows //[1].valor;

        return dados;
    } catch (error) {
        console.error('Erro ao buscar dados do PostgreSQL:', error);
        return "Erro ao buscar dados do PostgreSQL";
    } finally {
        await client.end();
    }
}
