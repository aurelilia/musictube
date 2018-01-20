var action = '';

function sendCommand(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(tab.id, action);
    }
}

browser.commands.onCommand.addListener(function (command) {
    action = command;
    browser.tabs.query({
        url: '*://mtube.dynu.net/*'
    }).then(sendCommand);
});
