import { DEFAULT_ACTIONS } from '../constants.js';

function getActionOptions() {
    return new Promise((resolve, _reject) => {
        chrome.storage.sync.get({
            actions: DEFAULT_ACTIONS, // Default value
        }, ({ actions }) => resolve(actions));
    });
}

export default getActionOptions;
