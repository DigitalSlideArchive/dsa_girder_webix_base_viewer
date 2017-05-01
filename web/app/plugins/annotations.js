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
                        draw('rectangle');
                        console.log("draw rect")
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
                       draw('rectangle');
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

//$('.controls-container button').click(draw);


   /*var overlay = viewer.fabricjsOverlay(); 
    var canvas = overlay.fabricCanvas(); 
    console.log(canvas)
    var drawing = null;
    //drawOn();
    
    viewer.setControlsEnabled(false);
        viewer.setMouseNavEnabled(false);
        
    canvas.on('mouse:down', function(o){
            console.log(o)
        });
    console.log(canvas.__eventListeners["mouse:down"])
*/
    /*var tools = {
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
                        viewer.setControlsEnabled(false);
                        viewer.setMouseNavEnabled(false);
                        drawing = "ellipse";
                        //selectionOff();
                        //drawOn();
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
                        viewer.setControlsEnabled(false);
                        viewer.setMouseNavEnabled(false);
                        drawing = "rect";
                        //selectionOff();
                        //drawOn();
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
                       
                    }
                }
            },
            {
                view: "button",
                width: 28,
                type: "htmlbutton",
                css: "icon_btn",
                label: "<span class='webix_icon fa-icon fa-check'>",
                on: {
                    onItemClick: function() {
                        drawing = null;
                        //drawOff();
                        selectionOn();
                        console.log(canvas)
                    }
                }
            },
            {
                view: "button",
                width: 28,
                type: "htmlbutton",
                css: "icon_btn",
                label: "<span class='webix_icon fa-icon fa-trash-o'>",
                on: {
                    onItemClick: function() {
                       deleteSelected();
                    }
                }
            },
            { 
                view:"toggle", 
                width: 100,
                offLabel:"Drawing On", 
                onLabel:"Drawing Off",
                value: true,
                click: function(){
                   if(this.data.value){
                        viewer.setControlsEnabled(false);
                        viewer.setMouseNavEnabled(false);
                   }
                   else{
                        viewer.setControlsEnabled(true);
                        viewer.setMouseNavEnabled(true);
                    //selectionOff()
                        //drawOff();
                   }
                }
            },
            {}

        ]
    };

    function drawOff(){
        viewer.setControlsEnabled(true);
        viewer.setMouseNavEnabled(true);
        /*canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');

        canvas.__eventListeners["mouse:down"] = [];
        canvas.__eventListeners["mouse:move"] = [];
        canvas.__eventListeners["mouse:up"] = [];

    }

    function drawOn(){
        console.log("enable drawing")
        
        var shape, isDown, origin;
        console.log(canvas)
        canvas.on('mouse:down', function(o){
            console.log("mouse:down")
            isDown = true;
            origin = canvas.getPointer(o.e);

            if(drawing == "rect"){
                var pointer = canvas.getPointer(o.e);
                shape = new fabric.Rect({
                    left: origin.x,
                    top: origin.y,
                    originX: 'left',
                    originY: 'top',
                    width: pointer.x-origin.x,
                    height: pointer.y-origin.y,
                    fill: 'rgba(0,0,0,0)',
                    stroke: 'red',
                    strokeWidth: 10,
                    angle: 0
                });
            }
            else if(drawing == "ellipse"){
                var pointer = canvas.getPointer(o.e);
                shape = new fabric.Ellipse({
                    left: pointer.x,
                    top: pointer.y,
                    fill: 'rgba(0,0,0,0)',
                    stroke: 'blue',
                    strokeWidth: 10,
                    selectable: true,
                    originX: 'center', originY: 'center',
                    rx: 5,
                    ry: 1
                });
            }
            else{
                return;
            }

            canvas.add(shape);
        });

        canvas.on('mouse:move', function(o){
            if (!isDown) return;

            var pointer = canvas.getPointer(o.e);

            if(drawing == "rect"){
                if(origin.x>pointer.x){
                     shape.set({ left: Math.abs(pointer.x) });
                }
                if(origin.y>pointer.y){
                     shape.set({ top: Math.abs(pointer.y) });
                }

                shape.set({ width: Math.abs(origin.x - pointer.x) });
                shape.set({ height: Math.abs(origin.y - pointer.y) });
            }

            if(drawing == "ellipse"){
                shape.set({ rx: Math.abs(origin.x - pointer.x),ry:Math.abs(origin.y - pointer.y) });
            }

            canvas.renderAll();
        });

        canvas.on('mouse:up', function(o){
           isDown = false;
        });
    }

    function selectionOn(){
        canvas.isDrawingMode = false;
        viewer.setControlsEnabled(false);
        viewer.setMouseNavEnabled(false);
        canvas.selection = true;
        canvas.forEachObject(function(o){ o.setCoords() })
    }

    function selectionOff(){
        canvas.isDrawingMode = true;
        viewer.setControlsEnabled(true);
        viewer.setMouseNavEnabled(true);
        canvas.selection = false;
        canvas.forEachObject(function(o){ o.setCoords() })
    }

    function deleteSelected(){
        var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();

        if (activeObject) {
            webix.confirm({
                ok:"Yes", 
                cancel:"No",
                text:"You selected annotation for deletion. Are you sure?",
                callback:function(result){ 
                    if (result){              
                     canvas.remove(activeObject);
                    }            
                }
            });
        }
        else if (activeGroup) {
            var objectsInGroup = activeGroup.getObjects();
            webix.confirm({
                ok:"Yes", 
                cancel:"No",
                text:"You selected " + objectsInGroup.length +  " annotations for deletion. Are you sure?",
                callback:function(result){ 
                    if (result){              
                        canvas.discardActiveGroup();
                        objectsInGroup.forEach(function(object) {
                            canvas.remove(object);
                        });
                    }            
                }
            });
        }
    }*/

   // $$("viewer_root").addView(tools, 1);


});