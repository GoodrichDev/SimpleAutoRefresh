// Get references to the toggle button, interval input, and error message elements from the popup's DOM.
const toggleButton = document.getElementById("toggleButton");
const intervalInput = document.getElementById("interval");
const errorMessage = document.getElementById("error-message");

// Query the active tab in the current window.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // Get the tab ID of the active tab.
    const tabId = tabs[0].id;

    // Fetch the stored refresh interval for the active tab from the local storage.
    chrome.storage.local.get([tabId.toString()], function(result) {
        // If there's a stored value for the tab, update the interval input with it.
        if (result && result[tabId]) {
            intervalInput.value = result[tabId].interval;
        }
    });

    // Check with the background script to see if the refreshing is currently running for this tab.
    chrome.runtime.sendMessage({action: 'check', tabId: tabId}, function(response) {
        // Update the toggle button's text based on the refresh status.
        if (response && response.status === 'running') {
            toggleButton.textContent = "Stop Refreshing";
        } else {
            toggleButton.textContent = "Start Refreshing";
        }
    });
	
    // Add a click event listener to the toggle button.
    toggleButton.addEventListener('click', () => {
        // Convert the interval input's value to a number.
		const intervalValue = Number(intervalInput.value);
		
        // Check if the entered interval is a valid number and greater than 0.
        if (isNaN(intervalValue) || intervalValue <= 0) {
            // If not, display the error message and exit.
            errorMessage.classList.remove('hidden');
            return;
        } else {
            // Otherwise, hide the error message.
            errorMessage.classList.add('hidden');
        }
		
        // Check the current state of the toggle button.
        if (toggleButton.textContent === "Start Refreshing") {
            // If it's set to "Start Refreshing", calculate the refresh interval in milliseconds.
            let interval = Math.max(Number(intervalInput.value), 1) * 60000;
			
			console.log("Sending message:", {action: 'start', tabId: tabId, interval: interval});
			
            // Send a message to the background script to start the refreshing.
            chrome.runtime.sendMessage({action: 'start', tabId: tabId, interval: interval}, function(response) {
                // If the background script confirms that it has started refreshing, update the button's text and store the interval.
                if (response && response.status === 'started') {
                    toggleButton.textContent = "Stop Refreshing";
                    chrome.storage.local.set({
                        [tabId.toString()]: {
                            interval: intervalInput.value
                        }
                    });
                }
            });
        } else {
            // If the button's state is "Stop Refreshing", send a message to the background script to stop the refreshing.
            chrome.runtime.sendMessage({action: 'stop', tabId: tabId}, function(response) {
                // If the background script confirms that it has stopped refreshing, update the button's text.
                if (response && response.status === 'stopped') {
                    toggleButton.textContent = "Start Refreshing";
                }
            });
        }
    });
});
