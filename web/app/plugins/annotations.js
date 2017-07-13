require(["viewer", "slide", "geo", "pubsub"], function(viewer, slide, geo, pubsub) {
        
    var layer;
    var map;
    var annotations = [];
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
            {
                view: "button",
                width: 28,
                type: "htmlbutton",
                css: "icon_btn",
                label: "<span class='webix_icon fa-icon fa-bars'>",
                on: {
                    onItemClick: function() {
                      $$("annotations_window").show();
                    }
                }
            },
            {}
        ]
    };

    
    $$("viewer_root").addView(tools, 1);

    pubsub.subscribe("SLIDE", function(msg, slide) {
        // initialize the geojs viewer
        const params = geo.util.pixelCoordinateParams('#geojs', slide.tiles.sizeX, slide.tiles.sizeY, slide.tiles.tileWidth, slide.tiles.tileHeight);
        annotations = [];
        $$("annotations_table").clearAll(); 
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
        var fill = evt.annotation.options('style').fillColor;
        var stroke = evt.annotation.options('style').strokeColor;
        
        annotations.push({
            id: evt.annotation.id(),
            name: evt.annotation.name(),
            type: evt.annotation.type(),
            fillColor: "rgb(" + fill.r + "," + fill.g + "," + fill.b + ")",
            fillOpacity: evt.annotation.options('style').fillOpacity,
            strokeColor: "rgb(" + stroke.r + ", " + stroke.g + ", " + stroke.b + ")",
            strokeOpacity: evt.annotation.options('style').strokeOpacity,
            strokeWidth: evt.annotation.options('style').strokeWidth
        });

        $$("annotations_table").clearAll(); 
        $$("annotations_table").parse(annotations);                    
    }

    // add handlers for drawing annotations
    function draw(type) {
        $('#geojs .geojs-layer').css('pointer-events', 'auto');
        layer.mode(type);
    }

    var color1 = "#fillColor# <span style='background-color:#fillColor#; border-radius:4px; padding-right:10px;'>&nbsp</span>";
    var color2 = "#strokeColor# <span style='background-color:#strokeColor#; border-radius:4px; padding-right:10px;'>&nbsp</span>";

    webix.protoUI({name:"activeList"}, webix.ui.datatable,webix.ActiveContent);

    webix.ui({
        view: "window",
        id: "annotations_window",
        move: true,
        resize: true,
        height: 300,
        width: 850,
        head:{
            view: "toolbar",
            margin:-4,
            cols:[
                {view:"label", label: "Annotations" },
                { view:"icon", icon:"times-circle", click:"$$('annotations_window').hide();"}
            ]
        },
        body: {
            view: "activeList",
            rowHeight: 40,
            id: "annotations_table",
            editable:true,
            height:400,
            select: true,
            activeContent:{
                strokeWidth: {
                    id: "stroke_width_counter",
                    view: "counter",
                    width: 100,
                    min: 0,
                    step: 0.2,
                    earlyInit:true,
                    on:{
                        onChange: function(val){
                            var item = $$("annotations_table").getItem(this.config.$masterId.row);
                            var annotation = layer.annotationById(item.id);
                            var opt = annotation.options('style');
                            opt[this.config.$masterId.column] = val;
                            annotation.options({style: opt}).draw(); 
                        }
                    }
                },
                fillOpacity: {
                    id: "fill_opacity_counter",
                    view: "counter",
                    width: 100,
                    min: 0,
                    max: 1,
                    step: 0.1,
                    earlyInit:true,
                    on:{
                        onChange: function(val){
                            var item = $$("annotations_table").getItem(this.config.$masterId.row);
                            var annotation = layer.annotationById(item.id);
                            console.log(item)
                            console.log(annotation)
                            var opt = annotation.options('style');
                            opt[this.config.$masterId.column] = val;
                            annotation.options({style: opt}).draw(); 
                        }
                    }
                },
                strokeOpacity: {
                    id: "stroke_opacity_counter",
                    view: "counter",
                    width: 100,
                    min: 0,
                    max: 1,
                    step: 0.1,
                    earlyInit:true,
                    on:{
                        onChange: function(val){
                            var item = $$("annotations_table").getItem(this.config.$masterId.row);
                            var annotation = layer.annotationById(item.id);
                            var opt = annotation.options('style');
                            opt[this.config.$masterId.column] = val;
                            annotation.options({style: opt}).draw(); 
                        }
                    }
                }
            },
            columns:[
                { id:"trash", header:"", template:"{common.trashIcon()}", width: 30},
                { id:"id", header:"ID", width: 50},
                { id:"name", header:"Name"},
                { id:"type", header:"Type"},
                { id:"fillColor", header:"Fill Color", editor:"color", template: color1},
                { id:"strokeColor", header:"Stroke Color", editor:"color", template: color2},
                { id:"fillOpacity", header:"Fill Opacity", template: "{common.fillOpacity()}", width: 120},
                { id:"strokeOpacity", header:"Stroke Opacity", template: "{common.strokeOpacity()}", width: 120},
                { id:"strokeWidth", header: "Stroke Width", template: "{common.strokeWidth()}", width: 120},
            ],
            onClick:{
                "fa-trash":function(e, id){
                    var item = this.getItem(id.row);
                    var annotation = layer.annotationById(item.id);
                    layer.removeAnnotation(annotation);
                    this.remove(id.row);
                }
            },
            on:{
                onAfterEditStop:function(state, editor){
                    var item = this.getItem(editor.row);
                    var annotation = layer.annotationById(item.id);
                    var opt = annotation.options('style');
                    opt[editor.column] = state.value;
                    annotation.options({style: opt}).draw();
                },
                onItemClick: function(id){
                    var item = this.getItem(id.row);
                    var annotation = layer.annotationById(item.id);
                    var opt = annotation.options('style');
                    

                }
            }
        }
    });
});