
let dictionary = null;

// Asynchronously initialize the dictionary.
fetch(chrome.runtime.getURL('dictionaries/en_US.aff'))
    .then(response => response.text())
    .then(affData => {
        fetch(chrome.runtime.getURL('dictionaries/en_US.dic'))
            .then(response => response.text())
            .then(dicData => {
                dictionary = new Typo("en_US", affData, dicData);
            });
    });

function getContent(element) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        return element.value;
    }
    if (element.isContentEditable) {
        return element.innerText;  // or use element.textContent based on preference
    }
    return null;
}

function setContent(element, content) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        element.value = content;
    } else if (element.isContentEditable) {
        element.innerText = content;  // or use element.textContent based on preference
        element.textContent = content;
    }
}

function replaceLastMisspelledWord(element) {
    if (!dictionary) {
        console.log("Dictionary is not initialized yet.");
        return;
    }

    let content = getContent(element);
    if (!content) return;  // No content to process

    let words = content.split(/\s+/);
    let suggestions = [];

    for (let index = words.length - 1; index >= 0; index--) {
        let word = words[index];
        if (!dictionary.check(word)) {
            suggestions = dictionary.suggest(word);
            if (suggestions.length > 0) {
                words[index] = suggestions[0];
                setContent(element, words.join(' '));
                break;  // Exit the loop once the last misspelled word is found and replaced
            }
        }
    }
}

function isTextInput(element) {
    if (element.tagName === 'TEXTAREA') return true;
    
    if (element.tagName === 'INPUT') {
        const textInputTypes = ['text', 'search', 'url', 'email'];
        return textInputTypes.includes(element.type);
    }
    
    return element.isContentEditable;  // This checks for contenteditable elements
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message == "auto-correct") {
    let focusedElement = document.activeElement;
    //if (focusedElement && (focusedElement.tagName === 'TEXTAREA' || focusedElement.tagName === 'INPUT' || focusedElement.role === 'textbox')) {
    if (focusedElement && isTextInput(focusedElement)) {
        replaceLastMisspelledWord(focusedElement);
    }
  }
});
