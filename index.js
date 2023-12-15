const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database(":memory:");

// o id está vindo nulo de cada gato e cachorro, consertei deixando ele ser autoincrementado pela tabela, além de se tornar um elemento referenciador, ou seja, PK

db.serialize(() => {
  db.run("CREATE TABLE cats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, votes INT)");
  db.run("CREATE TABLE dogs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, votes INT)");
});

// utilização de parâmetros para evitar SQL Injection
app.post("/cats", (req, res) => {
  const name = req.body.name;
  db.run(
    "INSERT INTO cats (name, votes) VALUES (?, 0)",
    [name],
    function (err) {
      if (err) {
        res.status(500).send("Erro ao inserir no banco de dados");
      } else {
        res.status(201).json({ id: this.lastID, name, votes: 0 });
      }
    }
  );
});

app.post("/dogs", (req, res) => {
  const name = req.body.name;
  db.run(
    "INSERT INTO dogs (name, votes) VALUES (?, 0)",
    [name],
    function (err) {
      if (err) {
        res.status(500).send("Erro ao inserir no banco de dados");
      } else {
        res.status(201).json({ id: this.lastID, name, votes: 0 });
      }
    }
  );
});

app.post("/vote/:animalType/:id", (req, res) => {
  const animalType = req.params.animalType;
  const id = req.params.id;

  // Verificar se o registro do animal existe antes de adicionar um voto
  const tableName = animalType === "cats" ? "cats" : "dogs";
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
});

app.get('/dogs', (req, res) => {
  db.all("SELECT * FROM dogs", [], (err, rows) => {
    if (err) {
      res.status(500).send("Erro ao consultar o banco de dados");
    } else {
      res.json(rows);
    }
  });
});
app.get('/cats', (req, res) => {
  db.all("SELECT * FROM cats", [], (err, rows) => {
    if (err) {
      res.status(500).send("Erro ao consultar o banco de dados");
    } else {
      res.json(rows);
    }
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Ocorreu um erro interno!");
});

app.listen(port, () => {
  console.log(`Cats and Dogs Vote app listening at http://localhost:${port}`);
});
