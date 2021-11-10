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

function analyzeData(btn) {
    //TODO calculate statistics and display, with graphs?
    backendRequest("get", "", function(respText) {
        var respLines = respText.split("\n");
        if (respLines.length <= 3) {
            return;
        }
        var pastData = document.getElementById("past-data");
        var tableTemplate = document.getElementById("week-table-template");
        var clonedTable = tableTemplate.content.cloneNode(true);
        var tbody = clonedTable.querySelector("tbody");

        for (var r = 3; r < respLines.length; r++) {
            var respRecords = respLines[r].split(",");
            var tableRow = document.createElement("tr");
            for (var c = 0; c < respRecords.length; c++) {
                var cell = document.createElement("td");
                cell.innerText = respRecords[c];
                tableRow.appendChild(cell);
            }
            tbody.appendChild(tableRow);
        }
        pastData.appendChild(clonedTable);

        document.getElementById("collapse-data-past").style.display = "inline";
        btn.disabled = true;
    }, 1);
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