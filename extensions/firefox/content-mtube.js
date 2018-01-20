function click(selector) {
    document.getElementById(selector).click();
}

browser.runtime.onMessage.addListener(request => {
    switch (request) {
    case 'pause':
        click('play-button');
        break;
    case 'prev':
        click('prev-button');
        break;
    case 'next':
        click('next-button');
        break;
    }
});