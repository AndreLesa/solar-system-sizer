import React, { useRef, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getMaxPowerDraw, getTotalConsumption, getHighestPowerItem } from './ApplianceList';

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
  batteryBackupHours,
  systemVoltage
}) => {
  const reportRef = useRef();
  const [maxPowerDraw, setMaxPowerDraw] = useState(0);
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [highestPowerItem, setHighestPowerItem] = useState({ name: '', wattage: 0 });

  useEffect(() => {
    setMaxPowerDraw(getMaxPowerDraw(selectedAppliances));
    setTotalConsumption(getTotalConsumption(selectedAppliances));
    setHighestPowerItem(getHighestPowerItem(selectedAppliances));
  }, [selectedAppliances]);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save('system-report.pdf');
  };

  const convertWhToAh = (wh, voltage) => {
    return (wh / voltage).toFixed(2);
  };

  const calculateNumberOfBatteries = (totalWh, batteryCapacityAh, systemVoltage) => {
    if (batteryType === 'lead-acid') {
      const minBatteries = systemVoltage === 12 ? 1 : systemVoltage === 24 ? 2 : 4;
      const totalAh = totalWh / systemVoltage;
      const batteriesInParallel = Math.ceil(totalAh / batteryCapacityAh);
      return Math.max(minBatteries, batteriesInParallel * minBatteries);
    } else {
      const totalAh = totalWh / systemVoltage;
      const batteriesInSeries = systemVoltage / 12;
      const batteriesInParallel = Math.ceil(totalAh / batteryCapacityAh);
      return batteriesInSeries * batteriesInParallel;
    }
  };

  const getMinimumBatterySizeAh = (batterySize, voltage) => {
    const ah = convertWhToAh(batterySize, voltage);
    return Math.max(ah, 100); // Ensure minimum 100Ah for lead-acid
  };

  const minimumBatterySizeAh = getMinimumBatterySizeAh(batterySize, systemVoltage);
  const numberOfBatteriesNeeded = calculateNumberOfBatteries(batterySize, 100, systemVoltage); // Assuming each battery is 100Ah

  return (
    <div>
      <Helmet>
        <title>System Report - Detailed Power System Analysis</title>
        <meta name="description" content="Get a detailed report of your power system including inverter size, battery size, and solar panel recommendations." />
        <meta name="keywords" content="system report, power system, inverter size, battery size, solar panels, energy consumption" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Report",
            "name": "System Report",
            "description": "Detailed report of your power system including inverter size, battery size, and solar panel recommendations.",
            "url": "https://yourwebsite.com/system-report"
          })}
        </script>
      </Helmet>
      <div className="system-report" ref={reportRef} style={{ padding: '30px', fontSize: '14px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '20px', color: '#333' }}>Power System Report</h1>
        
        <div className="report-section" style={{ marginBottom: '30px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px' }}>System Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <p><strong>Inverter Size:</strong> {inverterSize} W</p>
            <p><strong>Battery Size:</strong> {batterySize} Wh</p>
            <p><strong>Battery Type:</strong> {batteryType}</p>
            <p><strong>Backup Duration:</strong> {batteryBackupHours} hours</p>
            <p><strong>Total Consumption:</strong> {totalConsumption} kWh/day</p>
            <p><strong>Max Power Draw:</strong> {maxPowerDraw} W</p>
            <p><strong>Highest Power Item:</strong> {highestPowerItem.name} ({highestPowerItem.wattage} W)</p>
          </div>
        </div>

        {useSolarPanels && (
          <div className="report-section" style={{ marginBottom: '30px', backgroundColor: '#e6f7ff', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '18px', color: '#0077be', marginBottom: '15px' }}>Solar Panel System</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <p><strong>Total Solar Size:</strong> {solarPanelSize} W</p>
              <p><strong>Number of Panels:</strong> {numberOfPanels}</p>
              <p><strong>Panel Wattage:</strong> {panelWattage} W</p>
            </div>
          </div>
        )}

        <div className="report-section" style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px' }}>Appliance List</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Appliance</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Quantity</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Power (W)</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Hours/Day</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(selectedAppliances).map(([key, appliance]) => (
                <tr key={key}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{appliance.name}</td>
                  <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{appliance.quantity}</td>
                  <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{appliance.power}</td>
                  <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{appliance.hoursPerDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="report-section" style={{ marginBottom: '30px', backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', color: '#2e7d32', marginBottom: '15px' }}>Recommendations</h2>
          <ul style={{ paddingLeft: '20px' }}>
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

        <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
          <strong>Note:</strong> This estimate assumes all appliances are running simultaneously. 
          You may use a smaller inverter if you manually manage how appliances are switched on.
        </p>
      </div>
      <div className="report-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={handlePrint} style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Print Report</button>
        <button onClick={handleDownloadPDF} style={{ padding: '10px 20px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download PDF</button>
      </div>
    </div>
  );
};

export default SystemReport;