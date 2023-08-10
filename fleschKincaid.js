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
    xmlhttp.open("POST", "ajax.cfm?command=" + command, false);
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

/*
TextStatistics Object
*/
function cleanText(text) {
    text = stripHTML(text); //Better method of stripping tags

    // all these tags should be preceeded by a full stop. 
    var fullStopTags = ['li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dd'];

    fullStopTags.forEach(function (tag) {
        text = text.replace("</" + tag + ">", ".");
    })

    text = text
        .replace(/<[^>]+>/g, "")				// Strip tags
        .replace(/[,:;()/\-]/g, " ")			// Replace commas, hyphens etc (count them as spaces)
        .replace(/[.!?]/g, ".")					// Unify terminators
        .replace(/^\s+/, "")						// Strip leading whitespace
        .replace(/[ ]*(\n|\r\n|\r)[ ]*/g, " ")	// Replace new lines with spaces
        .replace(/([.])[.]+/g, "")				// Check for duplicated terminators (Remove ...)
        .replace(/([.])[. ]+/g, ".")				// Check for duplicated terminators (Reduce . . . to .)
        .replace(/[ ]*([.])/g, ". ")				// Pad sentence terminators
        .replace(/\s+/g, " ")					// Remove multiple spaces
        .replace(/\s+$/, "");					// Strip trailing whitespace

    return text;
}

var TextStatistics = function TextStatistics() {
    this.text = "";
    this.debugText = "";
};

TextStatistics.prototype.setText = function (text) {
    this.text = cleanText(text);
};

TextStatistics.prototype.fleschKincaidReadingEase = function (text) {
    text = text ? text : this.text;
    return Math.round((206.835 - (1.015 * this.averageWordsPerSentence(text)) - (84.6 * this.averageSyllablesPerWord(text))) * 10) / 10;
};

TextStatistics.prototype.fleschKincaidGradeLevel = function (text) {
    text = text ? text : this.text;
    var num = (0.39 * this.averageWordsPerSentence(text)) + (11.8 * this.averageSyllablesPerWord(text)) - 15.59;
    if (num < -3.4) num = -3.4; //Lowest score should be -3.4 according to wiki
    num = num.toFixed(1);
    return num;
};

TextStatistics.prototype.gunningFogScore = function (text) {
    text = text ? text : this.text;
    return Math.round(((this.averageWordsPerSentence(text) + this.percentageWordsWithThreeSyllables(text, false)) * 0.4) * 10) / 10;
};

TextStatistics.prototype.colemanLiauIndex = function (text) {
    text = text ? text : this.text;
    return Math.round(((5.89 * (this.letterCount(text) / this.wordCount(text))) - (0.3 * (this.sentenceCount(text) / this.wordCount(text))) - 15.8) * 10) / 10;
};

TextStatistics.prototype.smogIndex = function (text) {
    text = text ? text : this.text;
    return Math.round(1.043 * Math.sqrt((this.wordsWithThreeSyllables(text) * (30 / this.sentenceCount(text))) + 3.1291) * 10) / 10;
};

TextStatistics.prototype.automatedReadabilityIndex = function (text) {
    text = text ? text : this.text;
    return Math.round(((4.71 * (this.letterCount(text) / this.wordCount(text))) + (0.5 * (this.wordCount(text) / this.sentenceCount(text))) - 21.43) * 10) / 10;
};

TextStatistics.prototype.textLength = function (text) {
    text = text ? text : this.text;
    return text.length;
};

TextStatistics.prototype.letterCount = function (text) {
    text = text ? text : this.text;
    text = text.replace(/[^a-z]+/ig, "");
    return text.length;
};

TextStatistics.prototype.sentenceCount = function (text) {
    text = text ? text : this.text;
    // Will be tripped up by ellipses (...), "Mr." or "U.K.". Not a major concern at this point.
    return text.replace(/[^\.!?]/g, '').length || 1;
};

TextStatistics.prototype.wordCount = function (text) {
    text = text ? text : this.text;
    return text.split(/\s+/).length || 1;
};

TextStatistics.prototype.averageWordsPerSentence = function (text) {
    text = text ? text : this.text;
    return this.wordCount(text) / this.sentenceCount(text);
};

TextStatistics.prototype.averageSyllablesPerWord = function (text) {
    text = text ? text : this.text;
    var syllableCount = 0, wordCount = this.wordCount(text), self = this;

    text.split(/\s+/).forEach(function (word) {
        syllableCount += self.syllableCount(word);
    });

    // Prevent NaN...
    return (syllableCount || 1) / (wordCount || 1);
};

TextStatistics.prototype.wordsWithThreeSyllables = function (text, countProperNouns) {
    text = text ? text : this.text;
    var longWordCount = 0, self = this;

    countProperNouns = countProperNouns === false ? false : true;

    text.split(/\s+/).forEach(function (word) {

        // We don't count proper nouns or capitalised words if the countProperNouns attribute is set.
        // Defaults to true.
        if (!word.match(/^[A-Z]/) || countProperNouns) {
            if (self.syllableCount(word) > 2) longWordCount++;
        }
    });

    return longWordCount;
};

TextStatistics.prototype.percentageWordsWithThreeSyllables = function (text, countProperNouns) {
    text = text ? text : this.text;

    return (this.wordsWithThreeSyllables(text, countProperNouns) / this.wordCount(text)) * 100;
};

TextStatistics.prototype.syllableCount = function (word) {
    var syllableCount = 0,
        prefixSuffixCount = 0,
        wordPartCount = 0;

    this.debugText += " &nbsp;&nbsp;" + word + "[";

    // Prepare word - make lower case and remove non-word characters
    word = word.toLowerCase().replace(/[^a-z]/g, "");

    // Get syllable count from the JSON list. If not found, then continue
    var res = getSyllableCount(word, WordSyllables);
    if (res != false) {
        this.debugText += res + ".]" + " ";
        return res;
    }

    // Specific common exceptions that don't follow the rule set below are handled individually
    // Array of problem words (with word as key, syllable count as value)
    var problemWords = {
        "simile": 3,
        "forever": 3,
        "shoreline": 2
    };

    // Return if we've hit one of those...
    if (problemWords.hasOwnProperty(word)) {
        this.debugText += problemWords[word] + "]" + " ";
        return problemWords[word];
    }

    // These syllables would be counted as two but should be one
    var subSyllables = [
        /cial/,
        /tia/,
        /cius/,
        /cious/,
        /giu/,
        /ion/,
        /iou/,
        /sia$/,
        /[^aeiuoyt]{2,}ed$/,
        /.ely$/,
        /[cg]h?e[rsd]?$/,
        /rved?$/,
        /[aeiouy][dt]es?$/,
        /[aeiouy][^aeiouydt]e[rsd]?$/,
        /^[dr]e[aeiou][^aeiou]+$/, // Sorts out deal, deign etc
        /[aeiouy]rse$/ // Purse, hearse
    ];

    // These syllables would be counted as one but should be two
    var addSyllables = [
        /ia/,
        /riet/,
        /dien/,
        /iu/,
        /io/,
        /ii/,
        /[aeiouym]bl$/,
        /[aeiou]{3}/,
        /^mc/,
        /ism$/,
        /([^aeiouy])\1l$/,
        /[^l]lien/,
        /^coa[dglx]./,
        /[^gq]ua[^auieo]/,
        /dnt$/,
        /uity$/,
        /ie(r|st)$/
    ];

    // Single syllable prefixes and suffixes
    var prefixSuffix = [
        /^un/,
        /^fore/,
        /ly$/,
        /less$/,
        /ful$/,
        /ers?$/,
        /ings?$/
    ];

    // Remove prefixes and suffixes and count how many were taken
    prefixSuffix.forEach(function (regex) {
        if (word.match(regex)) {
            word = word.replace(regex, "");
            prefixSuffixCount++;
        }
    });

    wordPartCount = word
        .split(/[^aeiouy]+/ig)
        .filter(function (wordPart) {
            return !!wordPart.replace(/\s+/ig, "").length
        })
        .length;

    // Get preliminary syllable count...
    syllableCount = wordPartCount + prefixSuffixCount;

    // Some syllables do not follow normal rules - check for them
    subSyllables.forEach(function (syllable) {
        if (word.match(syllable)) syllableCount--;
    });

    addSyllables.forEach(function (syllable) {
        if (word.match(syllable)) syllableCount++;
    });

    var syl = syllableCount || 1;
    this.debugText += syl + "]" + " ";
    return syllableCount || 1;
};