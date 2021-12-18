getInfo();

async function getInfo() {
    //create info
    let root = document.getElementById('servers');
    
    for (let i = 0; i < servers.length; i++) {
        let server = document.getElementById("server-template").content.cloneNode(true);  
        let main = server.getElementById("server-info-main").rows[1];
        root.appendChild(server);
    }

    for (let i = 0; i < servers.length; i++) {
        let requestURL = servers[i]+'/json';

        fetch(requestURL)
            .then(response => response.json())
            .then(req => updateServer(req, i))
            .catch(() => removeServer(i));
    }
}

function removeServer(i) {
    let server = document.getElementsByClassName("server-line")[i];
    server.innerHTML = "Сервер #" + ++i + " не отвечает :С";
}

function updateServer(req, i) {
    let server = document.getElementsByClassName("server-line")[i];
    server.querySelector("#map").innerHTML = 
        '<img src="' + servers[i] + '/overview" alt="Карта не загрузилась :С">';
    server.querySelector("#maxScore").title += req.scores.maxScore;
        
    let main = server.querySelector("#server-info-main").rows[1];
    main.cells[0].innerHTML = "<a href="+req.serverIdentifier+">Прекратить гоношиться</a>";
    main.cells[1].innerHTML = fTime(req.serverUptime);
    main.cells[2].innerHTML = req.gameMode;
    main.cells[3].innerHTML = req.scores.currentBlueScore + ":" + req.scores.currentGreenScore;
    main.cells[4].innerHTML += req.map.name + " " + req.map.version + " by " + req.map.author;
    
    let team1 = [];
    let team2 = [];
    let spec = [];
    for (let p = 0; p < req.players.length; p++) {
        let player = req.players[p];
        if (player.team == "2ch") team1.push(player);
        if (player.team == "0chan") team2.push(player);
        if (player.team == "Spectator") spec.push(player);
    }
    
    sortByKill(team1);
    sortByKill(team2);
    
    let s = server.querySelector("#spectators");
    if (spec.length == 0) {
        s.innerHTML += "никого...";
    } else {
        for (let p = 0; p < spec.length-1; p++) {
            s.innerHTML += spec[p].name + "; ";
        }
        s.innerHTML += spec[spec.length-1].name + ".";
    }


    for (let p = 0; p < team1.length; p++) {
        let rowNode = document.getElementById("row-template").content.cloneNode(true);
        let row = rowNode.children[0];
        row.cells[0].innerHTML = team1[p].name;
        row.cells[1].innerHTML = tinyVersion(team1[p].client);
        row.cells[2].innerHTML = team1[p].latency;
        row.cells[3].innerHTML = team1[p].kills;
        row.cells[4].innerHTML = team1[p].ratio;
        row.cells[5].innerHTML = team1[p].accuracy;
        row.cells[6].innerHTML = fTime(team1[p].uptime);
        
        server.querySelector("#server-info-players-1").tBodies[0].appendChild(rowNode);
    }

    for (let p = 0; p < team2.length; p++) {
        let rowNode = document.getElementById("row-template").content.cloneNode(true);
        
        let row = rowNode.children[0];
        row.cells[0].innerHTML = team2[p].name;
        row.cells[1].innerHTML = tinyVersion(team2[p].client);
        row.cells[2].innerHTML = team2[p].latency;
        row.cells[3].innerHTML = team2[p].kills;
        row.cells[4].innerHTML = team2[p].ratio;
        row.cells[5].innerHTML = team2[p].accuracy;
        row.cells[6].innerHTML = fTime(team2[p].uptime);
        
        server.querySelector("#server-info-players-2").tBodies[0].appendChild(row);
    }
}

function tinyVersion(str) {
    if (str.includes("Voxlap")) return "Voxlap";
    if (str.includes("OpenSpades")) return "OS";
    if (str.includes("BetterSpades")) return "BS";
    return str;
}

function sortByKill(arr) {
    arr.sort((a, b) => a.kills > b.kills ? -1 : 1);
}

function fTime(sec) {
    return new Date(sec * 1000).toISOString().substr(11, 8);
}