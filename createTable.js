const btnToggleDetailsElem = document.querySelector("#btn-toggle-details");
const promptTableElem = document.querySelector("#prompt-table");
let hiddenElemList;
const inpPhraseSect = document.querySelector("#input-phrase-section");
const textPhraseElem = document.querySelector("#text-phrase");

btnToggleDetailsElem.addEventListener("click", toggleDetails);
textPhraseElem.addEventListener("input", ({ target: { value: phrase } }) => {
    inpPhraseSect.textContent = "";
    if (!phrase || !phrase.trim()) return;
    const textStats = new textstatistics(phrase);
    const grade = textStats.fleschKincaidGradeLevel();

    let textNode;
    textNode = document.createTextNode(`Grade Level: ${grade}\n`);
    inpPhraseSect.appendChild(textNode);

    textNode = document.createTextNode(`Sentences: ${textStats.sentenceCount()}\n`);
    inpPhraseSect.appendChild(textNode);

    textNode = document.createTextNode(`Words: ${textStats.wordCount()}\n`);
    inpPhraseSect.appendChild(textNode);

    const [debugText, syllableCount] = formatStrWithSyllableCountForEachWord(phrase);
    textNode = document.createTextNode(`Syllables: ${syllableCount}\n`);
    inpPhraseSect.appendChild(textNode);

    textNode = document.createTextNode(`Syllables / Word: ${debugText}\n`);
    inpPhraseSect.appendChild(textNode);
});

createTable(promptTableElem);

async function getJsonData() {
    const response = await fetch("phraseData.json");
    const { phrases } = await response.json();

    return phrases;
}

function toggleDetails() {
    if (!hiddenElemList) return;
    for (const hiddenElem of hiddenElemList) {
        hiddenElem.classList.toggle("hide");
    }
    btnToggleDetailsElem.textContent = (btnToggleDetailsElem.textContent === "Show Details") ? "Hide Details" : "Show Details";
}

async function createTable(tableElem) {
    const phrases = await getJsonData();
    if (!phrases && phrases.length == 0) return;
    
    const tbl = tableElem;
    let th, tr, td, a = {};
    const keys = ["S", "W", "Y", "Grade", "Phrase", "Syllable / Word"];
    const detailKeys = ["S", "W", "Y", "Syllable / Word"];
    let grade = 0;
    let bgcolor = "";

    tr = tbl.insertRow();
    for (const key of keys) {
        th = document.createElement("th");
        if (detailKeys.includes(key)) {
            th.className += "hide";
        }
        th.textContent = key;
        tr.appendChild(th);
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

        const [debugText, syllableCountTotal] = formatStrWithSyllableCountForEachWord(phrase);
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

function formatStrWithSyllableCountForEachWord(phrase) {
    const textStats = new textstatistics(phrase);
    let syllableCount = 0;
    let syllableCountTotal = 0;
    let debugText = "";
    textStats.text.split(/\s+/).forEach((word) => {
        syllableCount = textStats.syllableCount(word);
        syllableCountTotal += syllableCount;
        debugText += `${word}[${syllableCount}] `;
    });
    return [debugText, syllableCountTotal];
}
