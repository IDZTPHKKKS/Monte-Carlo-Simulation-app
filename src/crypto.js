
const form = document.getElementById('crypto-form');
const symbolInput = document.getElementById('crypto-symbol');
const simulationsInput = document.getElementById('simulations');
const daysInput = document.getElementById('days');
const plotDiv = document.getElementById('plot');


async function fetchRealTimePrice(symbol) {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
    const data = await response.json();
    return data[symbol].usd;
  } catch (error) {
    console.error("Error fetching real-time price:", error);
    alert("Error fetching real-time price.");
    return null;
  }
}

async function fetchHistoricalPrices(symbol, days) {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}`);
    const data = await response.json();
    return data.prices.map(priceData => priceData[1]); 
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    alert("Error fetching historical prices.");
    return [];
  }
}


function monteCarloSimulation(historicalPrices, simulations, days) {
  let simulationResults = [];
  

  const returns = historicalPrices.map((price, index) => {
    if (index === 0) return 0;
    return (price / historicalPrices[index - 1]) - 1;
  }).slice(1); 


  for (let i = 0; i < simulations; i++) {
    let simulatedPrices = [historicalPrices[historicalPrices.length - 1]];

    for (let j = 0; j < days; j++) {

      const randomReturn = returns[Math.floor(Math.random() * returns.length)];
      const nextPrice = simulatedPrices[simulatedPrices.length - 1] * (1 + randomReturn);
      simulatedPrices.push(nextPrice);
    }
    simulationResults.push(simulatedPrices);
  }

  return simulationResults;
}


async function fetchCurrentData(symbol) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${symbol}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Extract the necessary data
    const currentPrice = data.market_data.current_price.usd;
    const marketCap = data.market_data.market_cap.usd;
    const totalSupply = data.market_data.total_supply;


    displayCurrentData(currentPrice, marketCap, totalSupply);
    
  } catch (error) {
    console.error("Error fetching current data:", error);
    alert("Error fetching current data.");
  }
}


function displayCurrentData(price, marketCap, supply) {
  const currentDataSection = document.getElementById("current-data");
  currentDataSection.innerHTML = `
    <p><strong>Current Price:</strong><span style="color: lightgreen;"> $${price.toFixed(2)}</p>
    <p><strong>Market Cap:</strong> $${marketCap.toFixed(2)}</p>
    <p><strong>Total Supply:</strong> ${supply}</p>
  `;
}


async function fetchHistoricalPrices(symbol, days) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("Error from CoinGecko:", data.error);
      return [];
    }
    
    return data.prices.map(priceData => priceData[1]); 
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    alert("Error fetching historical prices.");
    return [];
  }
}


function monteCarloSimulation(historicalPrices, numSimulations, numDays) {
  const simulations = [];
  

  const returns = historicalPrices.slice(1).map((price, index) => {
    return price / historicalPrices[index] - 1;
  });
  

  for (let i = 0; i < numSimulations; i++) {
    let simulation = [historicalPrices[historicalPrices.length - 1]]; 
    
    for (let j = 0; j < numDays; j++) {
      const randomReturn = returns[Math.floor(Math.random() * returns.length)];
      const nextPrice = simulation[simulation.length - 1] * (1 + randomReturn);
      simulation.push(nextPrice);
    }
    
    simulations.push(simulation);
  }
  
  return simulations;
}


function displaySimulationResults(simulations) {
  const finalPrices = simulations.map(simulation => simulation[simulation.length - 1]);
  const predictedPrice = finalPrices.reduce((sum, price) => sum + price, 0) / finalPrices.length;
  
  const resultsSection = document.getElementById("simulation-results");
  resultsSection.innerHTML = `
    <p><strong>Predicted Price After Simulation:</strong><span style="color: lightgreen;"> $${predictedPrice.toFixed(2)}</p>
    <p><strong>Number of Simulations:</strong> ${simulations.length}</p>
    <p><strong>Prediction Days:</strong> ${simulations[0].length - 1}</p>
  `;
}


function plotSimulationResults(simulations) {
    // Create a trace for each simulation
    const traces = simulations.map((simulation, index) => ({
      x: Array.from({ length: simulation.length }, (_, i) => i + 1),
      y: simulation,
      mode: 'lines',
      line: { width: 1, opacity: 0.2 }, 
      name: `Simulation ${index + 1}` 
    }));
  

    const layout = {
      title: {
        text: 'Monte Carlo Simulation - Price Predictions',
        font: { color: 'white' }
      },
      paper_bgcolor: '#1e1e2f', 
      plot_bgcolor: '#1e1e2f', 
      xaxis: {
        title: { text: 'Days', font: { color: 'lightblue' } },
        tickfont: { color: 'lightblue' },
        gridcolor: '#444' 
      },
      yaxis: {
        title: { text: 'Price (USD)', font: { color: 'lightblue' } },
        tickfont: { color: 'lightblue' },
        gridcolor: '#444' 
      },
      legend: {
        font: { color: 'lightblue' }
      }
    };
  
    // Render the plot with all traces
    Plotly.newPlot('plot', traces, layout);
  }
  


document.getElementById("crypto-form").addEventListener("submit", async (e) => {
  e.preventDefault();


  const symbol = document.getElementById("crypto-symbol").value.toLowerCase();
  const simulationsCount = document.getElementById("simulations").value;
  const predictionDays = document.getElementById("days").value;


  await fetchCurrentData(symbol);
  const historicalPrices = await fetchHistoricalPrices(symbol, 365); // Fetch last 365 days of data

  if (historicalPrices.length === 0) {
    return;
  }


  const simulations = monteCarloSimulation(historicalPrices, simulationsCount, predictionDays);

  displaySimulationResults(simulations);
  plotSimulationResults(simulations);
});



function plotResults(simulationResults) {
    const traces = simulationResults.map((simulation, index) => ({
      x: Array.from({ length: simulation.length }, (_, i) => i),
      y: simulation,
      type: 'scatter',
      mode: 'lines',
      line: { width: 1 },
      name: `Simulation ${index + 1}`
    }));
  
    const layout = {
      title: {
        text: 'Monte Carlo Simulation Results',
        font: { color: 'white' }
      },
      paper_bgcolor: '#1e1e2f',
      plot_bgcolor: '#1e1e2f', 
      xaxis: {
        title: { text: 'Days', font: { color: 'lightblue' } },
        tickfont: { color: 'lightblue' },
        gridcolor: '#444' 
      },
      yaxis: {
        title: { text: 'Price (USD)', font: { color: 'lightblue' } },
        tickfont: { color: 'lightblue' },
        gridcolor: '#444' 
      },
      legend: {
        font: { color: 'lightblue' }
      }
    };
  
    console.log(layout); 
    Plotly.newPlot(plotDiv, traces, layout);
  }
  


form.addEventListener('submit', async (event) => {
  event.preventDefault(); 

  const symbol = symbolInput.value.toLowerCase(); 
  const simulations = parseInt(simulationsInput.value); 
  const days = parseInt(daysInput.value); 


  if (!symbol || simulations <= 0 || days <= 0) {
    alert("Please provide valid inputs.");
    return;
  }


  const historicalPrices = await fetchHistoricalPrices(symbol, 365); 
  if (historicalPrices.length === 0) {
    alert("No historical data found for the given cryptocurrency.");
    return;
  }


  const simulationResults = monteCarloSimulation(historicalPrices, simulations, days);


  plotResults(simulationResults);
});



const backToHomeLink = document.querySelector('footer a');
backToHomeLink.addEventListener('click', () => {
  window.history.back();
});
