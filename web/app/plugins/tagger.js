define("tagger", ["viewer", "slide", "geo", "pubsub", "config", "session"], function(viewer, slide, geo, pubsub, config, session) {

	webix.message("The Right Panel is loading");

function dynRowAdd() { 
   /*Trying to add a row to the following layout */
  $$("mainSlidePanel").addView({view:"template", template:"New Row!"} )
}

// https://webix.com/snippet/c9db30ae
// https://webix.com/snippet/7078710a  active snippet
// layer.mode(null);
// http://opengeoscience.github.io/geojs/apidocs/geo.annotationLayer.html
// MN693-ZKJ0N-68P9E-00120-15T30
    apply= true;

    var mOpacitySlider = {
        view: "slider",
        id: "m_opacity_slider",
        label: "Opacity",
        labelPosition: "top",
        value: "0.3",
        step: 0.05,
        min: 0,
        max: 1,
        width: 200,
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };


function getSlideTileSource() {
            webix.message("Trying to add a tile source function called");

            item =   $$("thumbnails").getItem( $$("thumbnails").getFirstId());
            $.extend(this, item);
            this.item = item;
            console.log(this);
    $.ajax({
           context: this,
           url: config.BASE_URL + "/item/" + this._id + "/tiles",
           success: function(slideToOverlay){
                           // this.tiles = tiles;
                           this.tiles = item;
                           itemId = this._id;
               // pubsub.publish("SLIDE", this);
                    tileSource = {
                   width: tiles.sizeX,
                   height: tiles.sizeY,
                   tileWidth: tiles.tileWidth,
                   tileHeight: tiles.tileHeight,
                   minLevel: 0,
                   maxLevel: tiles.levels - 1,
                   itemId: itemId,
                   getTileUrl: function(level, x, y) {
                            tileUrl = config.BASE_URL + "/item/" + itemId + "/tiles/zxy/" + level + "/" + x + "/" + y +"?edge=crop"; 
                            console.log(tileUrl);
                           return { "tileSource": tileUrl, x: 1000, y: 50000
                                }


                            }
                    };

                    //https://openseadragon.github.io/docs/OpenSeadragon.Viewer.html#addTiledImage  compositeOperation  , opacity

                    /* *This is in VIEW PORT COORDIATES!! DOH!!! */
                    layerToAdd = {
                            index: 66, opacity: 0.5,
                        x: 0, y: 0 , width: 0.2, id: "myNewLayer",
                    tileSource: "https://openseadragon.github.io/example-images/duomo/duomo.dzi"
                            }


                 mo =    viewer.addTiledImage(layerToAdd);
                 webix.message(mo);

            }

        })
        }



newRightPanel = {
  id: "addRowColExample",
  rows:[
    { type:"header", template:"OSD MultiSlideViewer" },
    { cols:[
      { view:"button", label: "addRow", width: 140, click: function() { webix.message("Row added"); dynRowAdd() } },
      { view:"button", label: "addColumn", width: 140, click: function() { webix.message("Column added"); dynColAdd() }},
      { view:"button", label: "modViewer", width: 140, click: function() { webix.message("trying to mod view?");  getSlideTileSource("hi");  } },
      mOpacitySlider
    ]},
    { view:"resizer" },
	    { id: "viewToSplit", cols:[
      { view:"template", template: "Please Split ME into 2 cols!" }
    ]}
  ]
}

  $$("layout_body").addView(newRightPanel);  // JC THIS IS WHERE TO ADD/EDIT THE TAGGER CODE
$$("layout_body").addView(newRightPanel);
slideData =   $$("thumbnails").getItem( $$("thumbnails").getFirstId());


  

   return tagger
});



