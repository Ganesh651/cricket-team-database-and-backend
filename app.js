const express = require("express");
const path = require("path");
const cors = require("cors");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("Server is running at http://localhost:4000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();


// POST API
app.post("/player/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES ("${playerName}", ${jerseyNumber}, "${role}");`;
  const dbResponse = await db.run(createPlayerQuery);
  const lastId = dbResponse.lastID;
  response.send(`Player Added To Team ${lastId}`);
});

// GET API
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `SELECT * FROM cricket_team;`;
  const dbResponse = await db.all(getAllPlayersQuery);
  const updatedResponse = dbResponse.map((each) => ({
    playerId: each.player_id,
    playerName: each.player_name,
    jerseyNumber: each.jersey_number,
    role: each.role,
  }));
  response.send(updatedResponse);
});

// GET Player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  console.log(playerId);
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const dbResponse = await db.get(getPlayerQuery);
  response.send({
    playerId: dbResponse.player_id,
    playerName: dbResponse.player_name,
    jerseyNumber: dbResponse.jersey_number,
    role: dbResponse.role,
  });
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const userDetails = request.body;
  const { playerName, jerseyNumber, role } = userDetails;

  const updateQuery = `UPDATE cricket_team SET player_name="${playerName}", jersey_number=${jerseyNumber}, role="${role}" WHERE player_id = ${playerId};`;
  const dbResponse = await db.run(updateQuery);
  response.send("Player Details Updated");
});

// DELETE API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  const dbResponse = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
