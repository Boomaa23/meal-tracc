window.onload = function() {
    createMainTable();
    populateMainTable();
    backendRequest("get", "", getAllCallback);
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
    backendRequest("archive", "", archiveMealsCallback);
}

function archiveMealsCallback(respText) {
    var selects = document.getElementsByTagName("select");
    for (var i = 0; i < selects.length; i++) {
        selects[i].selectedIndex = 0;
    }
}

function analyzeMeals() {
    //TODO generate collapsable table with all past elements as data, copy from template
    //TODO calculate statistics and display, with graphs?
}

function createMainTable() {
    //TODO use template to generate main table
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

function backendRequest(endpoint, data, callback = null, doLog = true) {
    var xhr = new XMLHttpRequest();
    var url = "backend.php?endpoint=" + encodeURIComponent(endpoint);
    if (data !== null) {
        url += "&data=" + btoa(encodeURIComponent(data));
    }
    if (doLog) {
        console.log("\n");
        console.log(endpoint + ": " + data);
        console.log(url);
    }
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status === 200) {
            if (doLog) {
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