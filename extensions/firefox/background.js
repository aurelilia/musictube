var paused_by_ext = false;

function sendCommand(tabs, action) {
    for(let tab of tabs) {
        browser.tabs.sendMessage(tab.id, action);
    }
} 

function updateAudioState(ignore) {
    var action = 'play';
    browser.tabs.query({
        audible: true
    }).then((tabs) => {
        // Ignore player tabs when looking for tabs playing audio
        for (let tab of tabs.filter(tab => !tab.url.includes('mtube.dynu.net'))) {
            if (tab.id !== ignore) {
                action = 'pause';
                paused_by_ext = true;
            }
        }
        // The player shouldn't be resumed if the user paused it.
        // If the extension DID pause it and wants to resume, it's no longer paused.
        if (!paused_by_ext && action === 'play') return;
        else if (action === 'play') paused_by_ext = false;
        
        browser.tabs.query({
            url: '*://mtube.dynu.net/*'
        }).then((tabs) => {
            sendCommand(tabs, action);
        });
    });
}

browser.tabs.onRemoved.addListener(updateAudioState);
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if (changeInfo.audible !== undefined && !tabInfo.url.includes('mtube.dynu.net')) {
        updateAudioState();
    }
});

browser.commands.onCommand.addListener((command) => {
    browser.tabs.query({
        url: '*://mtube.dynu.net/*'
    }).then((tabs) => {
        sendCommand(tabs, command);
    });
});
