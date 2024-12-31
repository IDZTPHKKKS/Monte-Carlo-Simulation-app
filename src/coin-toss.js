document.addEventListener("DOMContentLoaded", () => {
    
    const form = document.getElementById("coin-toss-form");
    const resultsSection = document.getElementById("simulation-results");
    const totalSimulationsElement = document.getElementById("total-simulations");
    const averageResultsElement = document.getElementById("average-results");
    const toggleResultsButton = document.getElementById("toggle-results-button");
    const simulationDetailsElement = document.getElementById("simulation-details");
    const simulationChart = document.getElementById("simulationChart");

    let chart = new Chart(simulationChart, {
        type: "line",
        data: {
            labels: [], 
            datasets: [{
                label: 'Heads Count Per Simulation',
                data: [], 
                borderColor: '#ff6347',
                backgroundColor: 'rgba(255, 99, 71, 0.2)',
                fill: true,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Simulation Number'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Heads'
                    },
                    min: 0
                }
            }
        }
    });

    let currentResults = [];

    
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        
        const numTosses = parseInt(document.getElementById("num-tosses").value);
        const numSimulations = parseInt(document.getElementById("num-simulations").value);

        if (isNaN(numTosses) || numTosses < 1 || isNaN(numSimulations) || numSimulations < 1) {
            alert("Please enter valid simulation details.");
            return;
        }

        
        currentResults = runCoinTossSimulation(numTosses, numSimulations);

        
        const totalHeads = currentResults.reduce((sum, result) => sum + result.headsCount, 0);
        const totalTails = currentResults.reduce((sum, result) => sum + result.tailsCount, 0);
        const avgHeads = (totalHeads / numSimulations).toFixed(2);
        const avgTails = (totalTails / numSimulations).toFixed(2);

        totalSimulationsElement.textContent = `Total Simulations: ${numSimulations}`;
        averageResultsElement.textContent = `Average Heads: ${avgHeads}, Average Tails: ${avgTails}`;

        
        simulationDetailsElement.style.display = "none";
        toggleResultsButton.textContent = "Show Results of Each Round";

        
        updateChart(currentResults);
    });

    
    function runCoinTossSimulation(numTosses, numSimulations) {
        const results = [];

        for (let i = 0; i < numSimulations; i++) {
            let headsCount = 0;
            let tailsCount = 0;

            for (let j = 0; j < numTosses; j++) {
                const tossResult = Math.random() < 0.5 ? "heads" : "tails";
                if (tossResult === "heads") {
                    headsCount++;
                } else {
                    tailsCount++;
                }
            }

            results.push({ headsCount, tailsCount });
        }

        return results;
    }

    
    function updateChart(results) {
        const headsCounts = results.map(result => result.headsCount);

        chart.data.labels = [...Array(results.length).keys()].map(i => `Simulation ${i + 1}`);
        chart.data.datasets[0].data = headsCounts;
        chart.update();
    }

    
    toggleResultsButton.addEventListener("click", () => {
        if (simulationDetailsElement.style.display === "none") {
            simulationDetailsElement.style.display = "block";
            simulationDetailsElement.innerHTML = currentResults.map((result, index) => 
                `<li>Simulation ${index + 1}: Heads = ${result.headsCount}, Tails = ${result.tailsCount}</li>`
            ).join("");
            toggleResultsButton.textContent = "Hide Results of Each Round";
        } else {
            simulationDetailsElement.style.display = "none";
            toggleResultsButton.textContent = "Show Results of Each Round";
        }
    });
});
