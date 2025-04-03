// ==UserScript==
// @name         mod-bonus-updater
// @namespace    https://github.com/rkeaves
// @version      1.4.4
// @description  For each username from an uploaded .txt file, the script navigates to the corresponding dashboard edit page and updates the user's seed bonus to a specified value. A floating control panel displays progress, and configurable delays (in seconds) are applied before and after each update to space out requests.
// @namespace    https://github.com/rkeaves
// @downloadURL  https://github.com/rkeaves/mod-bonus-updater/raw/main/mod-bonus-updater.js
// @updateURL    https://github.com/rkeaves/mod-bonus-updater/raw/main/mod-bonus-updater.js
// @match        https://privatesilverscreen.cc/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @license      GPL-3.0-or-later
// @author       rkeaves
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================================
    // Storage keys and constants
    // ==========================================================
    const STORAGE_KEY_USERNAMES = 'bonusUpdater_usernames';
    const STORAGE_KEY_INDEX = 'bonusUpdater_index';
    const STORAGE_KEY_DELAY = 'bonusUpdater_delay';
    const TARGET_BONUS = '20000'; // As a string

    // ==========================================================
    // Helper Functions
    // ==========================================================
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const timer = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(timer);
                    resolve(el);
                } else if (Date.now() - start > timeout) {
                    clearInterval(timer);
                    reject(new Error('Element not found: ' + selector));
                }
            }, 100);
        });
    }

    // Navigate to next user's dashboard edit page
    function navigateToNextUser() {
        let usernames = GM_getValue(STORAGE_KEY_USERNAMES, []);
        let index = GM_getValue(STORAGE_KEY_INDEX, 0);
        index++;
        if (index < usernames.length) {
            GM_setValue(STORAGE_KEY_INDEX, index);
            const nextUser = usernames[index];
            window.location.href = location.origin + `/dashboard/users/${nextUser}/edit`;
        } else {
            alert('All users processed!');
            GM_setValue(STORAGE_KEY_USERNAMES, []);
            GM_setValue(STORAGE_KEY_INDEX, 0);
        }
    }

    // ==========================================================
    // Auto-redirect Block: If on a public profile page, check if it matches the current user.
    // ==========================================================
    if (location.pathname.match(/^\/users\/([^/]+)$/)) {
        const m = location.pathname.match(/^\/users\/([^/]+)$/);
        if (m) {
            const username = m[1];
            const storedUsernames = GM_getValue(STORAGE_KEY_USERNAMES, []);
            const index = GM_getValue(STORAGE_KEY_INDEX, 0);
            if (storedUsernames && storedUsernames[index] &&
                storedUsernames[index].toLowerCase() === username.toLowerCase()) {
                // If we're still processing this user, skip it and move to the next.
                navigateToNextUser();
            } else {
                // Otherwise, redirect to the dashboard edit page.
                window.location.href = location.origin + `/dashboard/users/${username}/edit`;
            }
            return;
        }
    }

    // Determine if current page is an edit page by URL pattern.
    const isEditPage = location.pathname.includes('/dashboard/users/') &&
                       location.pathname.includes('/edit');

    // Always create the floating control panel.
    createFloatingMenu();

    // If on an edit page, run the bonus update routine.
    if (isEditPage) {
        updateBonus();
    }

    // ==========================================================
    // Bonus update routine (runs on dashboard edit pages)
    // ==========================================================
    async function updateBonus() {
        // Read the delay from the floating panel's input or stored value.
        let delaySeconds = 3;
        const delayInput = document.getElementById('delayInput');
        if (delayInput && delayInput.value) {
            delaySeconds = parseFloat(delayInput.value) || 3;
            GM_setValue(STORAGE_KEY_DELAY, delayInput.value);
        } else {
            delaySeconds = parseFloat(GM_getValue(STORAGE_KEY_DELAY, "3"));
        }
        console.log(`Using delay of ${delaySeconds} seconds.`);

        // Extra delay at start of update
        console.log(`Initial delay: waiting ${delaySeconds} seconds before processing...`);
        await delay(delaySeconds * 1000);

        try {
            const seedInput = await waitForElement('#seedbonus');
            const currentBonus = seedInput.value.trim();
            console.log('Current bonus:', currentBonus);
            if (currentBonus !== TARGET_BONUS) {
                seedInput.value = TARGET_BONUS;
                seedInput.dispatchEvent(new Event('input', { bubbles: true }));
                await delay(500);
                const saveButton = document.querySelector('button.form__button--filled');
                if (saveButton) {
                    saveButton.click();
                    console.log('Save button clicked.');
                } else {
                    console.error('Save button not found.');
                }
                await delay(2000);
            } else {
                console.log('Bonus already set to target.');
            }
        } catch (error) {
            console.error('Error updating bonus:', error);
        }
        // Extra delay at end before navigation
        console.log(`Final delay: waiting ${delaySeconds} seconds before moving to the next entry.`);
        await delay(delaySeconds * 1000);
        navigateToNextUser();
    }

    // ==========================================================
    // Floating Control Panel (always visible)
    // ==========================================================
    function createFloatingMenu() {
        if (document.getElementById('bonusUpdaterMenu')) return;
        const menu = document.createElement('div');
        menu.id = 'bonusUpdaterMenu';
        menu.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            background: #f9f9f9;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 15px;
            z-index: 10000;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
        `;
        menu.innerHTML = `
            <h2 style="margin:0 0 10px 0; font-size:18px; text-align:center;">Bonus Updater</h2>
            <p style="font-size:14px; text-align:center;">Upload a .txt file of usernames (one per line):</p>
            <input type="file" id="fileInput" accept=".txt" style="display:block; margin:0 auto 10px auto;">
            <textarea id="bonusUsernames" style="width:100%; height:150px; margin-bottom:10px; padding:5px;" placeholder="Uploaded usernames will appear here..." readonly></textarea>
            <div style="text-align:center; margin-bottom:10px;">
                <button id="startBonusBtn" style="margin:5px; padding:5px 10px;">Start Process</button>
                <button id="resetBonusBtn" style="margin:5px; padding:5px 10px;">Reset</button>
            </div>
            <div style="text-align:center; margin-bottom:10px;">
                <label for="delayInput" style="font-size:14px;">Delay (sec):</label>
                <input type="number" id="delayInput" value="3" min="0" style="width:60px; margin-left:10px;">
            </div>
            <div id="bonusStatus" style="font-size:14px; text-align:center;"></div>
        `;
        document.body.appendChild(menu);

        // Save delay value on change.
        document.getElementById('delayInput').addEventListener('change', function() {
            let val = this.value;
            GM_setValue(STORAGE_KEY_DELAY, val);
            updateStatus();
        });
        // Set initial delay value.
        let storedDelay = GM_getValue(STORAGE_KEY_DELAY, "3");
        document.getElementById('delayInput').value = storedDelay;

        // File upload: read file and populate storage and textarea.
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) {
                alert('No file selected.');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const usernames = content.split('\n').map(line => line.trim()).filter(line => line);
                document.getElementById('bonusUsernames').value = usernames.join('\n');
                GM_setValue(STORAGE_KEY_USERNAMES, usernames);
                GM_setValue(STORAGE_KEY_INDEX, 0);
                updateStatus();
                alert(`Loaded ${usernames.length} username(s).`);
            };
            reader.onerror = function() {
                alert('Error reading file.');
            };
            reader.readAsText(file);
        });

        // Start Process: navigate to the first user's dashboard edit page.
        document.getElementById('startBonusBtn').addEventListener('click', function() {
            const storedUsernames = GM_getValue(STORAGE_KEY_USERNAMES, []);
            if (!storedUsernames || storedUsernames.length === 0) {
                alert('No usernames loaded. Please upload a valid .txt file.');
                return;
            }
            updateStatus();
            window.location.href = location.origin + `/dashboard/users/${storedUsernames[0]}/edit`;
        });

        // Reset button: clear stored data and reset textarea.
        document.getElementById('resetBonusBtn').addEventListener('click', function() {
            GM_setValue(STORAGE_KEY_USERNAMES, []);
            GM_setValue(STORAGE_KEY_INDEX, 0);
            document.getElementById('bonusUsernames').value = '';
            updateStatus();
            alert('Bonus Updater data has been reset.');
        });

        updateStatus();
    }

    // Update status information in the floating control panel.
    function updateStatus() {
        const statusDiv = document.getElementById('bonusStatus');
        const usernames = GM_getValue(STORAGE_KEY_USERNAMES, []);
        const index = GM_getValue(STORAGE_KEY_INDEX, 0);
        let delayValue = GM_getValue(STORAGE_KEY_DELAY, "3");
        if (usernames && usernames.length > 0) {
            const processed = index;
            const remaining = usernames.length - index;
            statusDiv.textContent = `Processed: ${processed} | Remaining: ${remaining} | Delay: ${delayValue} sec`;
        } else {
            statusDiv.textContent = 'No usernames loaded.';
        }
    }

    // Update status periodically.
    setInterval(() => {
        if (document.getElementById('bonusStatus')) {
            updateStatus();
        }
    }, 3000);

    // Tampermonkey menu command to reset updater data.
    GM_registerMenuCommand('Reset Bonus Updater', () => {
        GM_setValue(STORAGE_KEY_USERNAMES, []);
        GM_setValue(STORAGE_KEY_INDEX, 0);
        updateStatus();
        alert('Bonus Updater data has been reset.');
    });
})();
