"use strict";

const getdatazz = async () => {
const response = await fetch('https://glom.azurewebsites.net/dbquery')
const data = await response.json()
return data
}

let basejson
let f = 0
let deck = new Array()
let deckplayed = new Array()
let deckremains = new Array()

const getHeck = () => {
  let heck = new Array()
  for (let k in basejson) {
    try {
      for (let x = 0; x < (basejson[k].count); x++) {
        heck.push(basejson[k].text)
      }
    }
    catch (error) {
    }
  }
  return heck
}

const shuffle = (item) => {
  for (let i = item.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [item[i], item[j]] = [item[j], item[i]]
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const paljastanappi = document.getElementById('paljastanappi')
  const sekoita = document.getElementById('sekoita')
  const kiroa = document.getElementById('kiroa')
  const siunaa = document.getElementById('siunaa')
  const newdeck = document.getElementById('newdeck')
  const getdeck = document.getElementById('getdeck')
  const resetdeck = document.getElementById('resetdeck')
  const savedeck = document.getElementById('savedeck')
  const korttilaskin = document.getElementById('korttilaskin')
  const sekoitapliis = document.getElementById('sekoitapliis')
  const crittsans = document.getElementById('crittsans')
  const misstsans = document.getElementById('misstsans')
  let siunaukset = 0
  let kiroukset = 0

  const addmod = (counter, card) => {
    if (counter == 'siunaukset') {
      siunaukset = (deck.filter(i => i === 'Bless').length)
      siunaukset += 1
      siunaa.innerHTML = 'Blesses ' + siunaukset
    }
    if (counter == 'kiroukset') {
      kiroukset = (deck.filter(i => i === 'Curse').length)
      kiroukset += 1
      kiroa.innerHTML = 'Curses ' + kiroukset
    }
    if (f == 0) {
      deck.push(card)
      shuffle(deck)
    }
    else {
      deckremains.push(card)
      shuffle(deckremains)
      deck = deckplayed.concat(deckremains)
    }
    korttilaskin.innerHTML = (deck.length - f) + ' cards remaining'
    renderDeck()
  } 

  paljastanappi.addEventListener('click', (e) => {
    let rmcard = false
    if (f < deck.length) {
      if (deck[f] === 'Bless') {
        siunaukset -= 1
        siunaa.innerHTML = 'Blesses ' + siunaukset
        rmcard = true
      }
      if (deck[f] === 'Curse') {
        kiroukset -= 1
        kiroa.innerHTML = 'Curses ' + kiroukset
        rmcard = true
      }
      if (deck[f] === 'Miss') {
        sekoitapliis.innerHTML = 'Shuffle after turn'
      }
      if (deck[f] === 'Crit') {
        sekoitapliis.innerHTML = 'Shuffle after turn'
      }
      f++
      renderDeck()
      if (rmcard) {
        deck.splice(f - 1, 1)
        f--
      }
      deckplayed = deck.slice(0, f)
      deckremains = deck.slice(f, deck.length)
      if (deckremains.includes('Crit')) {
        crittsans.innerHTML = 'Critical chance: ' + Math.round((1 / deckremains.length) * 10000) / 100 + '%'
      }
      else {
        crittsans.innerHTML = ''
      }
      if (deckremains.includes('Miss')) {
        misstsans.innerHTML = 'Miss chance: ' + Math.round((1 / deckremains.length) * 10000) / 100 + '%'
      }
      else {
        misstsans.innerHTML = ''
      }
      korttilaskin.innerHTML = (deck.length - f) + ' cards remaining'
    }
  })
  sekoita.addEventListener('click', (e) => {
    shuffle(deck)
    sekoitapliis.innerHTML = ''
    f = 0
    renderDeck()
    korttilaskin.innerHTML = (deck.length - f) + ' cards remaining'
    renderDeck()
  })
  kiroa.addEventListener('click', (e) => {
    addmod('kiroukset', 'Curse')
  })
  siunaa.addEventListener('click', (e) => {
    addmod('siunaukset', 'Bless')
  })
  newdeck.addEventListener('click', (e) => {
    let userdeck = prompt('Upload your deck in JSON', '{"mycard":{"count":6,"text":"0"},"anycard":{"count":5,"text":"-1"}}')
    if (userdeck) {
      for (let k in basejson) {
        if (basejson.hasOwnProperty(k) && k != 'id') {
          delete basejson[k]
        }
      }
      basejson = Object.assign({}, basejson, (JSON.parse(userdeck)))
      deck = getHeck()
      shuffle(deck)
    }
  })
  getdeck.addEventListener('click', (e) => {
    Object.keys(basejson).forEach((k) => {
      if (k.startsWith('_')) {
        delete basejson[k]
      }
    })
    alert(JSON.stringify(basejson))
  })
  savedeck.addEventListener('click', (e) => {
    Object.keys(basejson).forEach((k) => {
      if (k.startsWith('_')) {
        delete basejson[k]
      }
    })
    let xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://glom.azurewebsites.net/dbupdate')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = () => {
      if (xhr.status === 200) {
        alert('Save returned OK')
      }
    }
    xhr.send(JSON.stringify(basejson))
  })
  resetdeck.addEventListener('click', (e) => {
    deck = getHeck()
    shuffle(deck)
    kiroukset = 0
    siunaukset = 0
    kiroa.innerHTML = 'Curses'
    siunaa.innerHTML = 'Blesses'
    sekoitapliis.innerHTML = ''
    f = 0
    renderDeck()
    korttilaskin.innerHTML = (deck.length - f) + ' cards remaining'
  })
})

const renderDeck = () => {
  document.getElementById('deck').innerHTML = ''
  for (let i = 0; i < f; i++) {
    let card = document.createElement('div')
    card.innerHTML = deck[i]
    card.className = 'card'
    if (deck[i] === '1') {
      document.getElementById('deck').appendChild(card).style.color = "#13e84b"
    }
    if (deck[i] === '2') {
      document.getElementById('deck').appendChild(card).style.color = "#13e84b"
    }
    if (deck[i] === '-1') {
      document.getElementById('deck').appendChild(card).style.color = "Red"
    }
    if (deck[i] === '-2') {
      document.getElementById('deck').appendChild(card).style.color = "Red"
    }
    else {
      document.getElementById('deck').appendChild(card)
    }
  }
}

window.addEventListener('load', function () {
  getdatazz()
  .then(result => basejson = result)
  .then(() => deck = getHeck())
  .then(() => shuffle(deck))
  .catch((error) => { exit(error) })
})