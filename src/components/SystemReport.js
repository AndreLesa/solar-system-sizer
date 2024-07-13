import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SystemReport = ({
  selectedAppliances,
  inverterSize,
  batterySize,
  effectiveBatterySize,
  useSolarPanels,
  solarPanelSize,
  numberOfPanels,
  panelWattage,
  batteryType,
  batteryBackupHours
}) => {
  const reportRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(reportRef.current, {
      scale: 2, // Adjust scale for better quality
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4' // Use A4 format for standard page size
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0; // Set to 0 to remove the top margin

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save('system-report.pdf');
  };

  const totalKWh = Object.values(selectedAppliances).reduce((total, appliance) => {
    return total + Number(((appliance.power * appliance.hoursPerDay * (appliance.quantity || 1)) / 1000).toFixed(2));
  }, 0).toFixed(2);

  return (
    <div>

      <div className="system-report" ref={reportRef} style={{ padding: '20px', fontSize: '12px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '16px', textAlign: 'center' }}>System Report</h2>
        <div className="report-section" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', textAlign: 'left' }}>Recommended System Size</h3>
          <p>Minimum Inverter Size: {inverterSize} W</p>
          <p>Minimum Battery Size: {batterySize} Wh</p>
          <p>Battery Type: {batteryType}</p>
          <p>Battery Backup Hours: {batteryBackupHours} hours</p>
          {useSolarPanels && (
            <>
              <p>Recommended Solar Size: {solarPanelSize} W</p>
              <p>Number of Panels: {numberOfPanels}</p>
              <p>Panel Wattage: {panelWattage} W</p>
            </>
          )}
        </div>
        <div className="report-section" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', textAlign: 'left' }}>Chosen Appliances</h3>
          <ul>
            {Object.entries(selectedAppliances).map(([key, appliance]) => (
              <li key={key}>
                {appliance.name} - {appliance.quantity} unit(s), {appliance.power} W, {appliance.hoursPerDay} hours/day
              </li>
            ))}
          </ul>
        </div>
        <div className="report-section" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', textAlign: 'left' }}>Suggested Equipment</h3>
          <ul>
            <li>Inverter: {inverterSize} W</li>
            <li>Battery: {batterySize} Wh</li>
            {useSolarPanels && (
              <>
                <li>Solar Panels: {numberOfPanels} x {panelWattage} W</li>
                <li>Total Solar Size: {solarPanelSize} W</li>
              </>
            )}
          </ul>
        </div>
        <p><strong>Note:</strong> This estimate assumes all appliances are running simultaneously. You may use a smaller inverter if you manually manage how appliances are switched on.</p>
      </div>
      <div className="report-actions">
        <button onClick={handlePrint}>Print Report</button>
        <button onClick={handleDownloadPDF}>Download PDF</button>
      </div>
    </div>
  );
};

export default SystemReport;