document.addEventListener("DOMContentLoaded", () => {
    
    const form = document.getElementById("roulette-input");
    const resultsSection = document.getElementById("simulation-results");
    const totalSimulationsElement = document.getElementById("total-simulations");
    const totalWinsElement = document.getElementById("total-wins");
    const totalLossesElement = document.getElementById("total-losses");
    const probabilityElement = document.getElementById("probability");
    const roundResultsElement = document.getElementById("simulation-details");
    const toggleResultsButton = document.getElementById("toggle-results-button");
    const simulationChart = document.getElementById("simulationChart");

    
    let chart = new Chart(simulationChart, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: 'Wins per Simulation',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderWidth: 2,
                fill: true
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
                        text: 'Wins'
                    },
                    min: 0
                }
            }
        }
    });

    
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        
        const numSpins = parseInt(document.getElementById("num-spins").value);
        const numSimulations = parseInt(document.getElementById("num-simulations").value);
        const betType = document.getElementById("bet-type").value;
        const specificNumber = parseInt(document.getElementById("specific-number").value);

        
        if (isNaN(numSpins) || numSpins < 1 || isNaN(numSimulations) || numSimulations < 1 || (betType === "number" && (isNaN(specificNumber) || specificNumber < 0 || specificNumber > 36))) {
            alert("Please enter valid simulation details.");
            return;
        }

        
        const results = runRouletteSimulation(numSpins, numSimulations, betType, specificNumber);

        
        totalSimulationsElement.textContent = `Total Simulations: ${results.totalSimulations}`;
        totalWinsElement.textContent = `Total Wins: ${results.totalWins}`;
        totalLossesElement.textContent = `Total Losses: ${results.totalLosses}`;
        probabilityElement.textContent = `Win Probability: ${(results.totalWins / (results.totalSimulations * numSpins)).toFixed(4)}`;

        
        updateChart(results.winsPerSimulation);

        
        toggleResultsButton.style.display = "inline-block";
        roundResultsElement.style.display = "none"; 
    });

    
    function runRouletteSimulation(numSpins, numSimulations, betType, specificNumber) {
        const winsPerSimulation = []; 
        let totalWins = 0;
        let totalLosses = 0;

        for (let i = 0; i < numSimulations; i++) {
            let wins = 0;
            for (let j = 0; j < numSpins; j++) {
                const spinResult = Math.floor(Math.random() * 37); 
                const isWin = checkWin(spinResult, betType, specificNumber);
                if (isWin) {
                    wins++;
                }
            }
            winsPerSimulation.push(wins);
            totalWins += wins;
            totalLosses += numSpins - wins;
        }

        return {
            totalSimulations: numSimulations,
            totalWins,
            totalLosses,
            winsPerSimulation
        };
    }

    
    function checkWin(spinResult, betType, specificNumber) {
        switch (betType) {
            case "red":
                return [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(spinResult);
            case "black":
                return [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(spinResult);
            case "odd":
                return spinResult % 2 !== 0 && spinResult !== 0;
            case "even":
                return spinResult % 2 === 0 && spinResult !== 0;
            case "number":
                return spinResult === specificNumber;
            default:
                return false;
        }
    }

    
    function updateChart(winsPerSimulation) {
        chart.data.labels = [...Array(winsPerSimulation.length).keys()].map(i => `Simulation ${i + 1}`);
        chart.data.datasets[0].data = winsPerSimulation;
        chart.update();
    }

    
    toggleResultsButton.addEventListener("click", () => {
        roundResultsElement.style.display = roundResultsElement.style.display === "none" ? "block" : "none";
        roundResultsElement.innerHTML = `
            <h3>Round Details:</h3>
            <ul id="round-details">
                ${winsPerSimulation.map((wins, i) => `<li>Simulation ${i + 1}: ${wins} wins</li>`).join('')}
            </ul>
        `;
    });
});
