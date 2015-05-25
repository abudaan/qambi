window.onload = function() {

  'use strict';

  var
    // satisfy jslint
    sequencer = window.sequencer,
    console = window.console,
    sliderZoomVertical = document.getElementById('zoom-vertical'),
    sliderZoomHorizontal = document.getElementById('zoom-horizontal'),
    divHorizontal = document.getElementById('horizontal'),
    divVertical = document.getElementById('vertical'),
    initialHeight = 20,
    initialWidth = 20,
    cells;


  sequencer.init().then(
    function onFulFilled(){
      init();
    },
    function onRejected(e){
      alert(e);
    }
  );

  function init(){
    var i, j, html = '';
    for(i = 0; i < 20; i++){
      html += '<div class="row">';
      for(j = 0; j < 50; j++){
        html += '<div class="cell"></div>';
      }
      html += '</div>';
    }
    divHorizontal.innerHTML = html;
    cells = document.getElementsByClassName('cell');
  }

  sliderZoomVertical.addEventListener('change', function(){
    var h = initialHeight * (this.value/1);
    for(var i = 0, maxi = cells.length; i < maxi; i++){
      cells[i].style.height = h + 'px';
    }
  });

  sliderZoomHorizontal.addEventListener('change', function(){
    var w = initialWidth * (this.value/1);
    for(var i = 0, maxi = cells.length; i < maxi; i++){
      cells[i].style.width = w + 'px';
    }
  });
};
