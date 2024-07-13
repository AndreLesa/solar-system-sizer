import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SystemReport = ({ selectedAppliances, inverterSize, batterySize, effectiveBatterySize, useSolarPanels, solarPanelSize, numberOfPanels, panelWattage }) => {
  const reportRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(reportRef.current, {
      scale: 3.5, // Increase scale for better quality
      useCORS: true, // Enable cross-origin resource sharing
      allowTaint: true, // Allow tainted images
      logging: true, // Enable logging for debugging
      backgroundColor: '#ffffff' // Set background color to white
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height] // Match PDF size to canvas size
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height); // Adjust to fit the entire canvas
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
      </div>
      <div className="report-actions">
        <button onClick={handlePrint}>Print Report</button>
        <button onClick={handleDownloadPDF}>Download PDF</button>
      </div>
    </div>
  );
};

export default SystemReport;