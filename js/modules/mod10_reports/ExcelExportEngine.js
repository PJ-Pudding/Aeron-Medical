// MODULE: mod10_reports/ExcelExportEngine.js
// Universal UTF-8 BOM Excel & CSV Exporter Engine

const ExcelExportEngine = {
  /**
   * Export structured data to Excel-compatible CSV with UTF-8 BOM
   * @param {string} fileName - File name without extension
   * @param {Array<{key: string, label: string, format?: string}>} columns - Column definitions
   * @param {Array<Object>} rows - Data rows
   * @param {Object} [options] - Additional metadata and summary rows
   */
  exportToExcel(fileName, columns, rows, options = {}) {
    try {
      if (!rows || rows.length === 0) {
        alert('⚠️ ไม่พบข้อมูลสำหรับส่งออกรายงาน');
        return false;
      }

      const dateStamp = new Date().toISOString().split('T')[0];
      const fullFileName = `${fileName || 'AERON_Report'}_${dateStamp}.csv`;

      // 1. Prepare Header Lines
      let csvContent = '\uFEFF'; // UTF-8 BOM for Microsoft Excel Thai font support

      // Optional Title Block
      if (options.reportTitle) {
        csvContent += `"${options.reportTitle.replace(/"/g, '""')}"\n`;
        csvContent += `"บริษัท เอออน เมดิคอล จำกัด (AERON MEDICAL CO., LTD.)"\n`;
        csvContent += `"วันที่ออกรายงาน: ${new Date().toLocaleString('th-TH')}"\n\n`;
      }

      // Column Headers
      const headerLabels = columns.map(col => `"${(col.label || col.key || '').replace(/"/g, '""')}"`);
      csvContent += headerLabels.join(',') + '\n';

      // 2. Data Rows
      rows.forEach(row => {
        const rowCells = columns.map(col => {
          let val = row[col.key];

          if (val === undefined || val === null) {
            val = '';
          } else if (col.format === 'currency') {
            val = typeof val === 'number' ? val.toFixed(2) : String(val).replace(/[^0-9.-]/g, '');
          } else if (col.format === 'percent') {
            val = typeof val === 'number' ? `${val.toFixed(2)}%` : String(val);
          } else if (col.format === 'number') {
            val = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]/g, '')) || 0;
          } else {
            val = String(val).trim();
          }

          // Escape double quotes
          return `"${String(val).replace(/"/g, '""')}"`;
        });

        csvContent += rowCells.join(',') + '\n';
      });

      // 3. Summary Footer Row (if provided)
      if (options.summaryRow) {
        csvContent += '\n';
        const summaryCells = columns.map(col => {
          const sumVal = options.summaryRow[col.key];
          if (sumVal === undefined || sumVal === null) return '""';
          return `"${String(sumVal).replace(/"/g, '""')}"`;
        });
        csvContent += summaryCells.join(',') + '\n';
      }

      // 4. Trigger Instant Browser Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fullFileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error('Excel Export Error:', err);
      alert('❌ เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel: ' + err.message);
      return false;
    }
  }
};

window.ExcelExportEngine = ExcelExportEngine;
