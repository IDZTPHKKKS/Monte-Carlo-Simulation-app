document.addEventListener("DOMContentLoaded", () => {
    
    const form = document.getElementById("dice-input");
    const resultsSection = document.getElementById("simulation-results");
    const totalSimulationsElement = document.getElementById("total-simulations");
    const totalCountElement = document.getElementById("total-count");
    const probabilityElement = document.getElementById("probability");
    const roundResultsElement = document.getElementById("round-results");
    const simulationChart = document.getElementById("simulationChart");
    const showResultsButton = document.getElementById("show-results-button");

    
    let chart = new Chart(simulationChart, {
        type: "line",
        data: {
            labels: [], 
            datasets: [{
                label: 'Target Value Frequency',
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
                        text: 'Simulation Round'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Count of Target Value'
                    },
                    min: 0
                }
            }
        }
    });

    
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        
        const numRolls = parseInt(document.getElementById("num-rolls").value);
        const targetValue = parseInt(document.getElementById("target-value").value);

        
        if (isNaN(numRolls) || numRolls < 1 || isNaN(targetValue) || targetValue < 1 || targetValue > 6) {
            alert("Please enter valid simulation details.");
            return;
        }

        
        const results = runDiceSimulation(numRolls, targetValue);

        
        totalSimulationsElement.textContent = `Total Simulations (Rolls): ${results.totalSimulations}`;
        totalCountElement.textContent = `Total Count of Target Value: ${results.totalCount}`;
        probabilityElement.textContent = `Probability: ${(results.totalCount / numRolls).toFixed(4)}`;

        
        updateChart(results);

        
        updateRoundResults(results.roundResults);
    });

    
    function runDiceSimulation(numRolls, targetValue) {
        let totalCount = 0;
        const roundResults = [];

        for (let i = 0; i < numRolls; i++) {
            const rollResult = Math.floor(Math.random() * 6) + 1;
            if (rollResult === targetValue) {
                totalCount++;
            }
            roundResults.push(rollResult);
        }

        return {
            totalSimulations: numRolls,
            totalCount,
            roundResults
        };
    }

    
    function updateChart(results) {
        const simulationData = results.roundResults.reduce((acc, roll, index) => {
            if (roll === parseInt(document.getElementById("target-value").value)) {
                acc.push(acc[index - 1] + 1 || 1); 
            } else {
                acc.push(acc[index - 1] || 0); 
            }
            return acc;
        }, []);

        chart.data.labels = [...Array(results.totalSimulations).keys()].map(i => `Round ${i + 1}`);
        chart.data.datasets[0].data = simulationData;
        chart.update();
    }

    
    function updateRoundResults(roundResults) {
        roundResultsElement.innerHTML = roundResults.map((result, index) =>
            `<li>Round ${index + 1}: ${result}</li>`
        ).join("");

        
        roundResultsElement.style.display = "none";

        
        showResultsButton.addEventListener("click", () => {
            if (roundResultsElement.style.display === "none") {
                roundResultsElement.style.display = "block";
                showResultsButton.textContent = "Hide Results of Each Round";
            } else {
                roundResultsElement.style.display = "none";
                showResultsButton.textContent = "Show Results of Each Round";
            }
        });
    }
});
