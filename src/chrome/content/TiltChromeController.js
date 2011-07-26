/*
 * TiltChromeControllers.js - Controller implementations handling events
 * version 0.1
 *
 * Copyright (c) 2011 Victor Porof
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */
"use strict";

var TiltChrome = TiltChrome || {};
var EXPORTED_SYMBOLS = ["TiltChrome.Controller.MouseAndKeyboard"];

/**
 * A mouse and keyboard implementation.
 */
TiltChrome.Controller = {};
TiltChrome.Controller.MouseAndKeyboard = function() {

  /**
   * Arcball used to control the visualization using the mouse.
   */
  this.arcball = null;

  /**
   * Retain the position for the mousePressed event.
   */
  var pressX = 0,
    pressY = 0;

  /**
   * Function called automatically by the visualization at the setup().
   * @param {HTMLCanvasElement} canvas: the canvas element
   */
  this.init = function(canvas) {
    this.arcball = new Tilt.Arcball(canvas.width, canvas.height);

    // bind commonly used mouse and keyboard events with the controller
    canvas.addEventListener("mousedown", mousePressed, false);
    canvas.addEventListener("mouseup", mouseReleased, false);
    canvas.addEventListener("dblclick", mouseDoubleClick, false);
    canvas.addEventListener("mousemove", mouseMoved, false);
    canvas.addEventListener("mouseout", mouseOut, false);
    canvas.addEventListener("DOMMouseScroll", mouseScroll, false);
    window.addEventListener("keydown", keyPressed, false);
    window.addEventListener("keyup", keyReleased, false);
  };

  /**
   * Function called automatically by the visualization each frame in draw().
   * @param {Number} frameDelta: the delta time elapsed between frames
   */
  this.loop = function(frameDelta) {
    var vis = this.visualization,
      coord = this.arcball.loop(frameDelta);

    // update the visualization
    vis.setRotation(coord.rotation);
    vis.setTranslation(coord.translation);
  };

  /**
   * Called once after every time a mouse button is pressed.
   */
  var mousePressed = function(e) {
    e.preventDefault();
    e.stopPropagation();

    pressX = e.clientX - e.target.offsetLeft;
    pressY = e.clientY - e.target.offsetTop;

    this.arcball.mousePressed(pressX, pressY, e.which);
  }.bind(this);

  /**
   * Called every time a mouse button is released.
   */
  var mouseReleased = function(e) {
    e.preventDefault();
    e.stopPropagation();

    var releaseX = e.clientX - e.target.offsetLeft;
    var releaseY = e.clientY - e.target.offsetTop;

    if (Math.abs(pressX - releaseX) < 2 && Math.abs(pressY - releaseY) < 2) {
      this.visualization.click(releaseX, releaseY);
    }

    this.arcball.mouseReleased(releaseX, releaseY);
  }.bind(this);

  /**
   * Called every time a mouse button is double clicked.
   */
  var mouseDoubleClick = function(e) {
    e.preventDefault();
    e.stopPropagation();

    var releaseX = e.clientX - e.target.offsetLeft;
    var releaseY = e.clientY - e.target.offsetTop;

    if (Math.abs(pressX - releaseX) < 2 && Math.abs(pressY - releaseY) < 2) {
      this.visualization.doubleClick(releaseX, releaseY);
    }
  }.bind(this);

  /**
   * Called every time the mouse moves.
   */
  var mouseMoved = function(e) {
    e.preventDefault();
    e.stopPropagation();

    var moveX = e.clientX - e.target.offsetLeft;
    var moveY = e.clientY - e.target.offsetTop;

    this.arcball.mouseMoved(moveX, moveY);
  }.bind(this);

  /**
   * Called when the the mouse leaves the visualization bounds.
   */
  var mouseOut = function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.arcball.mouseOut();
  }.bind(this);

  /**
   * Called when the the mouse wheel is used.
   */
  var mouseScroll = function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.arcball.mouseScroll(e.detail);
  }.bind(this);

  /**
   * Called when a key is pressed.
   */
  var keyPressed = function(e) {
    var code = e.keyCode || e.which;

    // handle key events only if the html editor is not open
    if ("open" === TiltChrome.BrowserOverlay.panel.state) {
      return;
    }

    this.arcball.keyPressed(code);
  }.bind(this);

  /**
   * Called when a key is released.
   */
  var keyReleased = function(e) {
    var code = e.keyCode || e.which;

    if (code === 27) {
      // if the panel with the html editor was open, hide it now
      if ("open" === TiltChrome.BrowserOverlay.panel.state) {
        TiltChrome.BrowserOverlay.panel.hidePopup();
      }
      else {
        TiltChrome.BrowserOverlay.destroy(true, true);
        TiltChrome.BrowserOverlay.href = null;
      }
    }

    this.arcball.keyReleased(code);
  }.bind(this);

  /**
   * Delegate method, called when the controller needs to be resized.
   *
   * @param width: the new width of the visualization
   * @param height: the new height of the visualization
   */
  this.resize = function(width, height) {
    this.arcball.resize(width, height);
  };

  /**
   * Destroys this object and sets all members to null.
   * @param {HTMLCanvasElement} canvas: the canvas dom element
   */
  this.destroy = function(canvas) {
    canvas.removeEventListener("mousedown", mousePressed, false);
    canvas.removeEventListener("mouseup", mouseReleased, false);
    canvas.removeEventListener("dblclick", mouseDoubleClick, false);
    canvas.removeEventListener("mousemove", mouseMoved, false);
    canvas.removeEventListener("mouseout", mouseOut, false);
    canvas.removeEventListener("DOMMouseScroll", mouseScroll, false);
    window.removeEventListener("keydown", keyPressed, false);
    window.removeEventListener("keyup", keyReleased, false);

    mousePressed = null;
    mouseReleased = null;
    mouseDoubleClick = null;
    mouseMoved = null;
    mouseOut = null;
    mouseScroll = null;
    keyPressed = null;
    keyReleased = null;

    try {
      this.arcball.destroy();
      this.arcball = null;
    }
    catch (e) {}

    Tilt.destroyObject(this);
  };
};
