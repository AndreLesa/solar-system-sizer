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
    const canvas = await html2canvas(reportRef.current, { scale: 2.5 }); // Increase scale for better quality
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 277); // Adjusted to add padding
    pdf.save('system-report.pdf');
  };

  const totalKWh = Object.values(selectedAppliances).reduce((total, appliance) => {
    return total + Number(((appliance.power * appliance.hoursPerDay * (appliance.quantity || 1)) / 1000).toFixed(2));
  }, 0).toFixed(2);

  return (
    <div>
      <div className="report-actions">
        <button onClick={handlePrint}>Print Report</button>
        <button onClick={handleDownloadPDF}>Download PDF</button>
      </div>
      <div className="system-report" ref={reportRef} style={{ padding: '20px', fontSize: '12px' }}>
        <h2 style={{ fontSize: '16px' }}>System Report</h2>
        <div className="report-section" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px' }}>Recommended System Size</h3>
          <p>Minimum Inverter Size: {inverterSize} W</p>
          <p>Minimum Battery Size: {batterySize} Wh</p>
          {useSolarPanels && (
            <>
              <p>Effective Battery Size: {effectiveBatterySize} Wh</p>
              <p>Recommended Solar Size: {solarPanelSize} W</p>
              <p>Number of Panels: {numberOfPanels}</p>
              <p>Panel Wattage: {panelWattage} W</p>
            </>
          )}
        </div>
        <div className="report-section" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px' }}>Chosen Appliances</h3>
          <ul>
            {Object.entries(selectedAppliances).map(([key, appliance]) => (
              <li key={key}>
                {appliance.name} - {appliance.quantity} unit(s), {appliance.power} W, {appliance.hoursPerDay} hours/day
              </li>
            ))}
          </ul>
        </div>
        <div className="report-section" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px' }}>Suggested Equipment</h3>
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
    </div>
  );
};

export default SystemReport;
