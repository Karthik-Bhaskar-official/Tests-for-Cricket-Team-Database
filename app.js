const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running http://localhost/3000/");
    });
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// GET

app.get("/players/", async (request, response) => {
  const getPlayerName = `
  SELECT 
    * 
  FROM 
    cricket_team;`;
  const playerArray = await db.all(getPlayerName);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// POST

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
  INSERT INTO 
    cricket_team (player_name, jersey_number, role)
  VALUES
    ('${playerName}', '${jerseyNumber}', '${role}');`;
  await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//GET

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerName = `
    SELECT 
      *
    FROM
      cricket_team
    WHERE 
      player_id = '${playerId}';`;
  const dbResponse = await db.get(getPlayerName);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

// PUT

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const putPlayerDetails = `
  UPDATE 
    cricket_team 
  SET
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
  WHERE
    player_id = '${playerId}';`;
  await db.run(putPlayerDetails);
  response.send("Player Details Updated");
});

// DELETE

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerName = `
    DELETE FROM
      cricket_team
    WHERE 
      player_id = '${playerId}';`;
  await db.run(getPlayerName);
  response.send("Player Removed");
});

module.exports = app;
