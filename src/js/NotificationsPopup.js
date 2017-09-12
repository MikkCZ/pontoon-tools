class NotificationsPopup {
    constructor(remotePontoon) {
        this._remotePontoon = remotePontoon;

        this._watchStorageChanges();
        this._loadNotificationsFromStorage();
    }

    _watchStorageChanges() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            const dataKey = 'notificationsData';
            if (changes[dataKey] !== undefined) {
                this._displayNotifications(changes[dataKey].newValue);
            }
        });
    }

    _createNotificationListItem(notification) {
        const listItem = document.createElement('li');
        if (notification.actor) {
            const actorLink = document.createElement('a');
            actorLink.textContent = notification.actor.text;
            actorLink.setAttribute('href', this._remotePontoon.getTeamProjectUrl(notification.actor.link));
            listItem.appendChild(actorLink);
        }
        if (notification.verb) {
            const verb = document.createElement('span');
            verb.textContent = ` ${notification.verb}`;
            listItem.appendChild(verb);
        }
        if (notification.target) {
            const targetLink = document.createElement('a');
            targetLink.textContent = ` ${notification.target.text}`;
            targetLink.setAttribute('href', this._remotePontoon.getTeamProjectUrl(notification.target.link));
            listItem.appendChild(targetLink);
        }
        if (notification.timeago) {
            const timeago = document.createElement('div');
            timeago.textContent = notification.timeago;
            timeago.classList.add('timeago');
            listItem.appendChild(timeago);
        }
        if (notification.message) {
            const message = document.createElement('div');
            message.textContent = notification.message;
            message.classList.add('message');
            listItem.appendChild(message);
        }
        return listItem;
    }

    _displayNotifications(notificationsData) {
        const notificationsList = document.getElementById('notification-list');
        const fullList = document.getElementById('full-list');
        const emptyList = document.getElementById('empty-list');
        const error = document.getElementById('error');

        if (notificationsData !== undefined && Object.keys(notificationsData).length > 0) {
            while (notificationsList.lastChild) {
                notificationsList.removeChild(notificationsList.lastChild);
            }
            Object.keys(notificationsData).sort().reverse()
                .map((nKey) => notificationsData[nKey])
                .map((data) => this._createNotificationListItem(data))
                .forEach((listItem) => notificationsList.appendChild(listItem));
            notificationsList.classList.remove('hidden');
            fullList.classList.remove('hidden');
            emptyList.classList.add('hidden');
            error.classList.add('hidden');
        } else if (notificationsData !== undefined) {
            notificationsList.classList.add('hidden');
            fullList.classList.add('hidden');
            emptyList.classList.remove('hidden');
            error.classList.add('hidden');
        } else {
            notificationsList.classList.add('hidden');
            fullList.classList.add('hidden');
            emptyList.classList.add('hidden');
            error.classList.remove('hidden');
        }
    }

    _loadNotificationsFromStorage() {
        const dataKey = 'notificationsData';
        chrome.storage.local.get(dataKey, (item) => this._displayNotifications(item[dataKey]));
    }
}
