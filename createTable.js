/*
Get Word Syllable List JSON
*/
var xmlhttp = new XMLHttpRequest();
var url = "wordDict.txt";
xmlhttp.open("GET", url, false);
xmlhttp.send();
var WordSyllables = JSON.parse(xmlhttp.responseText);

/*
Custom Functions
*/
function getSyllableCount(searchWord, WordSyllables) {
    if (WordSyllables.hasOwnProperty(searchWord)) return WordSyllables[searchWord];
    return false;
}

function stripHTML(text) {
    var div = document.createElement("div");
    div.innerHTML = text;
    text = div.textContent || div.innerText || "";
    text = text.replace(/\\n/g, " ");	//old new line command
    return text;
}

function ajax(command, logFlag) {
    // Get browser appropriate ajax handle
    var xmlhttp; if (window.XMLHttpRequest) { xmlhttp = new XMLHttpRequest(); } else { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }
    xmlhttp.open("POST", "redacted.cfm?command=" + command, false);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send();
    var response = xmlhttp.responseText;
    if (logFlag == true) {
        console.log('AJAX CALL');
        console.log(command);
        console.log(response);
    }
    return response;
}

var flowId = 0;
var showingDetails = false;

var btnDetails = document.getElementById("details");
var lblDetails = document.getElementById("detailLegend");
var tblCols = document.getElementsByClassName("details");

function detailsToggle() {
    var str = "Show Details";

    if (showingDetails) {
        lblDetails.style.display = "none";
        for (var cell = 0; cell < tblCols.length; cell++) {
            tblCols[cell].style.display = "none";
        };
        showingDetails = false;
    }
    else {
        str = "Hide Details";
        lblDetails.style.display = "block";
        for (var cell = 0; cell < tblCols.length; cell++) {
            tblCols[cell].style.display = "table-cell";
        };
        showingDetails = true;
    }

    btnDetails.textContent = str;
}

var promptTable = document.getElementById("promptTable");
var fsuTable = document.getElementById("fsuTable");

var resp = "";
var keys = ["PageId", "StartP1", "PromptId", "VPrompt", "P1Plus", "SyllableCount"];

resp = ajax("getNodesOfType" + "&flow_id=" + flowId + "&node_type=Prompt");
var prompts = createDictArr(resp, "<br>", "|", keys);
createTable(promptTable, prompts, keys);

resp = ajax("getNodesOfType" + "&flow_id=" + flowId + "&node_type=FSU");
var fsus = createDictArr(resp, "<br>", "|", keys);
createTable(fsuTable, fsus, keys);

function createDictArr(list, rowDelimiter, fieldDelimiter, keys) {
    var dicts = [];
    var dict = {};
    var rows = [];
    var fields = [];

    rows = list.split(rowDelimiter);
    rows.pop(); //removing blank row at the end

    for (var x = 0; x < rows.length; x++) {
        fields = rows[x].split(fieldDelimiter);
        //new dict to not overwrite the one in memory
        dict = {};
        for (var y = 0; y < fields.length; y++) {
            dict[keys[y]] = fields[y];
        }
        dicts.push(dict);
    }
    return dicts;
}

function createTable(tableElem, dictArray) {
    var tbl = tableElem;
    var th = {};
    var tr = {};
    var td = {};
    var a = {};
    var dicts = dictArray;
    var keys = ["Unit", "S", "W", "Y", "Grade", "ID", "Phrase", "Syllable Count"];
    var textStats = new TextStatistics();
    var grade = 0;
    var bgcolor = "";

    if (dicts.length > 0) {
        tr = tbl.insertRow();
        for (var x = 0; x < keys.length; x++) {
            th = document.createElement("th");
            if (x >= 1 && x <= 3 || x == 7) {
                th.className += "details";
            }
            th.textContent = keys[x];
            tr.appendChild(th);
        }
    }

    for (var x = 0; x < dicts.length; x++) {
        tr = tbl.insertRow();

        td = tr.insertCell();
        a = document.createElement("a");
        a.href = "redacted.cfm?flow_id=0&page_id=" + dicts[x].PageId + "&node_id=" + dicts[x].PromptId;
        a.textContent = dicts[x].StartP1.replace(/<[^>]+>/g, "");
        td.appendChild(a);
        tr.appendChild(td);

        textStats.setText(dicts[x].P1Plus);

        td = tr.insertCell();
        td.className += "details";
        td.style.textAlign = "center";
        td.textContent = textStats.sentenceCount();
        tr.appendChild(td);

        td = tr.insertCell();
        td.className += "details";
        td.style.textAlign = "center";
        td.textContent = textStats.wordCount();
        tr.appendChild(td);

        td = tr.insertCell();
        td.className += "details";
        td.style.textAlign = "center";

        var syllableCount = 0;
        textStats.text.split(/\s+/).forEach(function (word) {
            syllableCount += textStats.syllableCount(word);
        });
        td.textContent = syllableCount;
        tr.appendChild(td);

        textStats.debugText = "";

        td = tr.insertCell();
        td.style.textAlign = "center";
        grade = textStats.fleschKincaidGradeLevel();
        //Colors: Green (below 7th grade/Spoken Text); Yellow (below 10th grade/Written Text; Red (10th grade and higher)
        if (grade >= 10) bgcolor = "orangered";
        if (grade < 10) bgcolor = "yellow";
        if (grade < 7) bgcolor = "lime";
        td.style.background = bgcolor;
        td.textContent = grade;
        tr.appendChild(td);

        td = tr.insertCell();
        td.style.width = "80px";
        td.style.textAlign = "center";
        td.textContent = dicts[x].VPrompt;
        tr.appendChild(td);

        td = tr.insertCell();
        td.textContent = stripHTML(dicts[x].P1Plus);
        tr.appendChild(td);

        td = tr.insertCell();
        td.className += "details";
        td.innerHTML = textStats.debugText;
        textStats.debugText = "";
        tr.appendChild(td);
    }
}