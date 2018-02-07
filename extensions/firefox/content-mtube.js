function click(selector) {
    document.getElementById(selector).click()
}

browser.runtime.onMessage.addListener((request) => {
    switch (request) {
    case 'pause':
    case 'play':
        if (document.getElementById('fa-play').classList.contains('fa-' + request)) {
            click('play-button')
        }
        break
    case 'play-pause':
        click('play-button')
        break
    default:
        click(request + '-button')
        break
    }
})