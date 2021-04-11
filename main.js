let gameData = {
    currency: 1,
    currencyPerClick: 1,
    speed: 1,
    energy: 0,
    energyProduction: 0,
    mass: 2000000000,
    buildings: [ { id: "B0", name: "CR2032 Button Battery", unlocked : true, price: 50, amountOwned: 0, production: 1 },
                 { id: "B1", name: "CR4250 Button Battery", unlocked : false, price: 500, amountOwned: 0, production: 10 }],
    unit: 1,
    lastTick: Date.now(),
    achievements: [{ id: "A0", name: "Auto-cellerate please?", tooltip: "Accelerate to 10 mm/s<br>Reward: Automatically spend your energy to accelerate", unlocked: false, property: 'speed', value: 10, reward() { gameData.autobuyers.accelerate[0] = true } },
                   { id: "A1", name: "Faster than a sloth", tooltip: 'Accelerate to 100 mm/s<br>Reward: You can accelerate by higher increments based on your highest speed', unlocked: false, property: 'speed', value: 100, reward() {} },
                    ],
    settings: { tickSpeed: 100, },
    bulkBuy: 1,
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
    gameData.currency += gameData.speed * (diff / 1000)
    document.getElementById("currencyVisual").textContent = Math.floor(gameData.currency) + " Currency"
    gameData.energy += totalEnergyProduction() * (diff / 1000)
    document.getElementById("energyVisual").textContent = Math.floor(gameData.energy) + " miliJoules of energy"
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
    document.getElementById("currencyVisual").textContent = Math.floor(gameData.currency) + " Currency"
};
function increaseSpeed() {
    let x = document.getElementById("increaseSpeedSelector")
    let incrementAmount = parseInt(x.options[x.selectedIndex].value)
    let energyNeeded = Math.round(gameData.mass / 2000 * ((incrementAmount/1000) ** 2 + 2 * (incrementAmount/1000) * gameData.speed/1000))
    if (gameData.energy >= energyNeeded) {
        gameData.energy -= energyNeeded
        gameData.speed += incrementAmount
        energyNeeded = Math.round(gameData.mass / 2000 * ((incrementAmount/1000) ** 2 + 2 * (incrementAmount/1000) * gameData.speed/1000))
        document.getElementById("increaseSpeed").textContent = "for " + energyNeeded + " miliJoules of energy"
        document.getElementById("energyVisual").textContent = Math.floor(gameData.energy) + " miliJoules of energy"
        document.getElementById("speedVisual").textContent = Math.floor(gameData.speed) + " mm/s"
    }
}
function navigate(menu) {
    x = document.getElementsByClassName("menu")
    if (menu === 2) { loadAchievementsMenu() }
    if (menu === 0) {loadSpeedMenu()}
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none"
    }
    x[menu].style.display = "inline-block"
}
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
function loadAchievementsMenu() {
    checkAchievements()
    for (i in gameData.achievements) {
        if (gameData.achievements[i].unlocked === true) {
        document.getElementById(gameData.achievements[i].id).style.backgroundColor = "green"
        }
        else {
        document.getElementById(gameData.achievements[i].id).style.backgroundColor = "grey"
        }
    }

}
function loadSpeedMenu() {
    if (gameData.achievements[1].unlocked === true) {
        let selector = document.getElementById("increaseSpeedSelector")
        for (i = selector.length; i < Math.floor(Math.log10(gameData.speed)); i++) {
            if (selector.options[i] === Math.floor(Math.log10(gameData.speed))) {break}
            let option = document.createElement("option")
            option.value = (10**i)
            option.text = (10**i) + " mm/s"
            selector.add(option)
        }
    }
}
function generateAchievements() {
    for (let achievement of gameData.achievements) {
        let newAchievement = document.createElement("rect")
        newAchievement.id = achievement.id
        newAchievement.className = "achievement"
        newAchievement.textContent = achievement.name
        document.getElementById('achievements').append(newAchievement)
        tippy('#' + achievement.id, {
            content: achievement.tooltip,
            allowHTML: true
          })
    }
}
function generateBuildings() {
    for (let building of gameData.buildings) {
        let newBuilding = document.createElement("button")
        newBuilding.onclick = function() { buyBuilding(building);};
        newBuilding.id = building.id
        newBuilding.textContent = "Buy a " + building.name + " for " + building.price + " currency"
        document.getElementById("energyBuildings").append(newBuilding)
        tippy('#' + building.id, {
            content: "You have " + building.amountOwned + " " + building.name + " producing " + building.amountOwned*building.production + "mj/s",
          })
    }
}
function switchBulkBuy(buyAmount) {
    let buttons = document.getElementsByClassName("bulkBuyButton")
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.opacity = "50%"
    }
    switch(buyAmount) {
        case "buy1":
            gameData.bulkBuy = 1
            document.getElementById(buyAmount).style.opacity = "100%"
            break;
        case "buy10":
            gameData.bulkBuy = 10
            document.getElementById(buyAmount).style.opacity = "100%"
            break;
        case "buy100":
            gameData.bulkBuy = 100
            document.getElementById(buyAmount).style.opacity = "100%"
            break;
        case "buyMax":
             gameData.bulkBuy = "Max"
             document.getElementById(buyAmount).style.opacity = "100%"
             break;
    }
    showBuildingStats()
}
function calculateBuildingPrice(building) {
    if (gameData.bulkBuy === "Max") {
        var maxAmount = Math.floor((Math.log(gameData.currency/(5*building.price)+1.2**building.amountOwned))/Math.log(1.2)-building.amountOwned)
        if (maxAmount === 0) {
            return [0, 0]
        }
        return [Math.ceil((building.price*(1.2**(maxAmount+building.amountOwned) - 1.2**building.amountOwned))/0.2), maxAmount]
    } else {
        return Math.ceil((building.price*(1.2**(parseInt(gameData.bulkBuy) + parseInt(building.amountOwned)) - 1.2**building.amountOwned))/0.2)
    }
}
function buyBuilding(building) {
    if (gameData.bulkBuy === "Max") {
        priceAndAmount = calculateBuildingPrice(building)
        gameData.currency -= priceAndAmount[0]
        building.amountOwned += priceAndAmount[1]
        document.getElementById(building.id).textContent = "Buy " + calculateBuildingPrice(building)[1]  + building.name + " for " + calculateBuildingPrice(building)[0] + " currency"
        document.getElementById("currencyVisual").textContent = Math.floor(gameData.currency) + " Currency"
        document.getElementById("energyProductionVisual").textContent = Math.floor(totalEnergyProduction()) + " mJ/s"
    } else {
        if (gameData.currency >= calculateBuildingPrice(building)) {
            gameData.currency -= calculateBuildingPrice(building)
            building.amountOwned += gameData.bulkBuy
            document.getElementById(building.id).textContent = "Buy " + gameData.bulkBuy + building.name + " for " + calculateBuildingPrice(building) + " currency"
            document.getElementById("currencyVisual").textContent = Math.floor(gameData.currency) + " Currency"
            document.getElementById("energyProductionVisual").textContent = Math.floor(totalEnergyProduction()) + " mJ/s"
        }
    }
}
function showBuildingStats() {
    for (let building of gameData.buildings) {
        if (gameData.bulkBuy === "Max") {
            document.getElementById(building.id).textContent = "Buy " + calculateBuildingPrice(building)[1]  + building.name + " for " + calculateBuildingPrice(building)[0] + " currency"
        } else {
            document.getElementById(building.id).textContent = "Buy " + gameData.bulkBuy + building.name + " for " + calculateBuildingPrice(building) + " currency"
            }
        const instance = tippy(document.getElementById(building.id))
        instance.setContent("You have " + building.amountOwned + " " + building.name + " producing " + building.amountOwned*building.production + "mj/s")
        }
}
document.addEventListener('input', function (event) {
	if (event.target.id !== 'increaseSpeedSelector') return;
    let x = document.getElementById("increaseSpeedSelector")
    let incrementAmount = parseInt(x.options[x.selectedIndex].value)
    let energyNeeded = Math.round(gameData.mass / 2000 * ((incrementAmount/1000) ** 2 + 2 * (incrementAmount/1000) * gameData.speed/1000))
    document.getElementById("increaseSpeed").textContent = "for " + numberformat.format(energyNeeded, {format: 'standard'}) + " miliJoules of energy"
}, false);
//mainGameLoop updates gameData and visuals
let mainGameLoop = null
function gameCalcluations() {
    mainGameLoop = window.setInterval(function () {
        if (gameData.autobuyers.accelerate[0] === true) { increaseSpeed(); }
        if (document.getElementsByClassName("menu")[1].style.display === 'inline-block') { showBuildingStats(); }
        gameData.currency += gameData.speed / (1000 / gameData.settings.tickSpeed)
        gameData.energy += totalEnergyProduction() / (1000 / gameData.settings.tickSpeed)
        document.getElementById("currencyVisual").textContent = numberformat.format(gameData.currency, {format: 'standard'}) + " Currency"
        document.getElementById("energyVisual").textContent = numberformat.format(gameData.energy, {format: 'standard'}) + " miliJoules of energy"
    }, gameData.settings.tickSpeed)
}
function stopGameCalculations() {
    clearInterval(mainGameLoop)
}
let tickSpeedSliderValues = [50, 100, 125, 250, 500, 1000]
let slider = document.getElementById("tickSpeedSlider");
let sliderOutput = document.getElementById("tickSpeedSliderOutput")
sliderOutput.textContent = "Tickspeed: " + tickSpeedSliderValues[slider.value] + " ms/tick"
slider.oninput = function () {
    sliderOutput.textContent = tickSpeedSliderValues[slider.value]
    gameData.settings.tickSpeed = tickSpeedSliderValues[slider.value]
    stopGameCalculations()
    gameCalcluations()
}
generateAchievements()
generateBuildings()
navigate(0)
switchBulkBuy("buy1")
gameCalcluations()
//uncomment below code once reset all data is implemented
/*let saveGameLoop = window.setInterval(function() {
    gameData.lastTick = Date.now()
    localStorage.setItem("saveGame", JSON.stringify(gameData))
  }, 15000) */
//   tippy('#A0', {
//     content: 'Accelerate to 10 mm/s<br>Reward: Automatically spend your energy to accelerate',
//     allowHTML: true
//   })
//   tippy('#A1', {
//     content: 'Accelerate to 100 mm/s<br>Reward: You can accelerate by higher increments based on your highest speed',
//     allowHTML: true
//   })