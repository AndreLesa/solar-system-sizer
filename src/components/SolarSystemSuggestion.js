import React from 'react';

const SolarSystemSuggestion = ({ totalConsumption }) => {
  const peakSunHours = 5; // Assume 5 peak sun hours per day
  const systemEfficiency = 0.8; // Assume 80% system efficiency

  const suggestedSystemSize = (totalConsumption / peakSunHours / systemEfficiency / 1000).toFixed(2);

  return (
    <div className="solar-system-suggestion">
      <h2>Suggested Solar System Size</h2>
      <p>{suggestedSystemSize} kW</p>
      <p>
        This suggestion is based on an average of {peakSunHours} peak sun hours per day and
        {systemEfficiency * 100}% system efficiency. Please consult with a solar professional
        for a more accurate assessment.
      </p>
    </div>
  );
};

export default SolarSystemSuggestion;
