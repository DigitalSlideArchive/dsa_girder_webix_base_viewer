define("slide", ["viewer", "config", "pubsub", "jquery"], function(viewer, config, pubsub, $){

	function init(item){
		$.extend(this, item);
		
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
	                	return config.BASE_URL + "/item/" + itemId + "/tiles/zxy/" + level + "/" + x + "/" + y;
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