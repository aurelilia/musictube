function sendCommand (action) {
    browser.tabs.query({
        url: '*://mtube.dynu.net/*'
    }).then((tabs) => {
        for (let tab of tabs) {
            browser.tabs.sendMessage(tab.id, action)
        }
    })
}

function updateAudioState (ignore) {
    browser.tabs.query({
        audible: true
    }).then((tabs) => {
        var action = tabs.filter((tab) => !tab.url.includes('mtube.dynu.net') && tab.id !== ignore).length ? 'pause' : 'play'
        sendCommand(action)
    })
}

browser.commands.onCommand.addListener(sendCommand)
browser.tabs.onRemoved.addListener(updateAudioState)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if (changeInfo.audible !== undefined && !tabInfo.url.includes('mtube.dynu.net')) updateAudioState()
})
