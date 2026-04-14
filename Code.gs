const DEFAULT_SPREADSHEET_ID = '1wkV0gsiWiQITZd3c-ivh_dTrgbhRwBQtxLXUgWsO5Dc';
const DEFAULT_SHEETS = [
  'Reservations',
  'Clients',
  'Chambres',
  'Check-ins',
  'Housekeeping',
  'Maintenance',
  'Restaurant',
  'Spa',
  'Personnel',
  'Finance',
  'Activities'
];
const HEADERS = ['id', 'json', 'updatedAt'];

function doGet(e) {
  return jsonResponse_(handleRequest_(e, null));
}

function doPost(e) {
  const payload = parsePayload_(e);
  return jsonResponse_(handleRequest_(e, payload));
}

function handleRequest_(e, payload) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'health').toLowerCase();
    const sheetName = (e && e.parameter && e.parameter.sheet) || '';
    const spreadsheetId = (e && e.parameter && e.parameter.spreadsheetId) || DEFAULT_SPREADSHEET_ID;
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    if (action === 'health') {
      ensureAllSheets_(spreadsheet);
      return {
        status: 'success',
        spreadsheetId: spreadsheet.getId(),
        sheetTitle: spreadsheet.getName(),
        sheets: spreadsheet.getSheets().map(sheet => sheet.getName())
      };
    }

    if (action === 'init') {
      ensureAllSheets_(spreadsheet);
      return {
        status: 'success',
        data: {
          spreadsheetId: spreadsheet.getId(),
          sheetTitle: spreadsheet.getName(),
          sheets: spreadsheet.getSheets().map(sheet => sheet.getName())
        }
      };
    }

    if (!sheetName) {
      throw new Error('Paramètre sheet manquant.');
    }

    const sheet = ensureSheet_(spreadsheet, sheetName);

    switch (action) {
      case 'read':
        return {
          status: 'success',
          data: readRows_(sheet)
        };

      case 'replace': {
        const rows = payload && Array.isArray(payload.rows)
          ? payload.rows
          : Array.isArray(payload)
            ? payload
            : [];
        replaceRows_(sheet, rows);
        return {
          status: 'success',
          count: rows.length,
          message: 'Collection remplacée avec succès.'
        };
      }

      case 'write': {
        const record = payload && payload.record ? payload.record : payload;
        appendOrUpdateRecord_(sheet, record, false);
        return {
          status: 'success',
          message: 'Enregistrement ajouté avec succès.'
        };
      }

      case 'update': {
        const record = payload && payload.record ? payload.record : payload;
        appendOrUpdateRecord_(sheet, record, true);
        return {
          status: 'success',
          message: 'Enregistrement mis à jour avec succès.'
        };
      }

      case 'delete': {
        const id = payload && payload.id ? String(payload.id) : '';
        if (!id) throw new Error('ID manquant pour la suppression.');
        deleteRecord_(sheet, id);
        return {
          status: 'success',
          message: 'Enregistrement supprimé avec succès.'
        };
      }

      default:
        throw new Error('Action non prise en charge : ' + action);
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}

function ensureAllSheets_(spreadsheet) {
  DEFAULT_SHEETS.forEach(name => ensureSheet_(spreadsheet, name));
}

function ensureSheet_(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];
  const headerMissing = HEADERS.some((header, index) => currentHeaders[index] !== header);

  if (headerMissing) {
    headerRange.setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function readRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return values
    .filter(row => row[0] || row[1])
    .map(row => {
      const id = row[0] ? String(row[0]) : '';
      const jsonText = row[1] ? String(row[1]) : '{}';
      const parsed = safeParse_(jsonText);
      if (!parsed.id && id) parsed.id = id;
      return parsed;
    });
}

function replaceRows_(sheet, rows) {
  const normalized = Array.isArray(rows) ? rows : [];
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
  }

  if (!normalized.length) return;

  const values = normalized.map(record => {
    const row = record || {};
    return [
      row.id || Utilities.getUuid(),
      JSON.stringify(row),
      new Date().toISOString()
    ];
  });

  sheet.getRange(2, 1, values.length, HEADERS.length).setValues(values);
}

function appendOrUpdateRecord_(sheet, record, forceUpdate) {
  if (!record || typeof record !== 'object') {
    throw new Error('Données invalides.');
  }

  const id = record.id ? String(record.id) : Utilities.getUuid();
  record.id = id;

  const allRows = readRows_(sheet);
  const index = allRows.findIndex(item => String(item.id) === id);

  if (index >= 0) {
    allRows[index] = record;
  } else if (forceUpdate) {
    allRows.push(record);
  } else {
    allRows.push(record);
  }

  replaceRows_(sheet, allRows);
}

function deleteRecord_(sheet, id) {
  const filtered = readRows_(sheet).filter(item => String(item.id) !== String(id));
  replaceRows_(sheet, filtered);
}

function parsePayload_(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return {};
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}

function safeParse_(value) {
  try {
    return value ? JSON.parse(value) : {};
  } catch (error) {
    return {};
  }
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
