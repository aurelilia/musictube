function sendCommand(tabs, action) {
    for(let tab of tabs) {
        browser.tabs.sendMessage(tab.id, action);
    }
} 

function updateAudioState(ignore) {
    action = 'play';
    browser.tabs.query({
        audible: true
    }).then((tabs) => {
        for (let tab of tabs) {
            if (!tab.url.includes('mtube.dynu.net') && tab.id !== ignore) {
                action = 'pause';
            }
        }
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
