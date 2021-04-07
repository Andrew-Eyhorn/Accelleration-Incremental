let gameData = {
    currency: 1,
    currencyPerClick: 1,
    speed: 1,
    energy: 0,
    energyProduction: 0,
    mass: 2000000000,
    buildings: {
        B0: { price: 50, amountOwned: 0, production: 1 },
        B1: { price: 500, amountOwned: 0, production: 10 }
    },
    unit: 1,
    lastTick: Date.now(),
    achievements: [{ id: "A0", name: "Auto-cellerate please?", tooltip: "Accelerate to 10 mm/s<br>Reward: Automatically spend your energy to accelerate", unlocked: false, property: 'speed', value: 10, reward() { gameData.autobuyers.accelerate[0] = true } },
                   { id: "A1", name: "Faster than a sloth", tooltip: 'Accelerate to 100 mm/s<br>Reward: You can accelerate by higher increments based on your highest speed', unlocked: false, property: 'speed', value: 100, reward() {} },
                    ],
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
    gameData.currency += gameData.speed * (diff / 1000)
    document.getElementById("currencyVisual").innerHTML = Math.floor(gameData.currency) + " Currency"
    gameData.energy += totalEnergyProduction() * (diff / 1000)
    document.getElementById("energyVisual").innerHTML = Math.floor(gameData.energy) + " miliJoules of energy"
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
    document.getElementById("currencyVisual").innerHTML = Math.floor(gameData.currency) + " Currency"
};
function buyBuilding(building, id, name) {
    if (gameData.currency >= building.price) {
        gameData.currency -= building.price
        building.amountOwned += 1
        building.price = Math.ceil(building.price * 1.2)
        document.getElementById(id).innerHTML = "Buy a " + name + " for " + building.price + " currency"
        document.getElementById("currencyVisual").innerHTML = Math.floor(gameData.currency) + " Currency"
        document.getElementById("energyProductionVisual").innerHTML = Math.floor(totalEnergyProduction()) + " mJ/s"
    }

}
function increaseSpeed() {
    let x = document.getElementById("increaseSpeedSelector")
    let incrementAmount = parseInt(x.options[x.selectedIndex].value)
    let energyNeeded = Math.round(gameData.mass / 2000 * ((incrementAmount/1000) ** 2 + 2 * (incrementAmount/1000) * gameData.speed/1000))
    if (gameData.energy >= energyNeeded) {
        gameData.energy -= energyNeeded
        gameData.speed += incrementAmount
        energyNeeded = Math.round(gameData.mass / 2000 * ((incrementAmount/1000) ** 2 + 2 * (incrementAmount/1000) * gameData.speed/1000))
        document.getElementById("increaseSpeed").innerHTML = "for " + energyNeeded + " miliJoules of energy"
        document.getElementById("energyVisual").innerHTML = Math.floor(gameData.energy) + " miliJoules of energy"
        document.getElementById("speedVisual").innerHTML = Math.floor(gameData.speed) + " mm/s"
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
        newAchievement.innerHTML = achievement.name
        document.getElementById('achievements').append(newAchievement)
        tippy('#' + achievement.id, {
            content: achievement.tooltip,
            allowHTML: true
          })
    }
}
document.addEventListener('input', function (event) {
	if (event.target.id !== 'increaseSpeedSelector') return;
    let x = document.getElementById("increaseSpeedSelector")
    let incrementAmount = parseInt(x.options[x.selectedIndex].value)
    let energyNeeded = Math.round(gameData.mass / 2000 * ((incrementAmount/1000) ** 2 + 2 * (incrementAmount/1000) * gameData.speed/1000))
    document.getElementById("increaseSpeed").innerHTML = "for " + energyNeeded + " miliJoules of energy"  
}, false);
//mainGameLoop updates gameData and visuals
let mainGameLoop = null
function gameCalcluations() {
    mainGameLoop = window.setInterval(function () {
        if (gameData.autobuyers.accelerate[0] === true) { increaseSpeed(); }
        gameData.currency += gameData.speed / (1000 / gameData.settings.tickSpeed)
        gameData.energy += totalEnergyProduction() / (1000 / gameData.settings.tickSpeed)
        document.getElementById("currencyVisual").innerHTML = Math.floor(gameData.currency) + " Currency"
        document.getElementById("energyVisual").innerHTML = Math.floor(gameData.energy * (1 / gameData.unit)) + " miliJoules of energy"
    }, gameData.settings.tickSpeed)
}
function stopGameCalculations() {
    clearInterval(mainGameLoop)
}
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
navigate(0)
generateAchievements()
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