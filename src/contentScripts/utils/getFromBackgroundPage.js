// Converts the chrome runtime call into a promise to more easily fetch the results
function getFromBackgroundPage(payload, ignoreErrors = true) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(payload, (response) => {
            debugger;
            const error = chrome.runtime.lastError;
            if (!ignoreErrors && error) {
                reject(error);
                return;
            }

            if (!ignoreErrors && response.success === false) {
                reject(response.error);
                return;
            }
            resolve(response.response);
        });
    });
}

export { getFromBackgroundPage };
