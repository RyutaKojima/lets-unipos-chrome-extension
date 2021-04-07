const uniposUrl = 'https://unipos.me/all';
const optionUrl = chrome.runtime.getURL('options/options.html');

let uniposPoint = null;
let nextNotifyTime = null;

const setNextNotifyTime = () => {
    const now = new Date();

    nextNotifyTime = now;
    if (now.getHours() >= 17) {
        nextNotifyTime.setHours(now.getHours() + 1, 0, 0, 0);
    } else if (now.getHours() >= 13) {
        nextNotifyTime.setHours(17, 30, 0, 0);
    } else if (now.getHours() >= 9) {
        nextNotifyTime.setHours(13, 0, 0, 0);
    } else {
        nextNotifyTime.setHours(9, 0, 0, 0);
    }
}

const notifyRecommendUnipos = () => {
    const opt = {
        type: 'basic',
        title: 'Let\'s Unipos !!',
        message: 'ポイントが余っていますよ。投稿や拍手してみませんか？',
        iconUrl: '../img/icon_48.png',
    };

    chrome.notifications.create('', opt);
}

const openOptionPage = () => {
    chrome.tabs.create({
        url: optionUrl,
        active: true,
    });
};

const openUnipos = (isActive) => {
    chrome.tabs.create({
        url: uniposUrl,
        active: isActive
    });
}

const openUniposIfNotOpened = () => {
    chrome.tabs.query({url: uniposUrl}, (uniposPages) => {
        if (uniposPages.length === 0) {
            // NOTE: active にしないと、UniposのSPAが構築されない
            openUnipos(true);
        }
    });
}

const controller = {
    openOptionPage() {
        openOptionPage();
        return {};
    },
    openUniposPage() {
        openUnipos(true);
        return {};
    },
    setUniposPoint(point) {
        if (point !== uniposPoint) {
            console.log(point);
        }

        uniposPoint = point;

        return {};
    }
}

/**
 * メッセージ受信したときに発生するイベント
 */
chrome.runtime.onMessage.addListener((message, MessageSender, sendResponse) => {
    let response = {}

    switch (message.action) {
        case 'point':
            response = controller.setUniposPoint(message.point);
            break;
        case 'open-unipos':
            response = controller.openUniposPage();
            break;
        case 'open-options':
            response = controller.openOptionPage();
            break;
        default:
            response = {error: 'Unknown action'}
    }

    sendResponse({'message': 'ok', ...response});
});

/**
 * 拡張機能がインストール/アップデートされたときに発生するイベント
 * See: https://developer.chrome.com/docs/extensions/reference/runtime/#event-onInstalled
 */
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // openOptionPage();
    }
});

chrome.alarms.onAlarm.addListener(() => {
    openUniposIfNotOpened();

    // ポイントが余っていて、規定時間になったら通知する
    const now = new Date();
    if (now > nextNotifyTime) {
        setNextNotifyTime();

        if (uniposPoint > 0) {
            notifyRecommendUnipos();
        }
    }
});

chrome.alarms.clearAll(() => {
    chrome.alarms.create('unipos-interval', {
        when: Date.now() + 60 * 1000,
        periodInMinutes: 1
    });
});

openUniposIfNotOpened();
setNextNotifyTime();
