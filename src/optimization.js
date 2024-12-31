document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('simulation-form');
  const avgDistanceDisplay = document.getElementById('avg-distance');
  const stdDevDisplay = document.getElementById('std-dev');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const numSteps = parseInt(document.getElementById('num-steps').value);
    const numWalks = parseInt(document.getElementById('num-walks').value);

    const results = simulateRandomWalks(numSteps, numWalks);
    drawHeatmap(results);
    drawCDF(results);
    drawPaths(results);

    const distances = results.distances;
    const avgDistance = calculateAverage(distances);
    const stdDev = calculateStandardDeviation(distances, avgDistance);

    avgDistanceDisplay.textContent = `Average Distance: ${avgDistance.toFixed(2)}`;
    stdDevDisplay.textContent = `Standard Deviation: ${stdDev.toFixed(2)}`;
  });

  function simulateRandomWalks(numSteps, numWalks) {
    const directions = [
      [0, 1],  // up
      [0, -1], // down
      [1, 0],  // right
      [-1, 0]  // left
    ];

    const paths = [];
    const distances = [];
    const startPoints = [];
    const endPoints = [];

    for (let i = 0; i < numWalks; i++) {
      let x = 0;
      let y = 0;
      const path = [[x, y]];

      for (let j = 0; j < numSteps; j++) {
        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        x += dx;
        y += dy;
        path.push([x, y]);
      }

      paths.push(path);
      distances.push(Math.sqrt(x * x + y * y));
      startPoints.push([0, 0]);
      endPoints.push([x, y]);
    }

    return { paths, distances, startPoints, endPoints };
  }

  // Function to draw Heatmap
  function drawHeatmap({ paths, startPoints, endPoints }) {
    const data = [];
    const xValues = [];
    const yValues = [];
    const intensityValues = [];

    const heatmap = {};
    paths.forEach(path => {
      path.forEach(([x, y]) => {
        const key = `${x},${y}`;
        heatmap[key] = (heatmap[key] || 0) + 1;
      });
    });

    const maxCount = Math.max(...Object.values(heatmap));
    Object.entries(heatmap).forEach(([key, count]) => {
      const [x, y] = key.split(',').map(Number);
      xValues.push(x);
      yValues.push(y);
      intensityValues.push(Math.log(count) / Math.log(maxCount));
    });

    const traceHeatmap = {
      x: xValues,
      y: yValues,
      z: intensityValues,
      type: 'histogram2d',
      colorscale: [
        ['0.0', 'rgb(0, 0, 255)'],
        ['0.5', 'rgb(255, 255, 0)'],
        ['1.0', 'rgb(255, 0, 0)']
      ],
      showscale: true
    };

    const startTrace = {
      x: startPoints.map(p => p[0]),
      y: startPoints.map(p => p[1]),
      mode: 'markers',
      marker: {
        color: 'green',
        size: 10,
        symbol: 'circle'
      },
      name: 'Start Points'
    };

    const endTrace = {
      x: endPoints.map(p => p[0]),
      y: endPoints.map(p => p[1]),
      mode: 'markers',
      marker: {
        color: 'blue',
        size: 10,
        symbol: 'circle'
      },
      name: 'End Points'
    };

    data.push(traceHeatmap, startTrace, endTrace);

    const layout = {
      title: 'Monte Carlo Random Walk Heatmap',
      xaxis: { title: 'X' },
      yaxis: { title: 'Y' },
      plot_bgcolor: '#121212',
      paper_bgcolor: '#121212',
      font: { color: '#eaeaea' },
      showlegend: true,
      legend: {
        x: 0.5,
        y: -0.3,  
        traceorder: 'normal',
        orientation: 'h',
        font: {
          family: 'Source Code Pro, monospace',
          size: 12,
          color: '#eaeaea'
        },
        bgcolor: '#1e1e1e',
        bordercolor: '#333',
        borderwidth: 2
      },
      autosize: true,
      margin: { l: 50, r: 50, t: 50, b: 100 }  
    };

    Plotly.newPlot('heatmap', data, layout);
  }

  // Function to draw CDF Plot
  function drawCDF({ distances }) {
    const sortedDistances = distances.sort((a, b) => a - b);
    const cdf = sortedDistances.map((dist, index) => ({
      x: dist,
      y: (index + 1) / sortedDistances.length
    }));

    const cdfTrace = {
      x: cdf.map(p => p.x),
      y: cdf.map(p => p.y),
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgb(255, 0, 0)', width: 3 }
    };

    const layout = {
      title: 'Cumulative Distribution Function (CDF) of Walk Distances',
      xaxis: { title: 'Distance' },
      yaxis: { title: 'CDF' },
      plot_bgcolor: '#121212',
      paper_bgcolor: '#121212',
      font: { color: '#eaeaea' },
      autosize: true,
      margin: { l: 50, r: 50, t: 50, b: 100 }  // Adjust margins for better spacing
    };

    Plotly.newPlot('cdf-plot', [cdfTrace], layout);
  }


  function drawPaths({ paths }) {
    const pathTraces = paths.map((path, index) => ({
      x: path.map(p => p[0]),
      y: path.map(p => p[1]),
      type: 'scatter',
      mode: 'lines',
      line: { width: 1, opacity: 0.5, color: `rgb(${Math.floor(255 - (index * 10) % 255)}, 100, 150)` },
      name: `Path ${index + 1}`
    }));

    const layout = {
      title: 'Interactive Path Visualization',
      xaxis: { title: 'X' },
      yaxis: { title: 'Y' },
      plot_bgcolor: '#121212',
      paper_bgcolor: '#121212',
      font: { color: '#eaeaea' },
      showlegend: false,
      autosize: true,
      margin: { l: 50, r: 50, t: 50, b: 100 }  
    };

    Plotly.newPlot('path-plot', pathTraces, layout);
  }


  function calculateAverage(arr) {
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
  }

  function calculateStandardDeviation(arr, mean) {
    const variance = arr.reduce((acc, val) => acc + (val - mean) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
  }
});