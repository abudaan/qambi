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
    divScore = document.getElementById('score'),
    numRows = 128,
    numColumns = 2000,
    initialHeight = 20,
    initialWidth = 5,
    rowHeight = initialHeight,
    columnWidth = initialWidth,
    lines, columns;


  sequencer.init().then(
    function onFulFilled(){
      init();
    },
    function onRejected(e){
      alert(e);
    }
  );

  function init(){
    var i, j, html;

    html = '';
    for(i = 0; i < numRows; i++){
      html += '<div class="row">' + i + '</div>';
    }
    divHorizontal.innerHTML = html;
    lines = document.getElementsByClassName('row');


    html = '';
    for(j = 0; j < numColumns; j++){
      html += '<div class="column">' + j + '</div>';
    }
    divVertical.innerHTML = html;
    columns = document.getElementsByClassName('column');

    setTimeout(function(){
      divVertical.style.height = numRows * rowHeight + 'px';
      //divScore.style.width = divVertical.style.width;//numColumns * columnWidth + 'px';
      //divHorizontal.style.width = divVertical.style.width;//numColumns * columnWidth + 'px';
    }, 10);
  }


  sliderZoomVertical.addEventListener('change', function(){
    rowHeight = initialHeight * (this.value/1);
    divVertical.style.height = numRows * rowHeight + 'px';
    for(var i = 0, maxi = lines.length; i < maxi; i++){
      lines[i].style.height = rowHeight + 'px';
    }

  });

  sliderZoomHorizontal.addEventListener('change', function(){
    columnWidth = initialWidth * (this.value/1);
    divScore.style.width = numColumns * columnWidth + 'px';
    divHorizontal.style.width = numColumns * columnWidth + 'px';
    for(var i = 0, maxi = columns.length; i < maxi; i++){
      columns[i].style.width = columnWidth + 'px';
    }
  });
};
