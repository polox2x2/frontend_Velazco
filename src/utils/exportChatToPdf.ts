import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportChatToPdf = (text: string) => {
  const doc = new jsPDF();
  
  // Diseño Premium del Reporte
  // Barra superior de acento
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 8, 'F');

  // Título del reporte
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); 
  doc.text('Velazco', 14, 25);
  
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229); // primary color
  doc.text('Reporte Ejecutivo de Control', 14, 32);
  
  // Fecha
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 38);
  
  // Línea divisoria
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);
  
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  
  const lines = text.split('\n');
  let y = 52;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Verificar si es un bloque JSON
    if (line.includes('```json_chart')) {
      let jsonContent = '';
      i++;
      while (i < lines.length && !lines[i].includes('```')) {
        jsonContent += lines[i] + '\n';
        i++;
      }
      
      try {
        const chartData = JSON.parse(jsonContent);
        
        // Agregar título del gráfico
        if (chartData.title) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(30, 41, 59);
          doc.text(chartData.title.toUpperCase(), 14, y);
          y += 8;
        }

        // Convertir datos del gráfico a formato de tabla
        const headers = [
          (chartData.xKey || 'Nombre').toUpperCase(), 
          (chartData.yKey || 'Valor').toUpperCase()
        ];
        
        const rows = chartData.data.map((item: any) => [
          item[chartData.xKey || 'name'], 
          item[chartData.yKey || 'value']
        ]);

        autoTable(doc, {
          startY: y,
          head: [headers],
          body: rows,
          theme: 'grid',
          headStyles: { 
            fillColor: [79, 70, 229],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            textColor: [51, 65, 85]
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 'auto' },
            1: { halign: 'center', cellWidth: 40 }
          },
          styles: { fontSize: 10, cellPadding: 5 },
          margin: { left: 14, right: 14 },
          alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        
        y = (doc as any).lastAutoTable.finalY + 15;
      } catch (e) {
        console.error("Error parsing chart json for PDF", e);
      }
      continue;
    }

    // Verificar si es una tabla markdown
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      i--; // Retroceder uno para que el bucle incremente correctamente
      
      const headers = tableLines[0].split('|').map(s => s.trim()).filter(s => s);
      // tableLines[1] usualmente es |---|---|
      const rows = tableLines.slice(2).map(r => r.split('|').map(s => s.trim()).filter(s => s));
      
      autoTable(doc, {
        startY: y,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { 
          fillColor: [79, 70, 229],
          fontStyle: 'bold'
        },
        styles: { fontSize: 9, cellPadding: 4 },
        margin: { left: 14, right: 14 }
      });
      y = (doc as any).lastAutoTable.finalY + 15;
    } else {
      // Texto normal
      // Limpiar sintaxis markdown
      const cleanLine = line
        .replace(/\*\*/g, '')
        .replace(/#/g, '')
        .trim();
        
      if (cleanLine) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const splitText = doc.splitTextToSize(cleanLine, 180);
        for (let j = 0; j < splitText.length; j++) {
          doc.text(splitText[j], 14, y);
          y += 6;
        }
        y += 2;
      } else {
        // Línea vacía
        y += 4;
      }
    }
    
    if (y > 270) {
      doc.addPage();
      // Agregar barra superior en nueva página
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 8, 'F');
      y = 20;
    }
  }
  
  // Números de página en pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount} - Generado por Velazco AI`, 
      105, 
      285, 
      { align: 'center' }
    );
  }
  
  doc.save(`Velazco_Reporte_${Date.now()}.pdf`);
};
