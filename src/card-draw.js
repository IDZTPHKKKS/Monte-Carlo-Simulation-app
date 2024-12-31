document.addEventListener("DOMContentLoaded", () => {
    
    const form = document.getElementById("card-draw-input");
    const numCardsInput = document.getElementById("num-cards");
    const deckTypeInput = document.getElementById("deck-type");
    const numSimulationsInput = document.getElementById("num-simulations");
    const resultsSection = document.getElementById("card-draw-results");

    
    function generateDeck(deckType) {
        let deck = [];
        const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
        const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

        if (deckType === "standard") {
            
            for (let suit of suits) {
                for (let rank of ranks) {
                    deck.push(`${rank} of ${suit}`);
                }
            }
        } else if (deckType === "poker") {
            
            const joker1 = "Joker 1";
            const joker2 = "Joker 2";
            deck = [...deck, ...generateDeck("standard"), joker1, joker2];
        } else if (deckType === "tarot") {
            
            const tarotSuits = ["Cups", "Coins", "Swords", "Wands"];
            const tarotRanks = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"];
            const majorArcana = [
                "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant",
                "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", "Justice", "The Hanged Man",
                "Death", "Temperance", "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
            ];

            
            deck = [...deck, ...majorArcana];

            
            for (let suit of tarotSuits) {
                for (let rank of tarotRanks) {
                    deck.push(`${rank} of ${suit}`);
                }
            }
        }
        return deck;
    }

    
    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    
    function simulateCardDraw(numCards, deckType, numSimulations) {
        let deck = generateDeck(deckType);
        let drawResults = {
            "Hearts": 0,
            "Diamonds": 0,
            "Clubs": 0,
            "Spades": 0,
            "Other": 0
        };

        
        for (let sim = 0; sim < numSimulations; sim++) {
            if (deck.length < numCards) {
                
                console.log("Deck is running low, reshuffling...");
                deck = generateDeck(deckType); 
            }

            shuffleDeck(deck); 
            let drawnCards = [];

            
            for (let i = 0; i < numCards; i++) {
                const drawnCard = deck.pop();

                if (!drawnCard) {
                    continue; 
                }

                drawnCards.push(drawnCard);

                
                if (drawnCard.includes(" of ")) {
                    const suit = drawnCard.split(" of ")[1];

                    
                    if (drawResults.hasOwnProperty(suit)) {
                        drawResults[suit]++;
                    } else {
                        drawResults["Other"]++;
                    }
                } else {
                    
                    drawResults["Other"]++;
                }
            }
        }

        return drawResults;
    }

    
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        
        const numCards = parseInt(numCardsInput.value);
        const deckType = deckTypeInput.value;
        const numSimulations = parseInt(numSimulationsInput.value);

        
        const drawResults = simulateCardDraw(numCards, deckType, numSimulations);

        
        displayResults(drawResults);
    });

    
    function displayResults(results) {
        
        const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
        const resultValues = suits.map(suit => results[suit]);

        
        const data = [
            {
                x: suits,
                y: resultValues,
                type: "bar",
                marker: {
                    color: ["#e74c3c", "#f39c12", "#3498db", "#2ecc71"]
                }
            }
        ];

        const layout = {
            title: {
                text: "Card Suit Distribution (Monte Carlo Simulation)",
                font: {
                    family: "Arial, sans-serif", 
                    size: 24, 
                    color: "#fff", 
                },
            },
            xaxis: {
                title: "Suit",
                titlefont: {
                    family: "Arial, sans-serif",
                    size: 18,
                    color: "#fff", 
                },
                tickfont: {
                    family: "Arial, sans-serif",
                    size: 14,
                    color: "#fff", 
                },
            },
            yaxis: {
                title: "Frequency",
                titlefont: {
                    family: "Arial, sans-serif",
                    size: 18,
                    color: "#fff", 
                },
                tickfont: {
                    family: "Arial, sans-serif",
                    size: 14,
                    color: "#fff", 
                },
            },
            plot_bgcolor: "#2e3b4e", 
            paper_bgcolor: "#2e3b4e", 
            showlegend: false, 
            font: {
                family: "Arial, sans-serif", 
                color: "#fff", 
            },
            bargap: 0.2, 
            hovermode: "closest", 
        };

        
        if (resultsSection) {
            Plotly.newPlot('card-draw-results', data, layout);

            
            resultsSection.style.display = "block";
        } else {
            console.error("Element with id 'card-draw-results' not found.");
        }
    }
});
