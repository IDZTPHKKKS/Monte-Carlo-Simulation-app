document.addEventListener("DOMContentLoaded", function () {
    
    const submitButton = document.querySelector("button[type='submit']");
    const learningRateSlider = document.getElementById("learning-rate");
    const learningRateValue = document.getElementById("learning-rate-value");
    const inputData = document.getElementById("input-data");
    const outputData = document.getElementById("output-data");
    const predictX = document.getElementById("predict-x");
    const outputSection = document.querySelector(".output-section");
    const plotArea = document.getElementById("plot");
    const progressBar = document.querySelector(".progress-bar");
    const progressStatus = document.getElementById("progress-status");
    const resultsDiv = document.getElementById("results");

    const datasetSelect = document.getElementById("data-set");
    const customDatasetDiv = document.getElementById("custom-dataset");
    const csvFileInput = document.getElementById("csv-file");
    const modelSelect = document.getElementById("model");

    
    learningRateSlider.addEventListener("input", function () {
        learningRateValue.textContent = learningRateSlider.value;
    });

    
    datasetSelect.addEventListener("change", function () {
        if (datasetSelect.value === "custom") {
            customDatasetDiv.style.display = "block"; 
        } else {
            customDatasetDiv.style.display = "none"; 
        }
    });

    
    let model;

    function initializeModel() {
        model = tf.sequential();
        model.add(
            tf.layers.dense({
                units: 1,
                inputShape: [1],
                activation: "linear",
            })
        );
        model.compile({
            loss: "meanSquaredError",
            optimizer: tf.train.sgd(0.001), 
        });
    }

    initializeModel(); 

    
    let trainingLoss = [];
    let trainingAccuracy = [];
    let m, c; 
    let categoryMapping = {}; 

    
    function normalizeData(data) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        return data.map(value => (value - min) / (max - min));
    }

    
    function mapCategoricalData(data) {
        const mapping = {};
        let index = 0;
        return data.map(value => {
            if (!(value in mapping)) {
                mapping[value] = index++;
            }
            return mapping[value];
        });
    }

    
    function findClosestCategory(mapping, value) {
        let closestCategory = null;
        let minDifference = Infinity;

        for (const [category, mappedValue] of Object.entries(mapping)) {
            const difference = Math.abs(mappedValue - value);
            if (difference < minDifference) {
                minDifference = difference;
                closestCategory = category;
            }
        }

        return closestCategory;
    }

    
    submitButton.addEventListener("click", function (event) {
        event.preventDefault();

        
        trainingLoss = [];
        trainingAccuracy = [];
        Plotly.purge(plotArea); 

        
        progressBar.style.width = "0%";
        progressStatus.textContent = "Progress: 0% - Current Loss: N/A";
        console.log("Progress bar reset to 0%");

        let xData;
        let yData;

        
        if (datasetSelect.value === "custom" && csvFileInput.files.length > 0) {
            const file = csvFileInput.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                const csvData = e.target.result;
                const parsedData = parseCSV(csvData); 

                
                xData = parsedData.map(row => parseFloat(row[0])); 
                const yRawData = parsedData.map(row => row[row.length - 1]); 

                if (isNaN(yRawData[0])) {
                    
                    yData = mapCategoricalData(yRawData);
                    categoryMapping = { ...yRawData.reduce((acc, val, index) => { acc[val] = yData[index]; return acc; }, {}) };
                } else {
                    
                    yData = yRawData.map(parseFloat);
                }

                if (xData.length !== yData.length) {
                    alert("The number of x-values must match the number of y-values.");
                    return;
                }

                
                xData = normalizeData(xData);
                yData = normalizeData(yData);
                trainModel(xData, yData);
            };
            reader.readAsText(file);
        } else {
            
            xData = inputData.value.split(",").map(Number);
            yData = outputData.value.split(",").map(Number);
            if (xData.length !== yData.length) {
                alert("The number of x-values must match the number of y-values.");
                return;
            }
            xData = normalizeData(xData);
            yData = normalizeData(yData);
            trainModel(xData, yData);
        }
    });

    
    function parseCSV(csvData) {
        const rows = csvData.split("\n").filter(row => row.trim() !== ""); 
        return rows.slice(1).map(row => row.split(",")); 
    }

    
    function trainModel(xData, yData) {
        const learningRate = parseFloat(learningRateSlider.value);

        
        initializeModel();
        model.optimizer = tf.train.sgd(learningRate);

        
        const xs = tf.tensor2d(xData, [xData.length, 1]);
        const ys = tf.tensor2d(yData, [yData.length, 1]);

        
        trainNeuralNetwork(xs, ys, function () {
            displayResults(xs, ys); 
        });
    }

    
    async function trainNeuralNetwork(xs, ys, callback) {
        console.log("Training neural network with data:", xs, ys);

        
        for (let i = 0; i < 100; i++) {
            await model.fit(xs, ys, {
                epochs: 1,
                callbacks: {
                    onBatchEnd: async (batch, logs) => {
                        
                        trainingLoss.push(logs.loss);

                        
                        const accuracy = 1 - logs.loss;
                        trainingAccuracy.push(accuracy);

                        updatePlot(); 
                        updateProgressBar(i + 1, 100, logs.loss); 
                    },
                },
            });
        }

        callback(); 
    }

    
    function updateProgressBar(currentIteration, totalIterations, loss) {
        const progressPercentage = (currentIteration / totalIterations) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressStatus.textContent = `Progress: ${progressPercentage.toFixed(2)}% - Current Loss: ${loss.toFixed(4)}`;
        console.log(`Progress: ${progressPercentage.toFixed(2)}% - Current Loss: ${loss.toFixed(4)}`);
    }

    
    function displayResults(xs, ys) {
        
        const weights = model.layers[0].getWeights();
        const slope = weights[0].dataSync()[0];
        const intercept = weights[1].dataSync()[0];
        m = slope;
        c = intercept;

        
        const xValue = parseFloat(predictX.value);
        const normalizedXValue = (xValue - Math.min(...xs.dataSync())) / (Math.max(...xs.dataSync()) - Math.min(...xs.dataSync()));
        const prediction = model.predict(tf.tensor2d([normalizedXValue], [1, 1]));
        const predictionResult = prediction.dataSync()[0];

        
        const loss = model.evaluate(xs, ys).dataSync()[0];
        const accuracy = 1 - loss;

        
        let finalPrediction = predictionResult;
        if (Object.keys(categoryMapping).length > 0) {
            finalPrediction = findClosestCategory(categoryMapping, predictionResult);
        }

        resultsDiv.innerHTML = `
            <h3>Prediction Results:</h3>
            <p><strong>Predicted Value for x=${xValue}:</strong> ${finalPrediction}</p>
            <p><strong>Linear Regression Equation:</strong> y = ${m.toFixed(2)}x + ${c.toFixed(2)}</p>
            <p><strong>Loss (MSE):</strong> ${loss.toFixed(4)}</p>
            <p><strong>Accuracy:</strong> ${(accuracy * 100).toFixed(2)}%</p>
        `;
    }

    
    function updatePlot() {
        const trace1 = {
            x: Array.from(Array(trainingLoss.length).keys()),
            y: trainingLoss,
            type: "scatter",
            mode: "lines+markers",
            name: "Loss",
            line: { color: "#ff4136" },
        };

        const trace2 = {
            x: Array.from(Array(trainingAccuracy.length).keys()),
            y: trainingAccuracy,
            type: "scatter",
            mode: "lines+markers",
            name: "Accuracy",
            line: { color: "#2ecc40" },
        };

        const layout = {
            title: "Training Progress",
            xaxis: { title: "Iterations" },
            yaxis: { title: "Value" },
            legend: { orientation: "h" },
            paper_bgcolor: "#121212",
            plot_bgcolor: "#121212",
            font: { color: "white" },
        };

        const data = [trace1, trace2];
        Plotly.newPlot(plotArea, data, layout);
    }
});
