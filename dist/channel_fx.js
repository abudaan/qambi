'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChannelFX = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_audio = require('./init_audio');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChannelFX = exports.ChannelFX = function () {
  function ChannelFX() {
    _classCallCheck(this, ChannelFX);

    this.bypass = false;
    this.amount = 0; //0.5

    this._output = _init_audio.context.createGainNode();
    this._wetGain = _init_audio.context.createGainNode();
    this._dryGain = _init_audio.context.createGainNode();

    this._output.gain.value = 1;
    this._wetGain.gain.value = this.amount;
    this._dryGain.gain.value = 1 - this.amount;

    this._wetGain.connect(this._output);
    this._dryGain.connect(this._output);
  }

  // mandatory


  _createClass(ChannelFX, [{
    key: 'setInput',
    value: function setInput(input) {
      if (input instanceof AudioNode === false) {
        console.log('argument is not an instance of AudioNode', input);
        return;
      }

      this._input = input;

      // dry channel
      this._input.connect(this._dryGain);

      // wet channel
      this._input.connect(this._nodeFX);
      this._nodeFX.connect(this._wetGain);
    }

    // mandatory

  }, {
    key: 'setOutput',
    value: function setOutput(output) {
      if (output instanceof AudioNode === false) {
        console.log('argument is not an instance of AudioNode', output);
        return;
      }
      this._output.disconnect();
      this._output.connect(output);
    }

    // mandatory

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._output.disconnect();
      this._nodeFX.disconnect();
      //console.log(this._input)
      try {
        this._input.disconnect(this._dryGain);
        this._input.disconnect(this._nodeFX);
      } catch (e) {
        console.log(e);
      }
    }

    // mandatory

  }, {
    key: 'getOutput',
    value: function getOutput() {
      return this._output;
    }
  }, {
    key: 'setAmount',
    value: function setAmount(value) {
      /*
      this.amount = value < 0 ? 0 : value > 1 ? 1 : value;
      var gain1 = Math.cos(this.amount * 0.5 * Math.PI),
          gain2 = Math.cos((1.0 - this.amount) * 0.5 * Math.PI);
      this.gainNode.gain.value = gain2 * this.ratio;
      */

      if (value < 0) {
        value = 0;
      } else if (value > 1) {
        value = 1;
      }

      this.amount = value;
      this._wetGain.gain.value = this.amount;
      this._dryGain.gain.value = 1 - this.amount;
      //console.log('wet',this.wetGain.gain.value,'dry',this.dryGain.gain.value);
    }
  }]);

  return ChannelFX;
}();