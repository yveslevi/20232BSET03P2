# 20232BSET03P2
Inteli - Engenharia de Software | Avaliação 2023-2B P2

## Para instalação das bibliotecas para rodar o código com mais eficiência, rodar:

npm install

Caso encontre, ainda assim, algum problema, rodar:

npm install body-parser express sqlite3

npm install nodemon -g

## Passada a etapa de instalação, temos a etapa de sanitizar e validar dados de entrada para evitar SQL Injection.

Para essa etapa, foi priorizada a utilização de parâmetros nas consultas SQL, com as seguintes alterações:

```
db.run(`INSERT INTO cats (name, votes) VALUES ('${name}', 0)`, function(err)) 
```

Para 
```
db.run(
    "INSERT INTO cats (name, votes) VALUES (?, 0)",
    [name],
    function (err))
```

O mesmo foi feito para a tabela dogs

Pegando, assim, o respectivo name do body da requisição, com auxílio da biblioteca body-parser.

## No que tange a correção da lógica de votação para que verifique se o registro do animal existe antes de adicionar um voto.

Nessa etapa, busquei por verificar os parâmetros da requisição, ou seja, consulta à tabela por meio da /:animalType

Deixando a primeira parte do código da seguinte maneira:

```
 const animalType = req.params.animalType;
```

Que, posteriormente iria se tornar em uma verificação a partir de:

```
const tableName = animalType === "cats" ? "cats" : "dogs";
```

A seguir, temos a correta classificação dos ID's, primeiro alterando a forma em que o banco de dados é formado, atrelando uma chave primária (PK) autoincremental ao ID da tabela, eliminando o erro que dava ao você buscar pelo respectivo name quando iria atribuir votos

```
db.serialize(() => {
  db.run("CREATE TABLE cats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, votes INT)");
  db.run("CREATE TABLE dogs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, votes INT)");
});
```

Em seguida, utilizei dos parâmetros para a consulta certa do id e da respectiva tabela que seria mapeada
```
db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(500).send("Erro ao consultar o banco de dados");
    } else if (!row) {
      res.status(404).send("Animal não encontrado");
    } else {
      db.run(
        `UPDATE ${tableName} SET votes = votes + 1 WHERE id = ?`,
        [id],
        (err) => {
          if (err) {
            res.status(500).send("Erro ao atualizar o banco de dados");
          } else {
            res.status(200).send("Voto computado");
          }
        }
      );
    }
  });
```

## Etapa para implementar e tratar erros de maneira adequada, sem vazar detalhes de implementação.

Perceba que em todos os trechos de código que tenho atualizado sempre busquei por colocar logs como "Erro ao atualizar banco de dados", "Erro ao consultar banco de dados", entre outros. Estes conseguem mostrar o que olhar em caso de erro, assegurando uma informação com certa qualidade, sem mostrar de fato como está sendo implementada a lógica por trás.

## Assinatura de código

Nessa etapa busquei por trazer a verificação das tabelas existentes de forma individualizada, com a correta introdução do método [GET] que permite a visualização de gatos, cachorros, seus respectivos IDs e votos.

## Resumo das vulnerabilidades identificadas e alterações

**SQL Injection:**

Vulnerabilidade: O código original permitia a execução de SQL Injection, pois as consultas SQL eram construídas diretamente com valores não sanitizados a partir dos dados de entrada do usuário.

Medida Adotada: Corrigi isso utilizando parâmetros nas consultas SQL, o que impede a execução de código SQL malicioso inserido pelo usuário. Os parâmetros são devidamente escapados pelo driver do SQLite, garantindo a segurança contra SQL Injection.

**Chaves Primárias e Autoincremento:**

Vulnerabilidade: As tabelas cats e dogs não tinham chaves primárias autoincrementadas, o que poderia resultar em IDs não únicos e causar problemas na integridade dos dados.

Medida Adotada: Corrigi a estrutura da tabela para incluir chaves primárias autoincrementadas. Isso garante que cada registro tenha um ID exclusivo, evitando conflitos e garantindo a integridade dos dados.

**Lógica de Votação e Verificação de Animal Existente:**

Vulnerabilidade: A lógica de votação não verificava se o registro do animal existia antes de adicionar um voto, podendo resultar em atualizações incorretas ou em respostas 404 não tratadas corretamente.

Medida Adotada: Adicionei uma verificação prévia utilizando uma consulta SELECT para garantir que o animal exista antes de permitir a atualização dos votos. Isso evita operações desnecessárias e melhora a robustez da aplicação.

**Tratamento Adequado de Erros:**

Vulnerabilidade: O tratamento de erros no middleware poderia vazar detalhes de implementação, tornando-se uma possível fonte de informações sensíveis para um atacante.

Medida Adotada: Modifiquei o middleware de tratamento de erros para fornecer mensagens de erro mais genéricas, sem vazar detalhes de implementação. Isso ajuda a manter a segurança da aplicação, limitando a exposição de informações sensíveis.

