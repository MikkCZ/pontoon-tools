function NotificationsPopup(remotePontoon) {
    this._remotePontoon = remotePontoon;
}

NotificationsPopup.prototype = {
    init: function() {
        this._watchStorageChanges();
        this._loadNotificationsFromStorage();
    },

    _watchStorageChanges: function() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (changes['notificationsDocText'] !== undefined) {
                this._loadNotificationsFromStorage();
            }
        }.bind(this));
    },

    _appendNotificationToList: function(list, notification) {
        var sourceLink = notification.getElementsByTagName('a')[0];
        var link = document.createElement('a');
        link.textContent = sourceLink.textContent;
        link.setAttribute('href', this._remotePontoon.getBaseUrl() + sourceLink.getAttribute('href'));
        var description = document.createElement('span');
        description.textContent = notification.querySelectorAll('.verb')[0].textContent + ' ' + notification.querySelectorAll('.timeago')[0].textContent;
        var listItem = document.createElement('li');
        listItem.appendChild(link);
        listItem.appendChild(document.createElement('br'));
        listItem.appendChild(description);
        list.appendChild(listItem);
    },

    _displayNotifications: function(notifications) {
        var notificationsList = document.getElementById('notification-list');
        var fullList = document.getElementById('full-list');
        var emptyList = document.getElementById('empty-list');
        var error = document.getElementById('error');

        if (notifications != undefined && notifications.length > 0) {
            while (notificationsList.lastChild) {
                notificationsList.removeChild(notificationsList.lastChild);
            }
            for (n of notifications) {
                this._appendNotificationToList(notificationsList, n);
            }
            notificationsList.classList.remove('hidden');
            fullList.classList.remove('hidden');
            emptyList.classList.add('hidden');
            error.classList.add('hidden');
        } else if (notifications != undefined) {
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
    },

    _loadNotificationsFromStorage: function() {
        var docKey = 'notificationsDocText';
        chrome.storage.local.get(docKey, function(item) {
            if (item[docKey] != undefined) {
                var notificationsDoc = new DOMParser().parseFromString(item[docKey], 'text/html');
                var unreadNotifications = notificationsDoc.querySelectorAll('#main .notification-item[data-unread=true]');
                this._displayNotifications(unreadNotifications);
            } else {
                this._displayNotifications(undefined);
            }
        }.bind(this));
    },
}