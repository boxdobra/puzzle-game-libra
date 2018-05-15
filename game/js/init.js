(function(){
   var loadedCallback = function() {
      var gameLibra = new GameLibra();
      gameLibra.start();
      document.removeEventListener('DOMContentLoaded', loadedCallback);
   };
   document.addEventListener('DOMContentLoaded', loadedCallback);
})();
