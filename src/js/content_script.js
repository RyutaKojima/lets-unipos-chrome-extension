let timerId = null;

const getUniposPointElement = () => document.querySelector('.columnRight_availablePointNum>span');

// 残りUniposポイント
const getPoint = () => Number(getUniposPointElement().innerText)

const updatePoint = () => {
    if (location.href !== 'https://unipos.me/all') {
        return;
    }
    if (!getUniposPointElement()) {
        return;
    }

    chrome.runtime.sendMessage({
        action: 'point',
        point: getPoint(),
    })
}

timerId = setInterval(() => {
    updatePoint();
}, 60 * 1000);
