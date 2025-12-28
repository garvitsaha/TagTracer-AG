
/**
 * SmartCompare Backend (Google Apps Script)
 * 1. Create a Google Sheet with headers: ID, Name, Website, Price, Features (comma-separated), Rating, DeliveryTime, URL, ImageURL, Category
 * 2. Paste this code into Extensions > Apps Script
 * 3. Deploy as Web App, set access to "Anyone"
 * 4. Copy the URL into constants.tsx -> SHEETS_API_URL
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const products = rows.map((row, index) => {
    let obj = {};
    headers.forEach((header, i) => {
      let key = header.toString().toLowerCase().replace(/\s+/g, '');
      // Handle special mapping to frontend keys
      if (key === 'id') obj.id = row[i].toString();
      else if (key === 'name') obj.name = row[i];
      else if (key === 'website') obj.website = row[i];
      else if (key === 'price') obj.price = parseFloat(row[i]);
      else if (key === 'features') obj.features = row[i].toString().split(',').map(f => f.trim());
      else if (key === 'rating') obj.rating = parseFloat(row[i]);
      else if (key === 'deliverytime') obj.deliveryTime = row[i];
      else if (key === 'url') obj.url = row[i];
      else if (key === 'imageurl') obj.imageUrl = row[i];
      else if (key === 'category') obj.category = row[i];
    });
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(products))
    .setMimeType(ContentService.MimeType.JSON);
}

// Optional Admin function to add data via API if desired
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];
    
    // Simple push to bottom
    sheet.appendRow([
      params.id, 
      params.name, 
      params.website, 
      params.price, 
      params.features.join(','), 
      params.rating, 
      params.deliveryTime, 
      params.url, 
      params.imageUrl, 
      params.category
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
