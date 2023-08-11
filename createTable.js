const btnToggleDetailsElem = document.querySelector("#btn-toggle-details");
const promptTableElem = document.querySelector("#prompt-table");
let hiddenElemList;

btnToggleDetailsElem.addEventListener("click", detailsToggle);

createTable(promptTableElem);

async function getJsonData() {
    response = await fetch("phraseData.json");
    const { phrases } = await response.json();

    return phrases;
}

function detailsToggle() {
    for (const hiddenElem of hiddenElemList) {
        hiddenElem.classList.toggle("hide");
    }
    btnToggleDetailsElem.textContent = (btnToggleDetailsElem.textContent === "Show Details") ? "Hide Details" : "Show Details";
}

async function createTable(tableElem) {
    const phrases = await getJsonData();
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
        const textStats = new textstatistics(phrase);

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

        let syllableCountTotal = 0;
        let debugText = "";
        textStats.text.split(/\s+/).forEach((word) => {
            syllableCount = textStats.syllableCount(word);
            syllableCountTotal += syllableCount;
            debugText += `${word}[${syllableCount}] `;
        });
        td.textContent = syllableCountTotal;
        tr.appendChild(td);

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
        td.textContent = phrase;
        tr.appendChild(td);

        td = tr.insertCell();
        td.className += "hide";
        td.innerHTML = debugText;
        tr.appendChild(td);
    }

    hiddenElemList = document.querySelectorAll(".hide");
}