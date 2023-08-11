const wordSyllables = getJsonData("wordDict.json");
const { phrases } = getJsonData("promptData.json");

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

function createTable(tableElem, phrases) {
    const tbl = tableElem;
    let th, tr, td, a = {};
    const keys = ["S", "W", "Y", "Grade", "Phrase", "Syllable Count"];
    const detailKeys = ["S", "W", "Y", "Syllable Count"];
    let grade = 0;
    let bgcolor = "";

    if (phrases.length > 0) {
        tr = tbl.insertRow();
        for (const key of keys) {
            th = document.createElement("th");
            if (detailKeys.includes(key)) {
                th.className += "hide";
            }
            th.textContent = key;
            tr.appendChild(th);
        }
    }

    for (const phrase of phrases) {
        const textStats = new textstatistics(phrase.phrase);

        tr = tbl.insertRow();

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
        td.textContent = phrase.phrase;
        tr.appendChild(td);

        td = tr.insertCell();
        td.className += "hide";
        td.innerHTML = textStats.debugText;
        textStats.debugText = "";
        tr.appendChild(td);
    }
}