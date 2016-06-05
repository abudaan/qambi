/*
  Credits: http://blog.chrislowis.co.uk/2014/07/23/dub-delay-web-audio-api.html
*/

import {context} from './init_audio'
import {ChannelEffect} from './channel_fx'

export class Delay extends ChannelEffect{

  constructor(config = {}){

    super()
    this._nodeFX = context.createDelay();

    ({
      delayTime: this.delayTime = 0.2,
      feedback: this.feedback = 0.7,
      frequency: this.frequency = 1000,
    } = config);

    this._nodeFX.delayTime.value = this.delayTime

    this._feedback = context.createGain()
    this._feedback.gain.value = this.feedback

    this._filter = context.createBiquadFilter()
    this._filter.frequency.value = this.frequency

    this._nodeFX.connect(this._feedback)
    this._feedback.connect(this._filter)
    this._filter.connect(this._nodeFX)

    this.init()
  }

  setTime(value){
    this._nodeFX.delayTime.value = this.delayTime = value
    //console.log('time', value)
  }

  setFeedback(value){
    this._feedback.gain.value = this.feedback = value
    //console.log('feedback', value)
  }

  setFrequency(value){
    this._filter.frequency.value = this.frequency = value
    //console.log('frequency', value)
  }

}

/*
(function () {
  var ctx = new AudioContext();
  audioElement = $('#sliders audio')[0]

  audioElement.addEventListener('play', function(){
    source = ctx.createMediaElementSource(audioElement);

    delay = ctx.createDelay();
    delay.delayTime.value = 0.5;

    feedback = ctx.createGain();
    feedback.gain.value = 0.8;

    filter = ctx.createBiquadFilter();
    filter.frequency.value = 1000;

    delay.connect(feedback);
    feedback.connect(filter);
    filter.connect(delay);

    source.connect(delay);
    source.connect(ctx.destination);
    delay.connect(ctx.destination);
  });

  var controls = $("div#sliders");

  controls.find("input[name='delayTime']").on('input', function() {
    delay.delayTime.value = $(this).val();
  });

  controls.find("input[name='feedback']").on('input', function() {
    feedback.gain.value = $(this).val();
  });

  controls.find("input[name='frequency']").on('input', function() {
    filter.frequency.value = $(this).val();
  });
})();
*/
