import React from 'react';

const TotalConsumption = ({ totalConsumption }) => {
  return (
    <div className="total-consumption">
      <h2>Total Daily Consumption</h2>
      <p>{totalConsumption.toFixed(2)} Wh/day</p>
    </div>
  );
};

export default TotalConsumption;
