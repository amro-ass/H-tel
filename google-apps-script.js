// ═══════════════════════════════════════════════════════════
// Google Apps Script للربط مع داشبورد الفندق
// ═══════════════════════════════════════════════════════════
// 
// التعليمات:
// 1. افتح Google Sheet الخاص بك
// 2. اذهب إلى Extensions > Apps Script
// 3. احذف الكود الافتراضي والصق هذا الكود
// 4. احفظ واضغط Deploy > New deployment
// 5. اختر "Web app" وحدد:
//    - Execute as: Me
//    - Who has access: Anyone
// 6. انسخ رابط الـ Web App URL واستخدمه في الداشبورد
//
// ═══════════════════════════════════════════════════════════

// إعدادات الـSheets
const SHEET_NAMES = {
  RESERVATIONS: 'Reservations',
  CLIENTS: 'Clients',
  CHAMBRES: 'Chambres',
  CHECKINS: 'Check-ins',
  HOUSEKEEPING: 'Housekeeping',
  MAINTENANCE: 'Maintenance',
  RESTAURANT: 'Restaurant',
  SPA: 'Spa',
  PERSONNEL: 'Personnel',
  FINANCE: 'Finance',
  ACTIVITIES: 'Activities'
};

// دالة رئيسية للـGET requests
function doGet(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  
  try {
    if (action === 'read') {
      return readSheet(sheet);
    } else if (action === 'init') {
      return initializeSheets();
    } else if (action === 'health') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'API is working!'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return createError('Invalid action');
  } catch (error) {
    return createError(error.toString());
  }
}

// دالة رئيسية للـPOST requests
function doPost(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (action === 'write') {
      return writeSheet(sheet, data);
    } else if (action === 'update') {
      return updateSheet(sheet, data);
    } else if (action === 'delete') {
      return deleteRow(sheet, data.id);
    }
    
    return createError('Invalid action');
  } catch (error) {
    return createError(error.toString());
  }
}

// قراءة بيانات من Sheet
function readSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    // إذا لم يكن الـSheet موجود، أنشئه
    if (!sheet) {
      sheet = createSheet(sheetName);
    }
    
    const lastRow = sheet.getLastRow();
    
    // إذا كان الـSheet فارغاً (بدون headers)
    if (lastRow === 0) {
      return createResponse([]);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // إذا كان هناك فقط headers بدون بيانات
    if (lastRow === 1) {
      return createResponse([]);
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    const result = data.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return createResponse(result);
  } catch (error) {
    return createError('Error reading sheet: ' + error.toString());
  }
}

// كتابة بيانات إلى Sheet
function writeSheet(sheetName, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = createSheet(sheetName);
    }
    
    const lastRow = sheet.getLastRow();
    
    // إذا كان الـSheet فارغاً، أضف headers
    if (lastRow === 0) {
      const headers = Object.keys(data);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const values = headers.map(header => data[header] || '');
    
    sheet.appendRow(values);
    
    return createResponse({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    return createError('Error writing to sheet: ' + error.toString());
  }
}

// تحديث صف في Sheet
function updateSheet(sheetName, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return createError('Sheet not found');
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idColumn = headers.indexOf('id') + 1;
    
    if (idColumn === 0) {
      return createError('ID column not found');
    }
    
    const lastRow = sheet.getLastRow();
    const ids = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues();
    
    const rowIndex = ids.findIndex(row => row[0] === data.id) + 2;
    
    if (rowIndex < 2) {
      return createError('Record not found');
    }
    
    const values = headers.map(header => data[header] || '');
    sheet.getRange(rowIndex, 1, 1, values.length).setValues([values]);
    
    return createResponse({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    return createError('Error updating sheet: ' + error.toString());
  }
}

// حذف صف من Sheet
function deleteRow(sheetName, id) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return createError('Sheet not found');
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idColumn = headers.indexOf('id') + 1;
    
    if (idColumn === 0) {
      return createError('ID column not found');
    }
    
    const lastRow = sheet.getLastRow();
    const ids = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues();
    
    const rowIndex = ids.findIndex(row => row[0] === id) + 2;
    
    if (rowIndex < 2) {
      return createError('Record not found');
    }
    
    sheet.deleteRow(rowIndex);
    
    return createResponse({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    return createError('Error deleting row: ' + error.toString());
  }
}

// إنشاء Sheet جديد مع headers
function createSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.insertSheet(sheetName);
  
  // تنسيق الـSheet
  sheet.setFrozenRows(1);
  
  // إضافة headers بناءً على نوع الـSheet
  const headers = getHeadersForSheet(sheetName);
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, headers.length).setBackground('#C9A84C');
    sheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');
  }
  
  return sheet;
}

// الحصول على headers بناءً على نوع الـSheet
function getHeadersForSheet(sheetName) {
  const headersMap = {
    'Reservations': ['id', 'clientId', 'clientNom', 'chambre', 'dateArrivee', 'dateDepart', 'nuitees', 'adultes', 'enfants', 'total', 'acompte', 'statut', 'notes'],
    'Clients': ['id', 'nom', 'prenom', 'email', 'telephone', 'adresse', 'ville', 'pays', 'dateNaissance', 'nationalite', 'passeport', 'notes'],
    'Chambres': ['id', 'num', 'etage', 'type', 'capacite', 'prix', 'statut'],
    'Check-ins': ['id', 'resaId', 'clientNom', 'chambre', 'dateCheckin', 'heureCheckin', 'dateCheckout', 'heureCheckout', 'statut'],
    'Housekeeping': ['id', 'chambre', 'tache', 'priorite', 'assigneA', 'statut', 'notes', 'dateCreation'],
    'Maintenance': ['id', 'lieu', 'probleme', 'priorite', 'assigneA', 'statut', 'notes', 'dateCreation'],
    'Restaurant': ['id', 'clientNom', 'chambre', 'nbPersonnes', 'date', 'heure', 'statut', 'notes'],
    'Spa': ['id', 'clientNom', 'chambre', 'soin', 'heure', 'duree', 'therapeute', 'prix', 'statut'],
    'Personnel': ['id', 'nom', 'prenom', 'poste', 'departement', 'telephone', 'email', 'dateEmbauche', 'statut'],
    'Finance': ['id', 'date', 'type', 'categorie', 'montant', 'description', 'reference'],
    'Activities': ['id', 'timestamp', 'title', 'subtitle', 'type']
  };
  
  return headersMap[sheetName] || [];
}

// تهيئة جميع الـSheets
function initializeSheets() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    Object.values(SHEET_NAMES).forEach(sheetName => {
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        createSheet(sheetName);
      }
    });
    
    return createResponse({ 
      success: true, 
      message: 'All sheets initialized successfully',
      sheets: Object.values(SHEET_NAMES)
    });
  } catch (error) {
    return createError('Error initializing sheets: ' + error.toString());
  }
}

// إنشاء استجابة ناجحة
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

// إنشاء استجابة خطأ
function createError(message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}
