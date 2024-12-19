import React, { useEffect, useState, useRef } from 'react';
import './seotracker.css'; // Import the CSS file
import Chart from 'chart.js/auto'; // Import Chart.js
import { fetchSeoData, saveSeoData, updateSeoData, deleteSeoData } from '../../firebase';

// Hoisting the loadData function
const loadData = async () => {
  const seoData = await fetchSeoData();
  if (Object.keys(seoData).length) {
    return seoData;
  }
  return {
    chart1: { scores: [70, 75, 80], dates: ['2024-12-01', '2024-12-08', '2024-12-15'] },
    chart2: { scores: [85, 88, 90], dates: ['2024-12-01', '2024-12-08', '2024-12-15'] },
    chart3: { scores: [60, 65, 70], dates: ['2024-12-01', '2024-12-08', '2024-12-15'] },
  };
};

const SeoTracker = () => {
  const [data, setData] = useState({});
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chartRefs = useRef({});

  // Fetch SEO data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const seoData = await loadData();
      setData(seoData);
    };

    fetchData();

    // Cleanup function to destroy charts on unmount or update
    return () => {
      Object.values(chartRefs.current).forEach((chart) => chart.destroy());
      chartRefs.current = {}; // Reset chart refs
    };
  }, []);

  // Create graph with data
  const createGraph = (ctx, label, scores, dates, color, chartId) => {
    if (chartRefs.current[chartId]) {
      // Chart already exists, just update it
      chartRefs.current[chartId].data.labels = dates;
      chartRefs.current[chartId].data.datasets[0].data = scores;
      chartRefs.current[chartId].update();
    } else {
      // Chart doesn't exist, create a new one
      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            label: label,
            data: scores,
            borderColor: color,
            backgroundColor: color + '40',
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => `Score: ${tooltipItem.raw}`,
              }
            }
          },
        }
      });

      // Store the chart reference
      chartRefs.current[chartId] = newChart;
    }
  };

  // Create chart instances
  useEffect(() => {
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');
    const ctx3 = document.getElementById('chart3').getContext('2d');
    
    createGraph(ctx1, 'TrueChoicePack SEO Score', data.chart1?.scores || [], data.chart1?.dates || [], 'rgba(255, 99, 132)', 'chart1');
    createGraph(ctx2, 'American Essentials SEO Score', data.chart2?.scores || [], data.chart2?.dates || [], 'rgba(54, 162, 235)', 'chart2');
    createGraph(ctx3, 'Aimler Solutions SEO Score', data.chart3?.scores || [], data.chart3?.dates || [], 'rgba(75, 192, 192)', 'chart3');
  }, [data]);

  const updateGraphs = async () => {
    const website = document.getElementById('websiteSelect').value;
    const date = document.getElementById('dateInput').value;
    const score = parseInt(document.getElementById('seoInput').value);

    if (!date || isNaN(score) || score < 0 || score > 100) {
      alert('Please enter a valid date and SEO score (0-100).');
      return;
    }

    const newData = { ...data };
    newData[website].scores.push(score);
    newData[website].dates.push(date);

    setData(newData);
    await updateSeoData(website, newData[website].scores, newData[website].dates);

    alert('SEO score updated successfully!');
  };

  // Function to edit data
  const editData = async (chartId, idx) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):', data[chartId].dates[idx]);
    const newScore = parseInt(prompt('Enter new SEO score (0-100):', data[chartId].scores[idx]));

    if (newDate && !isNaN(newScore) && newScore >= 0 && newScore <= 100) {
      const newData = { ...data };
      newData[chartId].dates[idx] = newDate;
      newData[chartId].scores[idx] = newScore;

      setData(newData);
      await updateSeoData(chartId, newData[chartId].scores, newData[chartId].dates);

      alert('SEO score modified successfully!');
    } else {
      alert('Invalid input. Modification cancelled.');
    }
    setIsModalOpen(false);
  };

  // Function to delete data
  const deleteData = async (chartId, idx) => {
    if (idx >= 0 && idx < data[chartId].scores.length) {
      const newData = { ...data };
      newData[chartId].scores.splice(idx, 1);
      newData[chartId].dates.splice(idx, 1);

      setData(newData);
      await updateSeoData(chartId, newData[chartId].scores, newData[chartId].dates);

      alert('SEO score deleted successfully!');
      setIsModalOpen(false);
    }
  };

  // Handle chart click event to select point
  const handleChartClick = (event, chartId) => {
    const chart = chartRefs.current[chartId];
    const canvasPosition = chart.canvas.getBoundingClientRect();
    const x = event.clientX - canvasPosition.left;
    const y = event.clientY - canvasPosition.top;

    const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);

    if (points.length > 0) {
      const index = points[0].index;
      setSelectedPoint({ chartId, index });
      setIsModalOpen(true); // Open the modal
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Render the modal
  const renderModal = () => {
    if (!selectedPoint || !isModalOpen) return null;

    const { chartId, index } = selectedPoint;
    const date = data[chartId]?.dates[index];
    const score = data[chartId]?.scores[index];

    return (
      <div className="modal">
        <div className="modal-content">
          <h2>Edit or Delete Data</h2>
          <p>Date: {date}</p>
          <p>SEO Score: {score}</p>
          <div className="modal-actions">
            <button onClick={() => editData(chartId, index)} className="edit-btn">Edit</button>
            <button onClick={() => deleteData(chartId, index)} className="delete-btn">Delete</button>
            <button onClick={closeModal} className="close-btn">Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <header>SEO Score Tracker</header>
      <div className="container">
        <div className="chart-container">
          <p className="chart-title">TrueChoicePack SEO Score</p>
          <canvas id="chart1" onClick={(e) => handleChartClick(e, 'chart1')}></canvas>
        </div>
        <div className="chart-container">
          <p className="chart-title">American Essentials SEO Score</p>
          <canvas id="chart2" onClick={(e) => handleChartClick(e, 'chart2')}></canvas>
        </div>
        <div className="chart-container">
          <p className="chart-title">Aimler Solutions SEO Score</p>
          <canvas id="chart3" onClick={(e) => handleChartClick(e, 'chart3')}></canvas>
        </div>

        {renderModal()}

        <div className="input-section">
          <label htmlFor="websiteSelect">Select Website:</label>
          <select id="websiteSelect">
            <option value="chart1">TrueChoicePack</option>
            <option value="chart2">American Essentials</option>
            <option value="chart3">Aimler Solutions</option>
          </select>
          <label htmlFor="dateInput">Select Date:</label>
          <input type="date" id="dateInput" />
          <label htmlFor="seoInput">Enter SEO Score:</label>
          <input type="number" id="seoInput" placeholder="e.g., 85" min="0" max="100" />
          <button className="update-btn" onClick={updateGraphs}>Update Score</button>
        </div>
      </div>
    </div>
  );
};

export default SeoTracker;