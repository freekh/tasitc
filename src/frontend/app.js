'use strict'

const document = require('global/document')
const hg = require('mercury')
const xtend = require('xtend')
const h = hg.h
1
let App = () => {
  return hg.state({})
}

let Header = {}
Header.style = {
  display: 'flex',
  'min-height': '1000px',
  'max-height': '1000px',
  'width': '100%',
  'height': 'auto',
  'position': 'fixed',
  'background-size': 'cover',
  'top': '0',
  'left': '0',
  'background': 'url(https://src.responsive.io/w=2000/https://tictail.com/cms/wp-content/uploads/2015/05/Tictail_Header._3.jpg) no-repeat center center fixed'
}

Header.text = {}
Header.text.style = {
  display: 'flex',
  'position': 'absolute',
  'color': 'white',
  'top': '200px',
  'left': '200px',
  '-webkit-transform': 'translate(-50%, 50%)',
  '-ms-transform': 'translate(-50%, 50%)',
  'transform': 'translate(-50%, 50%)',
  'z-index': '1'
}

Header.text.render = (state) => {
  return h(
    'h1', {
      style: Header.text.style
    }, String('hei')
  )
}


Header.render = (state) => {
  return h('div.row', {
    style: Header.style
  }, [
    Header.text.render(state)
  ])
}


App.render = (state) => {
  return h('div.container', {
    style: {
      display: 'flex',
      'flex-direction': 'column'
    }
  },[
    Header.render(state),
    h('div.row', {
      style: {
        display: 'flex',
        position: 'absolute',
        top: '100%'
        
      }
    }, String('heai'))
  ])
}

hg.app(document.body, App(), App.render)
