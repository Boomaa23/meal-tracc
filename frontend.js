window.onload = function() {
    createMainTable();
    populateMainTable();
    backendRequest("get", "", getAllCallback, 1);
}

function getAllCallback(respText) {
    var respLines = respText.split("\n");
    for (var r = 0; r < Math.min(3, respLines.length); r++) {
        var respRecords = respLines[r].split(",");
        for (var c = 0; c < respRecords.length; c++) {
            const inSel = "select[id=\"" + r + "-" + c + "\"]";
            var input = document.querySelector(inSel);
            input.value = respRecords[c];
        }
    }
}

function updateMeal(e) {
    backendRequest("update", [ e.id, e.value ]);
}

function archiveMeals() {
    backendRequest("archive", "", deselectAllMeals);
}

function deselectAllMeals() {
    var selects = document.getElementsByTagName("select");
    for (var i = 0; i < selects.length; i++) {
        selects[i].selectedIndex = 0;
    }
}

function resetMeals() {
    backendRequest("reset", "", deselectAllMeals);
}

class StatsAccumulator {
    constructor() {
        this.mealsByDay = [0, 0, 0, 0, 0, 0, 0];
        this.dhMBD = [0, 0, 0, 0, 0, 0, 0];
        this.outMBD = [0, 0, 0, 0, 0, 0, 0];
        this.noneMBD = [0, 0, 0, 0, 0, 0, 0];
    }

    addMeal(source, dayIdx) {
        source = source.trim();
        if (source !== "") {
            this.mealsByDay[dayIdx]++;
        }
        switch (source) {
            case "dining-hall":
                this.dhMBD[dayIdx]++;
                break;
            case "outside":
                this.outMBD[dayIdx]++;
                break;
            case "not-eaten":
                this.noneMBD[dayIdx]++;
                break;
        }
    }

    calcMealPct(data, total) {
        const pct = Math.round((data / total) * 100);
        return isNaN(pct) ? 0 : pct;
    }

    reformatData() {
        for (var i = 0; i < 7; i++) {
            const dayTotal = this.mealsByDay[i];
            this.dhMBD[i] = this.calcMealPct(this.dhMBD[i], dayTotal) + "%";
            this.outMBD[i] = this.calcMealPct(this.outMBD[i], dayTotal) + "%";
            this.noneMBD[i] = this.calcMealPct(this.noneMBD[i], dayTotal) + "%";
        }
        this.mealsByDay.unshift("Total");
        this.dhMBD.unshift("Dining Hall");
        this.outMBD.unshift("Outside");
        this.noneMBD.unshift("Not Eaten");
    }
}

function analyzeData(btn) {
    backendRequest("get", "", function(respText) {
        var respLines = respText.split("\n");
        if (respLines.length <= 3) {
            return;
        }
        var pastDataDiv = document.getElementById("past-data");
        var weekTableTemplate = document.getElementById("week-table-template");
        var pastDataTable = weekTableTemplate.content.cloneNode(true);
        var pastDataBody = pastDataTable.querySelector("tbody");

        var statsAcc = new StatsAccumulator();
        for (var r = 3; r < respLines.length; r++) {
            var respRecords = respLines[r].split(",");
            var tableRow = document.createElement("tr");
            for (var c = 0; c < respRecords.length; c++) {
                var cell = document.createElement("td");
                cell.innerText = respRecords[c];
                tableRow.appendChild(cell);
                statsAcc.addMeal(respRecords[c], c);
            }
            pastDataBody.appendChild(tableRow);
        }

        var statsContainer = document.getElementById("stats-table");
        var statsTable = weekTableTemplate.content.cloneNode(true);
        statsTable.querySelector("tr").prepend(document.createElement("th"))
        var statsBody = statsTable.querySelector("tbody");

        statsAcc.reformatData();
        statsBody.appendChild(makeTableRow(statsAcc.dhMBD));
        statsBody.appendChild(makeTableRow(statsAcc.outMBD));
        statsBody.appendChild(makeTableRow(statsAcc.noneMBD));
        statsBody.appendChild(makeTableRow(statsAcc.mealsByDay));

        statsTable.appendChild(document.createElement("br"))
        statsContainer.appendChild(statsTable);

        pastDataDiv.appendChild(statsContainer);
        pastDataDiv.appendChild(pastDataTable);

        document.getElementById("stats-top").style.display = "block";
        btn.disabled = true;
    }, 1);
}

function makeTableRow(cells) {
    var row = document.createElement("tr");
    var col = document.createElement("td");
    for (var i = 0; i < cells.length; i++) {
        col.innerText = cells[i];
        row.appendChild(col.cloneNode(true));
    }
    return row
}

function collapseData() {
    var tableContainer = document.getElementById("past-data");
    if (tableContainer.style.display === "none") {
        tableContainer.style.display = "block";
    } else {
        tableContainer.style.display = "none";
    }
}

function createMainTable() {
    var tableLoc = document.getElementById("main-table");
    var tableTemplate = document.getElementById("week-table-template");
    tableLoc.appendChild(tableTemplate.content.cloneNode(true));
}

function populateMainTable() {
    var tbody = document.getElementsByTagName("tbody")[0];
    
    for (var i = 0; i < 3; i++) {
        var row = document.createElement("tr");
        for (var j = 0; j < 7; j++) {
            var cell = document.createElement("td");
            var cInput = document.getElementById("input-template").content.cloneNode(true);
            cInput = cInput.querySelector("select");
            cInput.setAttribute("onchange", "updateMeal(this);");
            cInput.setAttribute("id", i + "-" + j);
            cell.appendChild(cInput);
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
}

// logLevel (inclusive): 0 = none,  1 = endpoint/data/url, 2 = response
function backendRequest(endpoint, data, callback = null, logLevel = 2) {
    var xhr = new XMLHttpRequest();
    var url = "backend.php?endpoint=" + encodeURIComponent(endpoint);
    if (data !== null) {
        url += "&data=" + btoa(encodeURIComponent(data));
    }
    if (logLevel >= 1) {
        console.log("\n");
        console.log(endpoint + ": " + data);
        console.log(url);
    }
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status === 200) {
            if (logLevel >= 2) {
                console.log(xhr.responseText);
            }
            if (callback !== null) {
                callback(xhr.responseText);
            }
        } else {
            console.error("Request to backend " + method + " " + url + " responded with " + xhr.status);
        }
    }
}