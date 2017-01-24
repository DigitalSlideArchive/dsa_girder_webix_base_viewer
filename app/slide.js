define("slide", ["viewer", "config", "pubsub", "jquery"], function(viewer, config, pubsub, $){
	function init(item){
		$.extend(this, item);
	
	}

	return{
		init: init
	}
})