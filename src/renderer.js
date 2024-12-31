
const boxes = document.querySelectorAll('.box');

boxes.forEach(box => {
  box.addEventListener('click', async () => {
    const category = box.getAttribute('data-category'); 

    try {
      const pagePath = await window.electron.getPagePath(category);

      if (pagePath) {
        window.location.href = `file://${pagePath}`;
      }
    } catch (error) {
      console.error('Error loading the page:', error);
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes('finance.html')) {
    initializeFinanceSimulation();
  }
});


function initializeFinanceSimulation() {
  const simulateBtn = document.querySelector('#simulateBtn');
  const initialInvestmentInput = document.getElementById("initialInvestment");
  const annualInterestInput = document.getElementById("annualInterest");
  const yearsInput = document.getElementById("years");
  const simulationsInput = document.getElementById("simulations");
  const simulationOutput = document.getElementById('simulationOutput');
  const currentPriceOutput = document.getElementById('currentPriceOutput');
  const distributionSelect = document.getElementById("distributionSelect");


  simulateBtn.addEventListener('click', async () => {
    const initialInvestment = parseFloat(initialInvestmentInput.value);
    const annualInterestRate = parseFloat(annualInterestInput.value) / 100;
    const years = parseInt(yearsInput.value);
    const numSimulations = parseInt(simulationsInput.value);
    const selectedDistribution = distributionSelect.value;

    
    if (isNaN(initialInvestment) || isNaN(annualInterestRate) || isNaN(years) || isNaN(numSimulations)) {
      simulationOutput.innerHTML = "<p>Please fill all fields correctly.</p>";
      return;
    }

    let stockPrice = initialInvestment;

    simulationOutput.innerHTML = "<p>Running simulation... Please wait.</p>";


    setTimeout(() => {
      const results = runMonteCarloSimulation(stockPrice, annualInterestRate, years, numSimulations, selectedDistribution);

      const finalAmounts = results.map(result => result[result.length - 1]);
      
      const averageFinalAmount = finalAmounts.reduce((a, b) => a + b, 0) / finalAmounts.length;
      const volatility = calculateVolatility(results);
      const sharpeRatio = calculateSharpeRatio(results, years);
      const stdDev = calculateStandardDeviation(finalAmounts);

      simulationOutput.innerHTML = `
        <p>Average Final Amount after ${years} years: <strong>$${averageFinalAmount.toFixed(2)}</strong></p>
        <p>Volatility: <strong>${(volatility * 100).toFixed(2)}%</strong></p>
        <p>Sharpe Ratio: <strong>${sharpeRatio.toFixed(2)}</strong></p>
        <p>Standard Deviation: <strong>$${stdDev.toFixed(2)}</strong></p>
      `;

      const simulationData = results.map(result => result.map(value => value.toFixed(2)));

      const plotlyData = simulationData.map((data, index) => ({
        x: Array.from({ length: years + 1 }, (_, i) => i),
        y: data,
        type: 'scatter',
        mode: 'lines',
        name: `Simulation ${index + 1}`,
        line: {
          color: `hsl(${Math.random() * 360}, 100%, 50%)`, 
          width: 2
        }
      }));

      const layout = {
        title: `Monte Carlo Simulation Results (${numSimulations} Simulations)`,
        xaxis: {
          title: 'Years',
          tickfont: { color: 'lightblue' },
          linecolor: 'lightblue',
          showgrid: true,
          gridcolor: 'lightblue'
        },
        yaxis: {
          title: 'Investment Value ($)',
          tickfont: { color: 'lightblue' },
          linecolor: 'lightblue',
          showgrid: true,
          gridcolor: 'lightblue'
        },
        plot_bgcolor: '#1e1e1e', 
        paper_bgcolor: '#1e1e1e', 
        font: { color: 'white' }
      };

      Plotly.newPlot('simulationGraph', plotlyData, layout)
        .then(() => console.log("Graph rendered successfully."))
        .catch(error => console.error("Error rendering graph:", error));


      document.getElementById('results').style.display = 'block';
    }, 2000); 
  });
}

function runMonteCarloSimulation(initialInvestment, interestRate, years, numSimulations, distributionType) {
  const results = [];

  for (let i = 0; i < numSimulations; i++) {
    const yearlyResults = [initialInvestment];

    for (let year = 1; year <= years; year++) {
      const randomRate = getRandomRate(interestRate, distributionType); 
      const lastValue = yearlyResults[year - 1];
      const newValue = lastValue * (1 + randomRate);
      yearlyResults.push(newValue);
    }

    results.push(yearlyResults);
  }

  return results;
}


function getRandomRate(baseRate, distributionType) {
  switch (distributionType) {
    case "normal":
      return baseRate + (Math.random() - 0.5) * 0.1; 
    case "uniform":
      return baseRate + (Math.random() * 0.2 - 0.1);  
    case "lognormal":
      const mu = 0; 
      const sigma = 0.1; 
      const normalRandom = Math.random();  
      const z = Math.sqrt(-2 * Math.log(normalRandom)) * Math.cos(2 * Math.PI * normalRandom);  
      const logNormalRate = baseRate * Math.exp(mu + sigma * z); 
      return logNormalRate;  
    case "exponential":

      const lambda = 1 / 0.1; 
      return baseRate * (-Math.log(Math.random()) / lambda);  
    case "pareto":

      const shape = 2; 
      return baseRate * Math.pow(Math.random(), -1 / shape); 
    case "weibull":
      
      const kWeibull = 1.5; 
      const lambda_w = 1; 
      return baseRate * Math.pow(-Math.log(Math.random()), 1 / kWeibull) * lambda_w; 
    case "gamma":
      
      const alphaGamma = 2; 
      const betaGamma = 1; 
      let gammaSum = 0;
      for (let i = 0; i < alphaGamma; i++) {
        gammaSum += -Math.log(Math.random());
      }
      return baseRate * gammaSum * betaGamma;  
    case "beta":
      
      const alphaBeta = 2; 
      const betaBeta = 5;  
      const betaRandom = Math.random();
      return baseRate * Math.pow(betaRandom, alphaBeta) * Math.pow(1 - betaRandom, betaBeta); 

    case "logistic":
      
      const mu_l = 0; 
      const s = 0.1;  
      const logisticRandom = Math.random();
      return baseRate + s * Math.log(logisticRandom / (1 - logisticRandom));  
    case "binomial":
      
      const n = 10; 
      const p = 0.5; 
      let binomialSum = 0;
      for (let i = 0; i < n; i++) {
        if (Math.random() < p) binomialSum++;
      }
      return baseRate + binomialSum * (baseRate / n);  
    case "poisson":
      
      const lambdaPoisson = 5; 
      let poissonSum = 0;
      let L = Math.exp(-lambdaPoisson);
      let kPoisson = 0;
      do {
        kPoisson++;
        poissonSum += Math.random();
      } while (poissonSum < L);
      return baseRate * kPoisson;  
    case "chiSquared":
      
      const dfChiSquared = 2; 
      let chiSquaredSum = 0;
      for (let i = 0; i < dfChiSquared; i++) {
        chiSquaredSum += Math.pow(Math.random(), 2);
      }
      return baseRate * chiSquaredSum;  
    case "cauchy":
      
      const gammaCauchy = 0.5; 
      const x0 = 0; 
      const cauchyRandom = Math.random();
      return baseRate + gammaCauchy * Math.tan(Math.PI * (cauchyRandom - 0.5));  
    case "studentT":
      
      const dofT = 5; 
      const tRandom = Math.random();
      return baseRate + Math.sqrt(dofT / (Math.random() * Math.random())) * tRandom;  
    default:
      return baseRate;  
  }
}


function calculateSharpeRatio(results, years, riskFreeRate = 0.02) {
  const allReturns = [];


  results.forEach(result => {
    const simulationReturns = [];
    for (let i = 1; i < result.length; i++) {
      const returnRate = (result[i] / result[i - 1]) - 1;
      simulationReturns.push(returnRate);
    }
    allReturns.push(...simulationReturns); 
  });


  const averageReturn = allReturns.reduce((sum, value) => sum + value, 0) / allReturns.length;
  const stdDeviation = calculateStandardDeviation(allReturns);

  
  return (averageReturn - riskFreeRate / years) / stdDeviation;
}

function calculateStandardDeviation(data) {
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const squaredDifferences = data.map(value => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / data.length;
  return Math.sqrt(variance);
}


function calculateVolatility(results) {
  const returns = [];
  
  for (let i = 0; i < results.length; i++) {
    for (let j = 1; j < results[i].length; j++) {
      const returnRate = (results[i][j] - results[i][j-1]) / results[i][j-1];
      returns.push(returnRate);
    }
  }

  return calculateStandardDeviation(returns);
}