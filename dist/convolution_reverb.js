'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConvolutionReverb = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_audio = require('./init_audio');

var _channel_fx = require('./channel_fx');

var _parse_audio = require('./parse_audio');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConvolutionReverb = exports.ConvolutionReverb = function (_ChannelFX) {
  _inherits(ConvolutionReverb, _ChannelFX);

  _createClass(ConvolutionReverb, null, [{
    key: 'load',
    value: function load(url) {
      return new Promise(function (resolve, reject) {
        (0, _parse_audio.parseSamples)(url).then(function (buffer) {
          buffer = buffer[0];
          if (buffer instanceof AudioBuffer) {
            resolve(new ConvolutionReverb(buffer));
          } else {
            reject('could not parse to AudioBuffer', url);
          }
        });
      });
    }
  }]);

  function ConvolutionReverb(buffer) {
    _classCallCheck(this, ConvolutionReverb);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ConvolutionReverb).call(this));

    if (buffer instanceof AudioBuffer === false && typeof buffer !== 'undefined') {
      console.log('argument is not an instance of AudioBuffer', buffer);
      return _possibleConstructorReturn(_this);
    }
    _this._nodeFX = _init_audio.context.createConvolver();
    _this._nodeFX.buffer = buffer;
    return _this;
  }

  return ConvolutionReverb;
}(_channel_fx.ChannelFX);