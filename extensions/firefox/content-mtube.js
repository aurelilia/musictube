function click(selector) {
    document.getElementById(selector).click();
}

browser.runtime.onMessage.addListener(request => {
    switch (request) {
    case 'pause':
        if (document.getElementsByClassName('fa-play')[0].style['display'] === 'none') {
            click('play-button');
        }
        break;
    case 'play':
        if (document.getElementsByClassName('fa-pause')[0].style['display'] === 'none') {
            click('play-button');
        }
        break;
    case 'play-pause':
        click('play-button');
        break;
    default:
        click(request + '-button');
        break;
    }
});