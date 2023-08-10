const url = "wordDict.json";
const wordSyllables = getWordSyllables(url);

async function getWordSyllables(url) {
    const response = await fetch(url);
    const wordSyllables = await response.json();
    console.log(wordSyllables);
    return wordSyllables;
}

function getSyllableCount(searchWord, wordSyllables) {
    if (wordSyllables.hasOwnProperty(searchWord)) {
        return wordSyllables[searchWord];
    }
    return false;
}

function stripHTML(text) {
    const div = document.createElement("div");
    div.innerHTML = text;
    text = div.textContent || div.innerText || "";
    text = text.replace(/\\n/g, " ");	//old new line command
    return text;
}

let showingDetails = false;
const btnDetails = document.querySelector("#details");
const lblDetails = document.querySelector("#detailLegend");
const hiddenDetails = document.querySelectorAll(".hide-details");

function detailsToggle() {
    lblDetails.classList.toggle("hide-details");
    hiddenDetails.classList.toggle("hide-details");
    let str = "Show Details";

    if (showingDetails) {
        lblDetails.style.display = "none";
        // for (let cell = 0; cell < tblCols.length; cell++) {
        //     tblCols[cell].style.display = "none";
        // };
        showingDetails = false;
    }
    else {
        str = "Hide Details";
        lblDetails.style.display = "block";
        // for (let cell = 0; cell < tblCols.length; cell++) {
        //     tblCols[cell].style.display = "table-cell";
        // };
        showingDetails = true;
    }

    btnDetails.textContent = str;
}

const promptTable = document.querySelector("#promptTable");
const fsuTable = document.querySelector("#fsuTable");

let resp = "";
const keys = ["PageId", "StartP1", "PromptId", "VPrompt", "P1Plus", "SyllableCount"];

resp = ajax("getNodesOfType" + "&flow_id=" + flowId + "&node_type=Prompt");
const prompts = createDictArr(resp, "<br>", "|", keys);
createTable(promptTable, prompts, keys);

resp = ajax("getNodesOfType" + "&flow_id=" + flowId + "&node_type=FSU");
const fsus = createDictArr(resp, "<br>", "|", keys);
createTable(fsuTable, fsus, keys);

function createDictArr(list, rowDelimiter, fieldDelimiter, keys) {
    let dicts = [];
    let dict = {};
    let rows, fields = [];

    rows = list.split(rowDelimiter);
    rows.pop(); //removing blank row at the end

    for (let x = 0; x < rows.length; x++) {
        fields = rows[x].split(fieldDelimiter);
        //new dict to not overwrite the one in memory
        dict = {};
        for (let y = 0; y < fields.length; y++) {
            dict[keys[y]] = fields[y];
        }
        dicts.push(dict);
    }
    return dicts;
}

function createTable(tableElem, dictArray) {
    const tbl = tableElem;
    let th, tr, td, a = {};
    const dicts = dictArray;
    const keys = ["Unit", "S", "W", "Y", "Grade", "ID", "Phrase", "Syllable Count"];
    const detailKeys = ["S", "W", "Y", "Syllable Count"];
    const textStats = new TextStatistics();
    let grade = 0;
    let bgcolor = "";

    if (dicts.length > 0) {
        tr = tbl.insertRow();
        for (let x = 0; x < keys.length; x++) {
            th = document.createElement("th");
            if (detailKeys.includes(keys[x])) {
                th.className += "hide-details";
            }
            th.textContent = keys[x];
            tr.appendChild(th);
        }
    }

    for (let x = 0; x < dicts.length; x++) {
        tr = tbl.insertRow();

        td = tr.insertCell();
        a = document.createElement("a");
        a.href = "redacted.cfm?flow_id=0&page_id=" + dicts[x].PageId + "&node_id=" + dicts[x].PromptId;
        a.textContent = dicts[x].StartP1.replace(/<[^>]+>/g, "");
        td.appendChild(a);
        tr.appendChild(td);

        textStats.setText(dicts[x].P1Plus);

        td = tr.insertCell();
        td.className += "hide-details";
        td.style.textAlign = "center";
        td.textContent = textStats.sentenceCount();
        tr.appendChild(td);

        td = tr.insertCell();
        td.className += "hide-details";
        td.style.textAlign = "center";
        td.textContent = textStats.wordCount();
        tr.appendChild(td);

        td = tr.insertCell();
        td.className += "hide-details";
        td.style.textAlign = "center";

        let syllableCount = 0;
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
        td.className += "hide-details";
        td.innerHTML = textStats.debugText;
        textStats.debugText = "";
        tr.appendChild(td);
    }
}