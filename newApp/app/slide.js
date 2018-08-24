// define("slide", ["viewer", "config", "pubsub"], function(viewer, config, pubsub){
	define("slide",["config", "pubsub", "jquery", "viewer"], function(config, pubsub, $, viewer) {

	function makePromise(url) {
        // Sets up a promise in the proper way using webix
    	return new webix.promise(function(success, fail) {
       		webix.ajax(url, function(text){
        	    if (text) success (text);
                else fail(text.error)
            })
        })
    }

	function init(item){
		$.extend(this, item);
		this.item = item;
		// console.log(this)

		if($$("footer") != undefined){
			// console.log("Inside if")
			$$("footer").define("data",{
				name: this.item.name,
				url: "http://adrc.digitalslidearchive.emory.edu/dsa_base/#slide/" + this.item._id
			});
		}
		
		// url = config.BASE_URL + "/item/" + this._id + "/tiles";
		// promise = makePromise(url);
		// console.log(promise)

       	$.ajax({
       		context: this,
       		url: config.BASE_URL + "/item/" + this._id + "/tiles",
       		success: function(tiles){
				this.tiles = tiles;
				itemId = this._id;
	            pubsub.publish("SLIDE", this);
	
	   			tileSource = {
	            	width: tiles.sizeX,
	                height: tiles.sizeY,
	                tileWidth: tiles.tileWidth,
	                tileHeight: tiles.tileHeight,
	                minLevel: 0,
	                maxLevel: tiles.levels - 1,
	                getTileUrl: function(level, x, y) {
	                	return config.BASE_URL + "/item/" + itemId + "/tiles/zxy/" + level + "/" + x + "/" + y +"?edge=crop";
//"?edge=crop";
	            	}
	    		};

	        	viewer.open(tileSource);
	        }
        });
	}

	return{
		init: init
	}
})