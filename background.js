// An object to store intervals associated with tab IDs. 
// This allows us to manage individual refresh intervals for each tab.
const intervals = {};

// Listen for messages sent from other parts of the extension (e.g., the popup).
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	
	console.log("Received message:", message);

    // If the message action is to start refreshing.
    if (message.action === 'start') {
        const tabId = message.tabId;

        // If there's an existing interval for this tab, clear it.
        if (intervals[tabId]) {
            clearInterval(intervals[tabId]);
        }

        // Set a new interval for this tab to refresh it.
        intervals[tabId] = setInterval(() => {
			console.log("Directly reloading tab:", tabId);
            chrome.tabs.reload(tabId);
        }, message.interval);

        // Send a response back to inform that the refresh has started.
        sendResponse({status: 'started'});
    } 
    // If the message action is to stop refreshing.
    else if (message.action === 'stop') {
        const tabId = message.tabId;

        // If there's an existing interval for this tab, clear it and remove its reference.
        if (intervals[tabId]) {
            clearInterval(intervals[tabId]);
            delete intervals[tabId];
        }

        // Send a response back to inform that the refresh has stopped.
        sendResponse({status: 'stopped'});
    } 
    // If the message action is to check the refresh status.
    else if (message.action === 'check') {
        // Respond with the status of the refresh: 'running' if there's an interval set, otherwise 'stopped'.
        sendResponse({
            status: intervals[message.tabId] ? 'running' : 'stopped'
        });
    }
});
