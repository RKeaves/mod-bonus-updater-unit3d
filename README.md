# mod-bonus-updater

![Tampermonkey Userscript](https://img.shields.io/badge/Tampermonkey-Userscript-blue)
![Version](https://img.shields.io/badge/Version-1.4.4-brightgreen)
![License](https://img.shields.io/badge/License-GPL--3.0--or--later-blue)

_A userscript for updating seed bonus values on dashboard edit pages across unit3d-based trackers._  

This script automates the process of updating the seed bonus for multiple users. For each username listed in an uploaded `.txt` file, the script navigates to the corresponding dashboard edit page, sets the seed bonus to a specified value (default is **20000**), A floating panel shows progress, and configurable delays are applied before and after each update.

<p align="center">
  <img src="https://ptpimg.me/g714zc.png" alt="Tracker Icon"">
</p>

> **Note:** This script is designed for use on unit3d-based trackers. Please update the <code>@match</code> directives in the script to include additional tracker sites as needed.


---

<div style="border: 2px solid #e74c3c; background-color: #f9e6e6; padding: 10px; border-radius: 5px; margin: 15px 0;">
  <strong>🚨 IMPORTANT:</strong> This script Requires moderator privileges, to work correctly. Ensure your account has the necessary permissions before using it.
</div>

---

## Integration with Profile URL Collector

This script is designed to work in tandem with the [Profile URL Collector](https://github.com/RKeaves/mod-profile-url-collector-unit3d/tree/main) userscript. The Profile URL Collector automatically gathers profile URLs across paginated pages and generates a `.txt` file containing the collected profiles.

**Workflow:**
1. **Collect Profile URLs:**  
   Use the Profile URL Collector to create a `.txt` file with the profile URLs or usernames.
   
2. **Update Seed Bonus:**  
   Upload the generated `.txt` file into this script’s floating control panel to update the seed bonus for each corresponding user.

This integration streamlines the process, allowing you to efficiently collect profile data and then perform batch updates on user accounts.

---

## Index

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## Prerequisites

- **Browser Extension**: [Tampermonkey](https://www.tampermonkey.net/) (or a similar userscript manager)
- **Target Sites**: The script is designed to work on unit3d-based trackers.  
  *Tip: Update the script’s <code>@match</code> directives to include additional sites as needed.*
- **Moderator Privileges**: The script **requires moderator privileges** to update seed bonuses.
- Basic familiarity with userscripts and their installation process

---

## Installation

1. **Install Tampermonkey**:  
   Download and install Tampermonkey for your preferred browser from [tampermonkey.net](https://www.tampermonkey.net/).

2. **Add the Script**:
   - Open the Tampermonkey dashboard.
   - Click on the **Create a new script** button.
   - Remove any pre-filled template code.
   - Copy and paste the entire contents of `mod-bonus-updater.js` into the editor.
   - Save the script.

3. **Verify Installation**:  
   The script should now be active on the specified target sites.

---

## Usage

1. **Uploading Usernames**:
   - Click the file upload button in the floating control panel.
   - Select a `.txt` file containing usernames (one per line).
   - The usernames will be displayed in the textarea and stored for processing.

> **Note:**
> Works with the [Profile URL Collector](https://github.com/RKeaves/mod-profile-url-collector-unit3d/tree/main) to automatically gather profile URLs from paginated pages and generate a `.txt` file.


2. **Starting the Process**:
   - Click the **Start Process** button in the floating control panel.
   - The script will navigate to the dashboard edit page of the first user in the list.

3. **Automated Updates**:
   - On each dashboard edit page, the script waits for a user-defined delay, updates the seed bonus to **20000** (unless already set), and triggers the save action.
   - After another delay, the script automatically moves to the next user.

4. **Control Panel Features**:
   - **Delay Input**: Adjust the delay (in seconds) before and after each update.
   - **Reset Button**: Clear stored usernames and reset progress.
   - **Progress Display**: Shows the number of processed and remaining usernames along with the current delay setting.

---

## Configuration

- **Target Seed Bonus**:  
  The target seed bonus is set as a constant (`TARGET_BONUS = "20000"`).  
  Modify this value in the script if a different bonus is desired.

- **Delay Settings**:  
  The default delay is **3 seconds**, but this can be adjusted via the floating control panel or by modifying the default value in the script.

- **Storage Keys**:  
  The script uses Tampermonkey’s storage functions (`GM_setValue` and `GM_getValue`) to manage usernames, progress index, and delay settings.

---

## Troubleshooting

| **Issue**                                     | **Solution**                                                  |
|-----------------------------------------------|---------------------------------------------------------------|
| **No Usernames Loaded**                       | Ensure the uploaded file is a valid `.txt` file with one username per line. |
| **Seed Bonus Not Updating**                   | Check if the dashboard edit page is loaded correctly and that the element selectors have not changed. |
| **Delays Not Applying Properly**              | Adjust the delay value in the floating control panel and verify that it is saved correctly. |
| **Script Not Running on Target Site**         | Confirm that the URL matches the updated <code>@match</code> directives in the script. |
| **Insufficient Privileges**                   | Verify that your account has moderator privileges on the target tracker. |
| **Errors in Console**                         | Open the browser console for error messages and verify Tampermonkey permissions. |

---

## Acknowledgements

- **Script Author**: [rkeaves](https://github.com/rkeaves)

---

## License

This project is licensed under the [GPL-3.0-or-later](https://www.gnu.org/licenses/gpl-3.0.html) license.
