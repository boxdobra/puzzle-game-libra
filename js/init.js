(function(){
	var loadedCallback = function(){
		game();
		document.removeEventListener('DOMContentLoaded', loadedCallback);
	};
	document.addEventListener('DOMContentLoaded', loadedCallback);
})();