import React from 'react';

const TotalConsumption = ({ totalConsumption }) => {
  return (
    <div className="total-consumption">
      <h2>Total Daily Consumption</h2>
      <p>
        {totalConsumption !== undefined
          ? `${totalConsumption.toFixed(2)} Wh`
          : 'Add appliances to calculate total consumption'}
      </p>
    </div>
  );
};

export default TotalConsumption;