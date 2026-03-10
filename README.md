# Quirino High School Enrollment System

Welcome to the enrollment system! This is a modern, responsive web application that works completely from your browser. 

Since your system does to not have Node.js installed, this was built using standard HTML, CSS, and JS. All you need to do is open `index.html` in your web browser (like Chrome or Edge)!

## Features
- **Modern Premium Interface**: Deep red and gold theme inspired by Quirino High School, glassmorphism design.
- **Dynamic Views**: Single-page app transition effects (No page reloads needed!).
- **User Authentication**: A mockup Login and Sign-up system to simulate user creation.
- **Smart Enrollment Form**: A multi-step form that captures learner info, academic history, and tracks for SHS. Features dynamic fields (Tracks are only selectable for Grades 11 and 12).
- **Drive Integration Ready**: The form is prepared to send data directly to an owner's Google Drive. 

## How to Configure "Save to Owner's Drive"

Right now, the form has a mock progress bar that pretends to send to Google Drive. To make it *actually* send to your Google Drive, you will use **Google Sheets and Google Apps Script**.

### Step 1: Create a Google Sheet
1. Open your Google Drive and create a new **Google Sheet**.
2. Name it "QHS Enrollments 2026".
3. Add these exact column headers to the first row (A1 to I1):
   - Timestamp, First Name, Last Name, DOB, Gender, Address, Contact, Grade Level, Track/Strand, Previous School

### Step 2: Add the Apps Script
1. In your Google Sheet, click on **Extensions > Apps Script**.
2. Delete any code there and paste this code:

```javascript
const sheetName = 'Sheet1'; // Change this if your sheet name is different
const scriptProp = PropertiesService.getScriptProperties();

function intialSetup () {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

function doPost (e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);
    
    // Get headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;
    
    // Create new row
    const newRow = headers.map(function(header) {
      if (header === 'timestamp' || header === 'Timestamp') {
        return new Date();
      } else {
        return e.parameter[header] || e.parameter['entry.' + header.toLowerCase().replace(/[^a-z0-9]/g, '')] || e.parameter[header.toLowerCase()] || '';
      }
    });

    // Handle our specific `entry.` names from the form
    const entryData = [
      new Date(),
      e.parameter['entry.fname'],
      e.parameter['entry.lname'],
      e.parameter['entry.dob'],
      e.parameter['entry.gender'],
      e.parameter['entry.address'],
      e.parameter['entry.contact'],
      e.parameter['entry.level'],
      e.parameter['entry.track'],
      e.parameter['entry.prevschool']
    ];

    sheet.getRange(nextRow, 1, 1, entryData.length).setValues([entryData]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  finally {
    lock.releaseLock();
  }
}
```

3. Click **Save**. Keep the Apps script tab open.
4. From the top bar, click the "Run" button to execute `intialSetup`. It will ask for permissions, click "Review Permissions", select your account, and hit "Allow".

### Step 3: Deploy as Web App
1. In Apps script top right, click **Deploy > New deployment**.
2. Select **Web app** as the type.
3. Description: `QHS Form Endpoint`.
4. Execute as: **Me**.
5. Who has access: **Anyone**.
6. Click **Deploy**.
7. Copy the **Web app URL**.

### Step 4: Connect it to your website
1. Open up `app.js` in a text editor.
2. Go to the very bottom, locate the `// Submit Enrollment` section (Lines 185+).
3. Uncomment the `fetch` block and replace `'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'` with the URL you copied in Step 3! Make sure you comment out or remove the `setTimeout` mock inside that function so it only runs the real fetch request.

Now every time someone submits the form, their data will directly feed into your Owner's Google Drive inside that spreadsheet!
