chrome.commands.onCommand.addListener(function(command) {
    if (command === "auto-correct") {
        // Send a message to content script to check the spelling
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, "auto-correct");
        });
    }
});