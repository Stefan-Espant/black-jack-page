// Variabelen om de som en het aantal Azen bij te houden voor de dealer en de speler
var dealerSum = 0;
var yourSum = 0;

var dealerAceCount = 0;
var yourAceCount = 0; 

// Variabelen voor de verborgen kaart en het kaartspel (deck)
var hidden;
var deck;

// Variabele om bij te houden of de speler (you) nog kaarten kan trekken (hit)
var canHit = true; // staat op true zolang yourSum <= 21

var playerMoney = 100; // Startbedrag van de speler (bijv. € 100)

// Variabele om het startbedrag van de speler op te slaan
var initialMoney = 100;

// Deze functie wordt uitgevoerd wanneer de pagina is geladen
window.onload = function() {
    buildDeck(); // Bouw het kaartspel (deck)
    shuffleDeck(); // Schud het kaartspel (deck)
    checkMoney(); // Controleer het geldbedrag en haal het op uit Local Storage of gebruik het startbedrag
    startGame(); // Start het spel
}

// Functie om het kaartspel (deck) op te bouwen
function buildDeck() {
    // Array met de mogelijke kaartwaarden en types
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["H", "K", "R", "S"];
    deck = [];

    // Maak alle mogelijke kaartcombinaties en voeg ze toe aan het kaartspel (deck)
    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); // Voorbeeld: A-H -> K-H, A-K -> K-K
        }
    }
}

// Functie om het kaartspel (deck) te schudden
function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // Willekeurige index tussen 0 en de lengte van het deck
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

// Functie om het spel te starten
function startGame() {
    hidden = deck.pop(); // Haal een kaart uit het kaartspel en maak het verborgen voor de speler
    dealerSum += getValue(hidden); // Voeg de waarde van de verborgen kaart toe aan de som van de dealer
    dealerAceCount += checkAce(hidden); // Controleer of de verborgen kaart een Aas is en tel deze op bij het aantal Azen van de dealer

    // Blijf kaarten trekken voor de dealer zolang de som kleiner is dan 17
    while (dealerSum < 17) {
        let cardImg = document.createElement("img"); // Maak een <img> element aan om de kaart te tonen
        let card = deck.pop(); // Haal een kaart uit het kaartspel
        cardImg.src = "assets/cards/" + card + ".svg"; // Geef de juiste afbeeldingsbron voor de kaart
        dealerSum += getValue(card); // Voeg de waarde van de kaart toe aan de som van de dealer
        dealerAceCount += checkAce(card); // Controleer of de kaart een Aas is en tel deze op bij het aantal Azen van de dealer
        document.querySelector(".dealer-cards").append(cardImg); // Voeg de kaartafbeelding toe aan het dealerkaartgedeelte op de pagina
    }

    // Deel twee kaarten uit aan de speler
    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img"); // Maak een <img> element aan om de kaart te tonen
        let card = deck.pop(); // Haal een kaart uit het kaartspel
        cardImg.src = "assets/cards/" + card + ".svg"; // Geef de juiste afbeeldingsbron voor de kaart
        yourSum += getValue(card); // Voeg de waarde van de kaart toe aan de som van de speler
        yourAceCount += checkAce(card); // Controleer of de kaart een Aas is en tel deze op bij het aantal Azen van de speler
        document.getElementById("your-cards").append(cardImg); // Voeg de kaartafbeelding toe aan het spelerskaartgedeelte op de pagina
    }

    // Voeg event listeners toe aan de knoppen voor "hit" en "pass"
    document.querySelector(".hit").addEventListener("click", hit);
    document.querySelector(".pass").addEventListener("click", stay);
}

// Functie om een kaart aan de speler toe te voegen (hit)
function hit() {
    // Als de speler niet meer mag trekken (yourSum > 21) of als het geld nul is, stop de functie
    if (!canHit || playerMoney === 0) {
        return;
    }

    let cardImg = document.createElement("img"); // Maak een <img> element aan om de kaart te tonen
    let card = deck.pop(); // Haal een kaart uit het kaartspel
    cardImg.src = "assets/cards/" + card + ".svg"; // Geef de juiste afbeeldingsbron voor de kaart
    yourSum += getValue(card); // Voeg de waarde van de kaart toe aan de som van de speler
    yourAceCount += checkAce(card); // Controleer of de kaart een Aas is en tel deze op bij het aantal Azen van de speler
    document.getElementById("your-cards").append(cardImg); // Voeg de kaartafbeelding toe aan het spelerskaartgedeelte op de pagina

    // Als de Azen een bust veroorzaken (reduceAce(yourSum, yourAceCount) > 21), mag de speler niet meer trekken
    if (reduceAce(yourSum, yourAceCount) > 21) {
        canHit = false;
        updateMoney(-10); // Trek € 10 af van het geldbedrag van de speler bij een bust

        // Check if the player's money is below zero and reset it to zero if needed
        if (playerMoney < 0) {
            playerMoney = 0;
            document.getElementById("money-amount").innerText = "€ " + playerMoney; // Update the displayed money amount on the page
        }
    }
}

// Functie om de beurt van de speler te beëindigen (pass)
function stay() {
    // Verminder de waarde van Azen in de som van de dealer en de speler
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);

    canHit = false; // De speler mag niet meer trekken
    document.getElementById("hidden").src = "assets/cards/" + hidden + ".svg"; // Toon de verborgen kaart van de dealer

    // Bepaal de uitkomst van het spel (wie wint of gelijkspel)
    let message = "";
    if (yourSum > 21) {
        message = "Je verliest!";
        updateMoney(-20); // Trek € 20 af van het geldbedrag van de speler bij een verlies
    }
    else if (dealerSum > 21) {
        message = "Je wint!";
        updateMoney(20); // Voeg € 20 toe aan het geldbedrag van de speler bij een winst
    }
    else if (yourSum == dealerSum) {
        message = "Gelijkspel!";
    }
    else if (yourSum > dealerSum) {
        message = "Je wint!";
        updateMoney(20); // Voeg € 20 toe aan het geldbedrag van de speler bij een winst
    }
    else if (yourSum < dealerSum) {
        message = "Je verliest!";
        updateMoney(-20); // Trek € 20 af van het geldbedrag van de speler bij een verlies
    }

    // Toon de resultaten van het spel op de pagina
    document.querySelector("#dealer-sum").innerText = dealerSum;
    document.querySelector("#your-sum").innerText = yourSum;
    document.querySelector("#results").innerText = message;

    // If the player's money is zero, end the game or take appropriate actions
    if (playerMoney === 0) {
        document.querySelector(".hit").disabled = true; // Disable the hit button
        document.querySelector(".pass").disabled = true; // Disable the pass button
        document.querySelector(".split").disabled = true; // Disable the split button (if you have one)

        // Display a message to the player that the game is over due to lack of money
        document.querySelector("#results").innerText = "Game Over! You've run out of money.";
    }
}

// Functie om de numerieke waarde van een kaart te krijgen
function getValue(card) {
    let data = card.split("-"); // Splits de kaart in de waarde en het type (bijv. "4-C" wordt ["4", "C"])
    let value = data[0];

    if (isNaN(value)) { // Als de waarde geen getal is (A, K, Q, J), geef dan de juiste waarde terug (A = 11, K/Q/J = 10)
        if (value == "A") {
            return 11;
        }
        return 10;
    }

    return parseInt(value); // Converteer de waarde naar een integer (bijv. "7" wordt 7)
}

// Functie om te controleren of een kaart een Aas is
function checkAce(card) {
    if (card[0] == "A") {
        return 1; // Als de kaart een Aas is, geef 1 terug
    }

    return 0; // Anders, geef 0 terug
}

// Functie om de waarde van Azen te verminderen als de som meer dan 21 is
function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10; // Verminder de som met 10 (om Aas van 11 naar 1 te veranderen)
        playerAceCount -= 1; // Verminder het aantal Azen met 1
    }
    return playerSum; // Geef de nieuwe som terug
}

// Functie om het geldbedrag van de speler aan te passen op basis van de uitkomst van het spel
function updateMoney(amount) {
    playerMoney += amount; // Pas het geldbedrag van de speler aan met het gegeven bedrag
    document.getElementById("money-amount").innerText = "€ " + playerMoney; // Werk het weergegeven geldbedrag op de pagina bij
    localStorage.setItem("playerMoney", playerMoney.toString()); // Sla het geldbedrag op in Local Storage
}

// Functie om het geldbedrag te controleren en op te halen bij het laden van de pagina
function checkMoney() {
    let storedMoney = localStorage.getItem("playerMoney");
    if (storedMoney && !isNaN(storedMoney)) {
        playerMoney = parseInt(storedMoney); // Zet het opgeslagen geldbedrag om naar een integer
    } else {
        playerMoney = initialMoney; // Gebruik het startbedrag als er geen eerder opgeslagen bedrag is
        localStorage.setItem("playerMoney", playerMoney.toString()); // Sla het startbedrag op in Local Storage
    }
    document.getElementById("money-amount").innerText = "€ " + playerMoney; // Werk het weergegeven geldbedrag op de pagina bij
}

// Functie om het geldbedrag te resetten naar het startbedrag (€100)
function resetMoney() {
    playerMoney = initialMoney; // Zet de variabele playerMoney terug naar het startbedrag
    document.getElementById("money-amount").innerText = "€ " + playerMoney; // Werk het weergegeven geldbedrag op de pagina bij
    localStorage.setItem("playerMoney", playerMoney.toString()); // Sla het geldbedrag opnieuw op in Local Storage om de reset te behouden
}
