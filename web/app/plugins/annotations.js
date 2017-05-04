require(["viewer", "slide", "geo", "pubsub"], function(viewer, slide, geo, pubsub) {

    
var tools = {
        height: 25,
        cols:[
            {
                view: "button",
                width: 28,
                type: "htmlbutton",
                css: "icon_btn",
                label: "<span class='webix_icon fa-icon fa-circle-o'>",
                on: {
                    onItemClick: function() {
                        draw('polygon');
                    }
                }
            },
            {
                view: "button",
                width: 28,
                type: "htmlbutton",
                css: "icon_btn",
                label: "<span class='webix_icon fa-icon fa-square-o'>",
                on: {
                    onItemClick: function() {
                        draw('rectangle');
                    }
                }
            },
            {
                view: "button",
                width: 28,
                type: "htmlbutton",
                css: "icon_btn",
                label: "<span class='webix_icon fa-icon fa-map-marker'>",
                on: {
                    onItemClick: function() {
                       draw('point');
                    }
                }
            },
            {}

        ]
    };
$$("viewer_root").addView(tools, 1);

var layer, map;

pubsub.subscribe("SLIDE", function(msg, slide) {
// initialize the geojs viewer
const params = geo.util.pixelCoordinateParams('#geojs', slide.tiles.sizeX, slide.tiles.sizeY, slide.tiles.tileWidth, slide.tiles.tileHeight);


params.map.clampZoom = false;
params.map.clampBoundsX = false;
params.map.clampBoundsY = false;
map = geo.map(params.map);
layer = map.createLayer('annotation');

// turn off geojs map navigation
map.interactor().options({ actions: [] });   

// add handlers to tie navigation events together
viewer.addHandler('open', setBounds);
viewer.addHandler('animation', setBounds);   

map.geoOn(geo.event.annotation.state, created);  
});


// get the current bounds from the osd viewer
function getBounds() {
    return viewer.viewport.viewportToImageRectangle(viewer.viewport.getBounds(true));
}

// set the geojs bounds from the osd bounds
function setBounds() {
    var bounds = getBounds();
    map.bounds({
        left: bounds.x,
        right: bounds.x + bounds.width,
        top: bounds.y,
        bottom: bounds.y + bounds.height
    });
}



// add a handler for when an annotation is created
function created(evt) {
    $('#geojs .geojs-layer').css('pointer-events', 'none');

    // write out the annotation definition
    console.log(evt.annotation.features()[0]);
}


// add handlers for drawing annotations
function draw(type) {
    $('#geojs .geojs-layer').css('pointer-events', 'auto');
    //var type = $(evt.target).data('type');
    layer.mode(type);
}
});