<?php $title='Space shooter'; include(__DIR__ . '/../src/header.php'); ?>

<div id='flash'>
  <p>Försök att träffa asteroiderna, du har 30 sekunder på dig, se hur många du hinner köra på.<br>
  Om du råkar köra på astroiden så kommer dina aktuella poäng att gå förlorade.</p>
  <center>
    <h1>Tid kvar:</h1>
<div id="timer">10</div></center>
<h2 id="Message"></h2>
<a  id="newGame" href='index.php'>Nytt spel?</a>
<canvas id='canvas1' width='800' height='300' style="width:100%; height:100%;">
  Your browser does not support the element HTML5 Canvas.
</canvas>
<h3>Antal skott du skjutit:</h3>
<div id="nrOfShots">0</div></center>
</div>
<?php include(__DIR__ . '/../src/footer.php'); ?>




