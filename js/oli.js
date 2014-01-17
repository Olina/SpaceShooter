/**
 * oli.js 
 * 
 */
window.Oli = (function(window, document, undefined ) {
  var Oli = {};


  
  
  Oli.random = function (min, max) {
    return Math.floor(Math.random()*(max+1-min)+min);
  };


 
  // Expose public methods
  return Oli;
  
})(window, window.document);
