var paused = false
var paused_by_ext = false

function sendCommand (action, by_ext) {
    paused = (action === 'pause')
    paused_by_ext = paused && by_ext
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
        // Resume if any tab is still playing audio
        var action = tabs.filter((tab) => !tab.url.includes('mtube.dynu.net') && tab.id !== ignore).length ? 'pause' : 'play'
        // The player shouldn't be resumed if the user paused it.
        if (!paused_by_ext && action === 'play') return
        sendCommand(action, true)
    })
}

browser.commands.onCommand.addListener(sendCommand)
browser.tabs.onRemoved.addListener(updateAudioState)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if (changeInfo.audible !== undefined && !tabInfo.url.includes('mtube.dynu.net')) updateAudioState()
})
