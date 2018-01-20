var action = '';

function sendCommand(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(tab.id, action);
    }
} 

function handleUpdated(tabId, changeInfo, tabInfo) {
    if (changeInfo.audible !== undefined && !tabInfo.url.includes('mtube.dynu.net')) {
        action = changeInfo.audible ? 'pause' : 'play';
        browser.tabs.query({
            url: '*://mtube.dynu.net/*'
        }).then(sendCommand);
    }
}

browser.tabs.onUpdated.addListener(handleUpdated);
browser.commands.onCommand.addListener(function (command) {
    action = command;
    browser.tabs.query({
        url: '*://mtube.dynu.net/*'
    }).then(sendCommand);
});
