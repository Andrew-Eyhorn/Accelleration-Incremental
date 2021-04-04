let gameData = {
    currency: 1000,
    currencyPerClick: 1,
    speed: 0.001,
    energy: 0,
    energyProduction: 0,
    mass: 2000000000,
    buildings: {
        B0: { price: 50, amountOwned: 0, production: 0.001 },
        B1: { price: 500, amountOwned: 0, production: 0.01 }
    },
    unit: 0.001,
    lastTick: Date.now(),
    achievements: [{ unlocked: false, property: 'speed', value: 0.01, reward() { gameData.autobuyers.accelerate[0] = true } },],
    settings: { tickSpeed: 100, },
    autobuyers: { accelerate: [false, false], }
}
function loadSaveGame() {
    let savegame = JSON.parse(localStorage.getItem("saveGame"))
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
    gameData.energy += totalEnergyProduction() * (diff / 1000)
    document.getElementById("energyVisual").innerHTML = Math.floor(gameData.energy * 1000) + " miliJoules of energy"
}
function totalEnergyProduction() {
    totalOutput = 0
    for (i in gameData.buildings) {
        totalOutput += gameData.buildings[i].amountOwned * gameData.buildings[i].production
    }
    return totalOutput
}
function giveCurrency() {
    gameData.currency += gameData.currencyPerClick
    document.getElementById("currencyVisual").innerHTML = gameData.currency + " Currency"
};
function buyBuilding(building, id, name) {
    if (gameData.currency >= building.price) {
        gameData.currency -= building.price
        building.amountOwned += 1
        building.price = Math.ceil(building.price * 1.2)
        document.getElementById(id).innerHTML = "Buy a " + name + " for " + building.price + " currency"
        document.getElementById("currencyVisual").innerHTML = Math.floor(gameData.currency) + " Currency"
        document.getElementById("energyProductionVisual").innerHTML = Math.floor(totalEnergyProduction() * 1000) + " mJ/s"
    }

}
function increaseSpeed() {
    let energyNeeded = Math.round(gameData.mass / 2000 * (gameData.unit ** 2 + 2 * gameData.unit * gameData.speed)) / 1000
    if (gameData.energy >= energyNeeded) {
        gameData.energy -= energyNeeded
        gameData.speed += gameData.unit
        energyNeeded = Math.round(gameData.mass / 2000 * (gameData.unit ** 2 + 2 * gameData.unit * gameData.speed)) / 1000
        document.getElementById("increaseSpeed").innerHTML = "Increase your speed by 1mm/s for " + energyNeeded * 1000 + " miliJoules of energy"
        document.getElementById("energyVisual").innerHTML = Math.floor(gameData.energy * (1 / gameData.unit)) + " miliJoules of energy"
        document.getElementById("speedVisual").innerHTML = Math.floor(gameData.speed * (1 / gameData.unit)) + " mm/s"
    }
}
function navigate(menu) {
    x = document.getElementsByClassName("menu")
    if (menu === 2) { loadAchievements() }
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none"
    }
    x[menu].style.display = "inline-block"
}
navigate(0)
function checkAchievements() {
    for (i in gameData.achievements) {
        currentAchievement = gameData.achievements[i]
        if (currentAchievement.unlocked) continue;
        if (gameData[currentAchievement.property] >= currentAchievement.value) {
            gameData.achievements[i].unlocked = true
            currentAchievement.reward()
        }

    }
}
function loadAchievements() {
    checkAchievements()
    for (i in gameData.achievements) {
        if (gameData.achievements[i].unlocked === true) {
        document.getElementById("A"+ i).style.backgroundColor = "green"
        }
        else {
        document.getElementById("A"+ i).style.backgroundColor = "black" 
        }
    }

}
//mainGameLoop updates gameData and visuals
let mainGameLoop = null
function gameCalcluations() {
    mainGameLoop = window.setInterval(function () {
        if (gameData.autobuyers.accelerate[0] === true) { increaseSpeed(); }
        gameData.currency += gameData.speed * 1000 / (1000 / gameData.settings.tickSpeed)
        gameData.energy += totalEnergyProduction() / (1000 / gameData.settings.tickSpeed)
        document.getElementById("currencyVisual").innerHTML = Math.floor(gameData.currency) + " Currency"
        document.getElementById("energyVisual").innerHTML = Math.floor(gameData.energy * (1 / gameData.unit)) + " miliJoules of energy"
    }, gameData.settings.tickSpeed)
}
function stopGameCalculations() {
    clearInterval(mainGameLoop)
}
gameCalcluations()
//code for tickSpeedSlider option
let tickSpeedSliderValues = [50, 100, 125, 250, 500, 1000]
let slider = document.getElementById("tickSpeedSlider");
let sliderOutput = document.getElementById("tickSpeedSliderOutput")
sliderOutput.innerHTML = tickSpeedSliderValues[slider.value]
slider.oninput = function () {
    sliderOutput.innerHTML = tickSpeedSliderValues[slider.value]
    gameData.settings.tickSpeed = tickSpeedSliderValues[slider.value]
    stopGameCalculations()
    gameCalcluations()
}
//uncomment below code once reset all data is implemented
/*let saveGameLoop = window.setInterval(function() {
    gameData.lastTick = Date.now()
    localStorage.setItem("saveGame", JSON.stringify(gameData))
  }, 15000) */