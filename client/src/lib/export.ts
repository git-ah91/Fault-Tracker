import { FaultRecord } from "@shared/schema";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface ExportOptions {
  format: 'excel' | 'pdf';
  data: FaultRecord[];
  fileName?: string;
  title?: string;
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    location?: string;
  };
}

export async function exportFaultData(options: ExportOptions): Promise<void> {
  const { format, data, fileName, title, filters } = options;
  
  const defaultFileName = `fault-records-${new Date().toISOString().split('T')[0]}`;
  const fullFileName = fileName || defaultFileName;
  
  if (format === 'excel') {
    await exportToExcel(data, fullFileName, title, filters);
  } else if (format === 'pdf') {
    await exportToPDF(data, fullFileName, title, filters);
  }
}

async function exportToExcel(data: FaultRecord[], fileName: string, title?: string, filters?: any): Promise<void> {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Prepare data for Excel
  const excelData = data.map(fault => ({
    'Fault ID': fault.id,
    'Fault Number': fault.faultNumber || '',
    'Date Reported': new Date(fault.dateReported).toLocaleDateString(),
    'Time Reported': fault.timeReported,
    'Location': fault.location,
    'Equipment Type': fault.equipmentType,
    'Equipment Number': fault.equipmentNumber,
    'Equipment Classification': fault.equipmentClassification,
    'Fault Reporter': fault.faultReporter,
    'Fault Description': fault.faultDescription,
    'Work Done': fault.workDone || '',
    'Corrected By': fault.correctedBy || '',
    'Date of Work Done': fault.dateOfWorkDone ? new Date(fault.dateOfWorkDone).toLocaleDateString() : '',
    'Time to Repair (hours)': fault.timeToRepair || '',
    'Down Time (hours)': fault.downTime || '',
    'Relevant State': fault.relevantState || '',
    'Comments': fault.comments || '',
    'Status': fault.status,
    'Created By': fault.createdBy,
    'Created At': new Date(fault.createdAt).toLocaleString()
  }));
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Fault Records');
  
  // Write file
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

async function exportToPDF(data: FaultRecord[], fileName: string, title?: string, filters?: any): Promise<void> {
  const doc = new jsPDF();
  const reportTitle = title || 'Fault Records Report';
  const reportDate = new Date().toLocaleDateString();
  
  // Add title
  doc.setFontSize(18);
  doc.text(reportTitle, 20, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on ${reportDate}`, 20, 30);
  
  // Add filters if provided
  let yPos = 40;
  if (filters) {
    doc.setFontSize(14);
    doc.text('Applied Filters:', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    if (filters.dateFrom) {
      doc.text(`Date From: ${filters.dateFrom}`, 20, yPos);
      yPos += 8;
    }
    if (filters.dateTo) {
      doc.text(`Date To: ${filters.dateTo}`, 20, yPos);
      yPos += 8;
    }
    if (filters.status && filters.status !== 'all') {
      doc.text(`Status: ${filters.status}`, 20, yPos);
      yPos += 8;
    }
    if (filters.location && filters.location !== 'all') {
      doc.text(`Location: ${filters.location}`, 20, yPos);
      yPos += 8;
    }
    yPos += 10;
  }
  
  // Add summary
  doc.setFontSize(14);
  doc.text('Summary', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Total Records: ${data.length}`, 20, yPos);
  doc.text(`Open Faults: ${data.filter(f => f.status === 'open').length}`, 80, yPos);
  doc.text(`Resolved Faults: ${data.filter(f => f.status === 'resolved').length}`, 140, yPos);
  yPos += 20;
  
  // Prepare table data
  const tableData = data.map(fault => [
    fault.id,
    `${fault.equipmentType} ${fault.equipmentNumber}`,
    fault.location,
    fault.faultReporter,
    fault.faultDescription.length > 50 ? fault.faultDescription.substring(0, 50) + '...' : fault.faultDescription,
    fault.status.replace('_', ' '),
    new Date(fault.dateReported).toLocaleDateString()
  ]);
  
  // Add table
  (doc as any).autoTable({
    head: [['ID', 'Equipment', 'Location', 'Reporter', 'Description', 'Status', 'Date']],
    body: tableData,
    startY: yPos,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249],
    },
  });
  
  // Save the PDF
  doc.save(`${fileName}.pdf`);
}

export function generateReportData(faults: FaultRecord[]) {
  const totalFaults = faults.length;
  const openFaults = faults.filter(f => f.status === 'open').length;
  const resolvedFaults = faults.filter(f => f.status === 'resolved').length;
  const inProgressFaults = faults.filter(f => f.status === 'in_progress').length;
  
  const equipmentTypes = faults.reduce((acc, fault) => {
    acc[fault.equipmentType] = (acc[fault.equipmentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const locations = faults.reduce((acc, fault) => {
    acc[fault.location] = (acc[fault.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const repairTimes = faults.filter(f => f.timeToRepair).map(f => f.timeToRepair!);
  const avgRepairTime = repairTimes.length > 0 ? 
    repairTimes.reduce((sum, time) => sum + time, 0) / repairTimes.length : 0;
  
  return {
    summary: {
      totalFaults,
      openFaults,
      resolvedFaults,
      inProgressFaults,
      avgRepairTime: Math.round(avgRepairTime * 10) / 10
    },
    equipmentTypes,
    locations,
    repairTimes
  };
}
