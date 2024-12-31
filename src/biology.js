let populationChart = null; 

document.getElementById("biology-form").addEventListener("submit", function (event) {
  event.preventDefault();

  
  const initialPopulation = parseInt(document.getElementById("initial-population").value);
  const growthRate = parseFloat(document.getElementById("growth-rate").value);
  const years = parseInt(document.getElementById("years").value);
  const simulations = parseInt(document.getElementById("simulations").value);
  const modelType = document.getElementById("model-type").value;
  const carryingCapacity = parseInt(document.getElementById("carrying-capacity").value);

  
  const simulationResults = runMonteCarloSimulation(
    initialPopulation,
    growthRate,
    years,
    simulations,
    modelType,
    carryingCapacity
  );

  
  displayResults(simulationResults);
});

function runMonteCarloSimulation(
  initialPopulation,
  growthRate,
  years,
  simulations,
  modelType,
  carryingCapacity
) {
  const results = [];

  for (let sim = 0; sim < simulations; sim++) {
    let population = initialPopulation;
    let populationHistory = [population];

    for (let t = 1; t <= years; t++) {
      
      switch (modelType) {
        case "exponential":
          population = population * Math.exp(growthRate);
          break;

        case "logistic":
          population = population + growthRate * population * (1 - population / carryingCapacity);
          break;

        case "stochastic-exponential":
          population = population * Math.exp(growthRate + (Math.random() - 0.5) * 0.1); 
          break;

        case "exponential-with-carrying-capacity":
          population = population * Math.exp(growthRate * (1 - population / carryingCapacity));
          break;

        case "stochastic-logistic":
          population = population + growthRate * population * (1 - population / carryingCapacity) + (Math.random() - 0.5) * 0.1 * population; 
          break;

        case "stochastic-gaussian":
          const sigma = years / 2; 
          const peakTime = years / 2; 
          const gaussianFactor = Math.exp(-Math.pow(t - peakTime, 2) / (2 * Math.pow(sigma, 2)));
          population = initialPopulation * gaussianFactor * (1 + (Math.random() - 0.5) * 0.1); 
          break;

        case "stochastic-exponential-with-carrying-capacity":
          population = population * Math.exp(growthRate * (1 - population / carryingCapacity) + (Math.random() - 0.5) * 0.1); 
          break;

        case "stochastic-gompertz":
          population = population * Math.exp(growthRate * Math.log(carryingCapacity / population) + (Math.random() - 0.5) * 0.1); 
          break;

        case "stochastic-malthusian":
          population = population * Math.exp(growthRate + (Math.random() - 0.5) * 0.1); 
          break;

        case "stochastic-ricker":
          population = population * Math.exp(growthRate * (1 - population / carryingCapacity) + (Math.random() - 0.5) * 0.1); 
          break;

        default:
          console.log("Unknown model");
      }

      
      populationHistory.push(population);
    }

    results.push(populationHistory);
  }

  return results;
}

function displayResults(simulationResults) {
  
  if (populationChart !== null) {
    populationChart.destroy(); 
  }

  
  const averagePopulation = new Array(simulationResults[0].length).fill(0);
  simulationResults.forEach(simulation => {
    simulation.forEach((population, index) => {
      averagePopulation[index] += population;
    });
  });
  
  
  averagePopulation.forEach((value, index) => {
    averagePopulation[index] /= simulationResults.length;
  });

  
  const ctx = document.getElementById("populationChart").getContext("2d");
  populationChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: Array.from({ length: simulationResults[0].length }, (_, i) => `Year ${i + 1}`),
      datasets: [
        {
          label: "Average Population",
          data: averagePopulation,
          borderColor: "#00FF00", 
          fill: false,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  
  const summaryElement = document.getElementById("best-solution");
  const bestValueElement = document.getElementById("best-value");

  summaryElement.textContent = `Simulation complete for ${simulationResults.length} simulations.`;
  bestValueElement.textContent = `Average final population: ${Math.round(averagePopulation[averagePopulation.length - 1])}`;

  
  const toggleButton = document.getElementById("toggle-results-button");
  const simulationDetails = document.getElementById("simulation-details");
  toggleButton.addEventListener("click", () => {
    simulationDetails.style.display = simulationDetails.style.display === "none" ? "block" : "none";
  });

  
  simulationDetails.innerHTML = simulationResults.map((result, index) => {
    return `<li>Simulation ${index + 1}: Final Population = ${Math.round(result[result.length - 1])}</li>`;
  }).join('');
}