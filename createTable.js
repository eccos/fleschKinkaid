const wordSyllables = getJsonData("wordDict.json");
const { phrases } = getJsonData("promptData.json");
// const phrases = promptData.phrases;

const btnToggleDetailsElem = document.querySelector("#btn-toggle-details");
const promptTableElem = document.querySelector("#prompt-table");
const hiddenDetailsElemList = document.querySelectorAll(".hide");

btnToggleDetailsElem.addEventListener("click", detailsToggle);

// TODO: check if promise is complete before table creation
createTable(promptTableElem, phrases);

async function getJsonData(url) {
    const response = await fetch(url);
    const jsonData = await response.json();
    console.log(jsonData);
    return jsonData;
}

function detailsToggle() {
    hiddenDetailsElemList.classList.toggle("hide");
    btnToggleDetailsElem.textContent = (btnToggleDetailsElem.textContent === "Show Details") ? "Hide Details" : "Show Details";
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
                th.className += "hide";
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
        td.className += "hide";
        td.style.textAlign = "center";
        td.textContent = textStats.sentenceCount();
        tr.appendChild(td);

        td = tr.insertCell();
        td.className += "hide";
        td.style.textAlign = "center";
        td.textContent = textStats.wordCount();
        tr.appendChild(td);

        td = tr.insertCell();
        td.className += "hide";
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
        td.className += "hide";
        td.innerHTML = textStats.debugText;
        textStats.debugText = "";
        tr.appendChild(td);
    }
}

function stripHTML(text) {
    const div = document.createElement("div");
    div.innerHTML = text;
    text = div.textContent || div.innerText || "";
    text = text.replace(/\\n/g, " ");	//old new line command
    return text;
}

function getSyllableCount(searchWord, wordSyllables) {
    if (wordSyllables.hasOwnProperty(searchWord)) {
        return wordSyllables[searchWord];
    }
    return false;
}
