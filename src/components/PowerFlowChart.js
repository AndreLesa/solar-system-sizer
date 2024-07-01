import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ReactSlider from 'react-slider';

// Register the necessary components with Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PowerFlowChart = ({ powerSources }) => {
  const [range, setRange] = useState([0, 24]);

  const data = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Grid Power (W)',
        data: powerSources.map(source => source.grid),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
      {
        label: 'Solar Power (W)',
        data: powerSources.map(source => source.solar),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
      {
        label: 'Battery Power (W)',
        data: powerSources.map(source => source.battery),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Power Flow Over 24 Hours',
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="thumb"
        trackClassName="track"
        defaultValue={[0, 24]}
        min={0}
        max={24}
        value={range}
        onChange={(value) => setRange(value)}
        renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
      />
      <div>Selected range: {range[0]}:00 - {range[1]}:00</div>
    </div>
  );
};

export default PowerFlowChart;
