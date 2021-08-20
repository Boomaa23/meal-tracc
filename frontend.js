window.onload = function() {
    populateTable();
    backendRequest("get", "", getAllCallback);
}

function getAllCallback(respText) {
    var respCsv = respText.split(",");
    for (var i = 0; i < respCsv.length; i++) {
        const inSel = "select[id=\"" + Math.floor(i / 7) + "-" + (i % 7) + "\"]";
        var input = document.querySelector(inSel);
        input.value = respCsv[i];
    }
}

function updateMeal(e) {
    backendRequest("update", [ e.id, e.value ]);
}

function populateTable() {
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