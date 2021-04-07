document.querySelector('#open-unipos').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'open-unipos'
    })
});