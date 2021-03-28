var gameData = {
    currency: 0,
    currencyPerClick: 1,
    speed: 0.001,
    energy: 0,
    energyProduction: 0,
    mass: 2000000000,
    CR2032: {price: 50, amountOwned: 0, production: 0.001},
    unit: 0.001,
    lastTick: Date.now(),
};
function loadSaveGame() {
    var savegame = JSON.parse(localStorage.getItem("saveGame"))
    if (savegame !== null) {
        gameData = savegame
    }
    calculateOfflineProgress();
}
function calculateOfflineProgress() {
    diff = Date.now() - gameData.lastTick;
    gameData.lastTick = Date.now() 
    gameData.currency += gameData.speed * 1000 * (diff / 1000) 
    document.getElementById("currencyVisual").innerHTML = Math.floor(gameData.currency) + " Currency"
    gameData.energy += totalEnergyProduction() * (diff/1000)
    document.getElementById("energyVisual").innerHTML = Math.floor(gameData.energy*1000) + " miliJoules of energy"
}
function totalEnergyProduction() { //this will need to account for any number of buildings preferably
    return gameData.CR2032.amountOwned*gameData.CR2032.production
}
function giveCurrency() {
    gameData.currency += gameData.currencyPerClick
    document.getElementById("currencyVisual").innerHTML = gameData.currency + " Currency"
};
function buyBuilding(building, name){
    if (gameData.currency >= building.price) {
        gameData.currency -= building.price
        building.amountOwned += 1
        building.price = Math.ceil(building.price*1.2)
        document.getElementById(name).innerHTML = "Buy a " + name + " for " + building.price  + " currency"
        document.getElementById("currencyVisual").innerHTML = Math.floor(gameData.currency) + " Currency"
        document.getElementById("energyProductionVisual").innerHTML = Math.floor(gameData.CR2032.amountOwned*gameData.CR2032.production*1000) + " mJ/s"
    }
    
}
function increaseSpeed() {
    let energyNeeded = Math.round(gameData.mass/2000*(gameData.unit**2 + 2*gameData.unit*gameData.speed))/1000
    if (gameData.energy >= energyNeeded) {
        gameData.energy -= energyNeeded
        gameData.speed += gameData.unit
        energyNeeded = Math.round(gameData.mass/2000*(gameData.unit**2 + 2*gameData.unit*gameData.speed))/1000
        document.getElementById("increaseSpeed").innerHTML = "Increase your speed by 1mm/s for " + energyNeeded*1000 + " miliJoules of energy"
        document.getElementById("energyVisual").innerHTML = Math.floor(gameData.energy*1000) + " miliJoules of energy"
        document.getElementById("speedVisual").innerHTML = Math.floor(gameData.speed*1000) + " mm/s"
    }
}
var mainGameLoop = window.setInterval(function() {
    increaseSpeed();
    gameData.currency += gameData.speed*1000
    gameData.energy += totalEnergyProduction()
    document.getElementById("currencyVisual").innerHTML = Math.floor(gameData.currency) + " Currency"
    document.getElementById("energyVisual").innerHTML = Math.floor(gameData.energy*1000) + " miliJoules of energy"
}, 1000)
//uncomment below code once reset all data is implemented
/*var saveGameLoop = window.setInterval(function() { 
    gameData.lastTick = Date.now() 
    localStorage.setItem("saveGame", JSON.stringify(gameData))
  }, 15000) */ 