//array for number formatting
let standard = {full:[""," thousand"," million"," billion"," trillion"," quadrillion"," quintillion"," sextillion"," septillion"," octillion"," nonillion"," decillion"," undecillion"," duodecillion"," tredecillion"," quattuordecillion"," quinquadecillion"," sedecillion"," septendecillion"," octodecillion"," novendecillion"," vigintillion"," unvigintillion"," duovigintillion"," tresvigintillion"," quattuorvigintillion"," quinquavigintillion"," sesvigintillion"," septemvigintillion"," octovigintillion"," novemvigintillion"," trigintillion"," untrigintillion"," duotrigintillion"," trestrigintillion"," quattuortrigintillion"," quinquatrigintillion"," sestrigintillion"," septentrigintillion"," octotrigintillion"," noventrigintillion"," quadragintillion"," unquadragintillion"," duoquadragintillion"," tresquadragintillion"," quattuorquadragintillion"," quinquaquadragintillion"," sesquadragintillion"," septenquadragintillion"," octoquadragintillion"," novenquadragintillion"," quinquagintillion"," unquinquagintillion"," duoquinquagintillion"," tresquinquagintillion"," quattuorquinquagintillion"," quinquaquinquagintillion"," sesquinquagintillion"," septenquinquagintillion"," octoquinquagintillion"," novenquinquagintillion"," sexagintillion"," unsexagintillion"," duosexagintillion"," tresexagintillion"," quattuorsexagintillion"," quinquasexagintillion"," sesexagintillion"," septensexagintillion"," octosexagintillion"," novensexagintillion"," septuagintillion"," unseptuagintillion"," duoseptuagintillion"," treseptuagintillion"," quattuorseptuagintillion"," quinquaseptuagintillion"," seseptuagintillion"," septenseptuagintillion"," octoseptuagintillion"," novenseptuagintillion"," octogintillion"," unoctogintillion"," duooctogintillion"],
short:["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","UDc","DDc","TDc","QaDc","QiDc","SxDc","SpDc","ODc","NDc","Vi","UVi","DVi","TVi","QaVi","QiVi","SxVi","SpVi","OVi","NVi","Tg","UTg","DTg","TTg","QaTg","QiTg","SxTg","SpTg","OTg","NTg","Qd","UQd","DQd","TQd","QaQd","QiQd","SxQd","SpQd","OQd","NQd","Qq","UQq","DQq","TQq","QaQq","QiQq","SxQq","SpQq","OQq","NQq","Sg","USg","DSg","TSg","QaSg","QiSg","SxSg","SpSg","OSg","NSg","St","USt","DSt","TSt","QaSt","QiSt","SxSt","SpSt","OSt","NSt","Og","UOg","DOg","TOg","QaOg","QiOg","SxOg","SpOg","OOg","NOg"],
}
function format(number, unit) {
    if (number<10000) return Math.floor(number) + " " + unit
    if (gameData.settings.format === "scientific") {
        var output = number.toExponential()
        return parseFloat(output).toPrecision(5)
    }
    if (number > Number.MAX_SAFE_INTEGER) {
        var output = Number(String(Math.floor(number)).slice(0,1) + String(Math.floor(number)).slice(2,6))
    } 
    else var output = Number(String(Math.floor(number)).slice(0,5))
    if (number === 0) var size = 1
    else var size = Math.floor(Math.log10(Math.floor(number)))+1
    var decimalPosition = -1.5*(size%3)**2+3.5*(size%3)+2 //determines where to put the decimal place for the formatted number
    output = Number(parseFloat((output/10**decimalPosition).toFixed(decimalPosition)))
    return output + " " + gameData.settings.format[Math.floor((size-1)/3)] + " "+ unit
}
//gameData has all gameplay related values
let gameData = {
    currency: 1,
    currencyPerClick: 1,
    speed: 1,
    energy: 0,
    energyProduction: 0,
    mass: 2000000000,
    buildings: [ { id: "B0", name: "CR2032 Button Battery", unlocked : false, price: 50, amountOwned: 0, production: 1 },
                 { id: "B1", name: "CR4250 Button Battery", unlocked : false, price: 500, amountOwned: 0, production: 10 },
                 { id: "B2", name: "AA Battery", unlocked : false, price: 5000, amountOwned: 0, production: 100 },
                 { id: "B3", name: "A23 Battery", unlocked : false, price: 50000, amountOwned: 0, production: 600 },
                ],
    unit: 1,
    lastTick: Date.now(),
    achievements: [{ id: "A0", name: "Auto-cellerate please?", tooltip: "Accelerate to 10 mm/s<br>Reward: Automatically spend your energy to accelerate", unlocked: false, property: 'speed', value: 10, reward() { gameData.autobuyers.accelerate[0] = true } },
                   { id: "A1", name: "Faster than a sloth", tooltip: 'Accelerate to 100 mm/s<br>Reward: You can accelerate by higher increments based on your highest speed', unlocked: false, property: 'speed', value: 100, reward() {} },
                    ],
    settings: { tickSpeed: 100, format: standard.short },
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
    document.getElementById("currencyVisual").firstChild.data = format(gameData.currency, "") + " Currency"
    gameData.energy += totalEnergyProduction() * (diff / 1000)
    document.getElementById("energyVisual").firstChild.data = format(gameData.energy, "milijoules") + " energy"
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
    document.getElementById("currencyVisual").firstChild.data = format(gameData.currency, "") + " Currency"
};
function increaseSpeed() {
    let x = document.getElementById("increaseSpeedSelector")
    let incrementAmount = parseInt(x.options[x.selectedIndex].value)
    let energyNeeded = Math.round(gameData.mass / 2000 * ((incrementAmount/1000) ** 2 + 2 * (incrementAmount/1000) * gameData.speed/1000))
    if (gameData.energy >= energyNeeded) {
        gameData.energy -= energyNeeded
        gameData.speed += incrementAmount
        energyNeeded = Math.round(gameData.mass / 2000 * ((incrementAmount/1000) ** 2 + 2 * (incrementAmount/1000) * gameData.speed/1000))
        document.getElementById("increaseSpeed").firstChild.data = "for " + format(energyNeeded, "milijoules") + " energy"
        document.getElementById("energyVisual").firstChild.data = format(gameData.energy, "milijoules") + " energy"
        document.getElementById("speedVisual").firstChild.data = format(gameData.speed, "mm/s")
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
            notification("Achievement Unlocked: " + currentAchievement.name)
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
        newBuilding.style.display = "none"
        newBuilding.title = "asdkljiouhfdsaoipfuodsiafpujasd"
        document.getElementById("energyBuildings").append(newBuilding)
        tippy('#' + building.id, {
            content: "You have " + building.amountOwned + " " + building.name + " producing " + format(building.amountOwned*building.production,"mj/s"),
          })
    }
    document.getElementById(gameData.buildings[0].id).style.display = "inline-block"
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
    showBuildings()
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
        document.getElementById(building.id).firstChild.data = "Buy " + format(calculateBuildingPrice(building)[1], "")  + building.name + " for " + format(calculateBuildingPrice(building)[0], "") + " currency"
        document.getElementById("currencyVisual").firstChild.data = format(gameData.currency, "") + " Currency"
        document.getElementById("energyProductionVisual").firstChild.data = Math.floor(totalEnergyProduction()) + " mJ/s"
    } else {
        if (gameData.currency >= calculateBuildingPrice(building)) {
            gameData.currency -= calculateBuildingPrice(building)
            building.amountOwned += gameData.bulkBuy
            document.getElementById(building.id).firstChild.data = "Buy " + format(gameData.bulkBuy,"") + building.name + " for " + format(calculateBuildingPrice(building),"") + " currency"
            document.getElementById("currencyVisual").firstChild.data = format(gameData.currency, "") + " Currency"
            document.getElementById("energyProductionVisual").firstChild.data = Math.floor(totalEnergyProduction()) + " mJ/s"
        }
    }
    var instance = tippy(document.getElementById(building.id))
    instance.setContent("You have " + building.amountOwned + " " + building.name + " producing " + building.amountOwned*building.production + "mj/s")
}
function showBuildings() {
    let previousPurchased = false
    for (let building of gameData.buildings) {
        if (gameData.bulkBuy === "Max") {
            document.getElementById(building.id).firstChild.data = "Buy " + format(calculateBuildingPrice(building)[1], "")  + building.name + " for " + format(calculateBuildingPrice(building)[0],"") + " currency"
        } else {
            document.getElementById(building.id).firstChild.data = "Buy " + gameData.bulkBuy + building.name + " for " + format(calculateBuildingPrice(building), "") + " currency"
            }
        if (building.unlocked === false && previousPurchased ) {
            building.unlocked = true
            document.getElementById(building.id).style.display = "inline-block"
        }
        if (building.amountOwned > 0) {
            previousPurchased = true
        }
        else previousPurchased = false
    }
}
function changeFormat() {
    switch(parseInt(document.getElementById("formatSelect").value)) {
        case 0:
            gameData.settings.format = standard.full
            break;
        case 1:
            gameData.settings.format = standard.short
            break;
        case 2:
            gameData.settings.format = "scientific"
            break;
        default: 
            console.log("help" + document.getElementById("formatSelect").value)
    }
    // gameData.settings.format = document.getElementById("formatSelect").value
}
async function notification(text) {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    let op = 0.1;  
    const element = document.getElementById("popupNotification")
    element.innerText = text
    element.style.opacity = 0
    element.style.display = 'flex';
    let timer1 = setInterval(function () {
        if (op >= 1){
            clearInterval(timer1);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
    await delay(5000)
    let timer2 = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer2);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 100);
}
document.addEventListener('input', function (event) {
	if (event.target.id !== 'increaseSpeedSelector') return;
    let x = document.getElementById("increaseSpeedSelector")
    let incrementAmount = parseInt(x.options[x.selectedIndex].value)
    let energyNeeded = Math.round(gameData.mass / 2000 * ((incrementAmount/1000) ** 2 + 2 * (incrementAmount/1000) * gameData.speed/1000))
    document.getElementById("increaseSpeed").firstChild.data = "for " + format(energyNeeded, "") + " miliJoules of energy"
}, false);
//mainGameLoop updates gameData values and visuals
let mainGameLoop = null
function gameCalcluations() {
    mainGameLoop = window.setInterval(function () {
        if (gameData.autobuyers.accelerate[0] === true) { increaseSpeed(); }
        if (document.getElementsByClassName("menu")[1].style.display === 'inline-block') { showBuildings(); }
        gameData.currency += gameData.speed / (1000 / gameData.settings.tickSpeed)
        gameData.energy += totalEnergyProduction() / (1000 / gameData.settings.tickSpeed)
        document.getElementById("currencyVisual").firstChild.data = format(gameData.currency, "") + " Currency"
        document.getElementById("energyVisual").firstChild.data = format(gameData.energy, "milijoules") + " energy"
    }, gameData.settings.tickSpeed)
}
function stopGameCalculations() {
    clearInterval(mainGameLoop)
}   
let tickSpeedSliderValues = [50, 100, 125, 250, 500, 1000]  
let slider = document.getElementById("tickSpeedSlider");
let sliderOutput = document.getElementById("tickSpeedSliderOutput")
sliderOutput.firstChild.data = "Tickspeed: " + tickSpeedSliderValues[slider.value] + " ms/tick"
slider.oninput = function () {
    sliderOutput.firstChild.data = "Tickspeed: " + tickSpeedSliderValues[slider.value] + " ms/tick"
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
