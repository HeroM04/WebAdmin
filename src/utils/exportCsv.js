export const exportToCSV = (data, columns, filename = 'Bao_cao.csv') => {
  if (!data || !data.length) return;

  // Extract keys and headers
  const headers = columns.map(col => col.title).join(',');
  
  // Format rows
  const csvRows = data.map(row => {
    return columns.map(col => {
      // Find the value based on dataIndex or key
      let value = row[col.dataIndex || col.key];
      
      // If it's a render function and we need raw text, this simple CSV exporter
      // might just take the raw string value if possible, or we assume dataIndex exists.
      // Since some tables use render heavily without dataIndex, we might have to be careful.
      // But for simple objects, we can just grab the string.
      if (value === null || value === undefined) value = '';
      
      // Escape commas and quotes
      let strVal = String(value);
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        strVal = `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    }).join(',');
  });

  const csvContent = [headers, ...csvRows].join('\n');
  
  // Add BOM for UTF-8 Excel compatibility
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
