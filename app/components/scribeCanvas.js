var html = require('choo/html')
var css = require('sheetify')
var Nanocomponent = require('nanocomponent')
require('yuki-createjs')

window.createjs = createjs

css('../styles/scribeCanvas.css')

class Component extends Nanocomponent {
  constructor () {
    super()
  }

  createElement (state, emit) {
    return html`
      <div class="canvaswrap">
        <canvas
          width="1050"
          height="1000"
          id="canvas"
          onmousedown=${onmousedown(state, emit)}
          onmousemove=${onmousemove(state, emit)}
          onmouseup=${onmouseup(state, emit)}>
        </canvas>
      </div>
    `
  }

  load (state, emit) {  
    window.stage = new createjs.Stage('canvas')
    window.stage.enableMouseOver()
    window.container = new createjs.Container()
    window.stage.addChild(window.container)
  }

  update () {
    return false
  }
}

function unique (prefix, state, emit) {
  emit('increaseCountId')
  var id = state.countId + ''
  return prefix ? prefix + id : id
}

function onmousedown (state, emit) {
  return e => {
    setTimeout(() => {
      if (state.drawType !== 'line') return

      if (state.isPreventEvent) {
        e.preventDefault()
        emit('preventEvent', false)
        return
      }

      var x = e.pageX - $(e.target).offset().left - state.container.x,
        y = e.pageY - $(e.target).offset().top - state.container.y,
        uid = unique('p_', state, emit)

      emit('addPoint', {x, y, uid})
      emit('mouseDown', true)
    })
  }
}

function onmousemove (state, emit) {
  return e => {
    const {drawType, container, currentId, isMouseDown} = state

    if (isMouseDown && (drawType === 'line' || drawType === 'ctrlline')) {
      var x = e.pageX - $(e.target).offset().left - container.x,
        y = e.pageY - $(e.target).offset().top - container.y,
        isMirror = true

      emit('operateCtrl', {uid: currentId, x, y, isMirror})
    }
  }
}

function onmouseup (state, emit) {
  return e => {
    emit('preventDrag', false)
    emit('mouseDown', false)
  }
}

module.exports = new Component()
