const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2310-FSA-ET-WEB-PT-SF';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players`;
const DOGIMGAPI = 'https://dog.ceo/api/breeds/image/random';

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
        const response = await fetch(`${APIURL}`);
        const players = await response.json();
        // console.log(players)
        return players;
    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
    }
};

const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}/${playerId}`);
        const player = await response.json();
        return player;
    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};

const addNewPlayer = async (playerObj) => {
    try {
        const dog_img = await fetch(DOGIMGAPI);
        const dog_content = await dog_img.json();
        const dog_breed = dog_content["message"].split("/")[4];
        const response = await fetch(APIURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify( {
                name: playerObj,
                breed: `${dog_breed}`,
                imageUrl: `${dog_content["message"]}`
            }),
        });
        const newPlayer = await response.json();
        return newPlayer;
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};

const removePlayerFromRoster = async (playerId) => {
    try {
        // Send a DELETE request to remove the player
        const response = await fetch(`${APIURL}/${playerId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log(`Player #${playerId} removed from the roster.`);

            // Fetch and render updated player list after removal
            const updatedPlayers = await fetchAllPlayers();
            renderAllPlayers(updatedPlayers);
        } else {
            console.error(`Error removing player #${playerId}. Status: ${response.status}`);
        }
    } catch (err) {
        console.error('Error removing player from roster:', err);
    }
};
// const removePlayer = async(playerId) => {
//     try {
//         const response = await fetch(`${APIURL}/${playerId}`, {
//             method: 'DELETE',
//         });
//         return response;
//     }
//     catch (err) {
//         return null;
//     }
// }

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 *
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
///////my code 
const renderAllPlayers = (playerList) => {
    try {
        playerList = playerList["data"]["players"];
        if (!Array.isArray(playerList)) {
            console.error('Uh oh, playerList is not an array:', playerList);
            return;
        }

        let playerContainerHTML = '';
        playerList.forEach((player) => {
            playerContainerHTML += `
                <div class="player-card">
                    <h3>${player.name}</h3>
                    <p>Player ID: ${player.id}</p>
                    <img src=${player.imageUrl} alt=${player.name} width="300" height="250">
                    <div id=${player.id}></div>
                    <button onclick="seePlayerDetails(${player.id})">See Details</button>
                    <button onclick="removePlayerFromRoster(${player.id})">Remove from Roster</button>
                </div>
            `;
        });
        playerContainer.innerHTML = playerContainerHTML;
    } catch (err) {
        console.error('Uh oh, trouble rendering players!', err);
    }
};

const renderNewPlayerForm = () => {
    try {
        newPlayerFormContainer.innerHTML = `
            <form id="playerForm">
                <label for="playerName">Player Name:</label>
                <input type="text" id="playerName" name="playerName" required>
                <button type="submit">Add Player</button>
            </form>
        `;

        document.getElementById('playerForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            const playerName = document.getElementById('playerName').value;
            const newPlayer = await addNewPlayer(playerName);

            const updatedPlayers = await fetchAllPlayers();
            renderAllPlayers(updatedPlayers);
        });
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
};

const seePlayerDetails = async (playerId) => {
    const player = await fetchSinglePlayer(playerId);
    // console.log(player);
    const breed = player["data"]["player"]["breed"];
    const cohortId = player["data"]["player"]["cohortId"];
    const status = player["data"]["player"]["status"];

    const html = `
    <h3>Breed: ${breed}</h3>
    <h3>Cohort ID: ${cohortId}</h3>
    <h3>Status: ${status}</h3>
    `;

    document.getElementById(`${playerId}`).innerHTML = html;
    console.log(`Details for Player #${playerId}:`, player);
};

const init = async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players);

    renderNewPlayerForm();
}

init();

1