require(["viewer", "slide", "geo", "pubsub", "config", "session"], function(viewer, slide, geo, pubsub, config, session) {

    var layer;
    var map;
    var annotations = [];
    var treeannotations = [{
        "id": "1",
        "type": "layer",
        "value": "Default Layer",
        "open": true,
        "data": []
    }];
    var currentSlide;
    var currentLayerId = "1";

    var tools = {
        height: 25,
        cols: [{
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
            {
                view: "richselect",
                id: "currentLayerCombo",
                value: 1, // the initially selected one
                label: 'Layer',
                inputWidth: 300,
                labelAlign: "right",
                options: treeannotations
            }
        ]
    };


    $$("viewer_root").addView(tools, 1);

    $$("currentLayerCombo").attachEvent("onChange", function(newv, oldv) {
        currentLayerId = newv;
        //webix.message("Value changed from: " + oldv + " to: " + newv);
    });

    function isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    pubsub.subscribe("SLIDE", function(msg, slide) {
        // initialize the geojs viewer
        const params = geo.util.pixelCoordinateParams('#geojs', slide.tiles.sizeX, slide.tiles.sizeY, slide.tiles.tileWidth, slide.tiles.tileHeight);
        //annotations = [];
        //console.log("SLIDE: " + JSON.stringify(slide));


        currentSlide = slide;
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

        if (!isEmpty(slide.meta)) {
            //console.log("META: " + JSON.stringify(slide.meta));

            if (!isEmpty(slide.meta.dsalayers) || slide.meta.dsalayers.length === 0) {
                treeannotations = slide.meta.dsalayers;
            }

            //var slideMetaInfo = JSON.parse(slide.meta);
            //Reload existing annotations.

            if (!isEmpty(slide.meta.geojslayer)) {
                var geojsJSON = slide.meta.geojslayer;

                console.log(JSON.stringify(geojsJSON));

                var reader = geo.createFileReader('jsonReader', { 'layer': layer });
                map.fileReader(reader);

                reader.read(
                    geojsJSON,
                    function() {
                        map.draw();
                    }
                );
            }
        } else {
            treeannotations = [{
                "id": "1",
                "value": "Default Layer",
                "type": "layer",
                "open": true,
                "data": []
            }];
        }
        //console.log(treeannotations);
        //RELOAD LAYERS UI
        var updateStringArray = JSON.stringify(treeannotations);
        var tempJSONArray = JSON.parse(updateStringArray);
        $$("annotations_table").parse(tempJSONArray);

        //RELOAD THE DROP DOWN COMBO
        var list = $$("currentLayerCombo").getPopup().getList();
        list.clearAll();
        list.parse(treeannotations);

        // Update the layers data structure
        //Refresh the tree
        //refreshJSONData();
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
        //console.log(evt.annotation);
        //console.log(evt.annotation.options());

        var newAnnotationTree = {
            id: currentLayerId + ".",
            geoid: evt.annotation.id(),
            value: evt.annotation.name(),
            type: evt.annotation.type(),
            fillColor: "rgb(" + fill.r + "," + fill.g + "," + fill.b + ")",
            fillOpacity: evt.annotation.options('style').fillOpacity,
            strokeColor: "rgb(" + stroke.r + ", " + stroke.g + ", " + stroke.b + ")",
            strokeOpacity: evt.annotation.options('style').strokeOpacity,
            strokeWidth: evt.annotation.options('style').strokeWidth
        };

        for (var i = 0; i < treeannotations.length; i++) {
            if (treeannotations[i].id === currentLayerId) {
                var tempArray = treeannotations[i].data;
                newAnnotationTree.id = newAnnotationTree.id + (tempArray.length + 1);
                tempArray[tempArray.length] = newAnnotationTree;
                break;
            }
        }
        refreshJSONData();
        //console.log(JSON.stringify($$("annotations_table").getChecked()));
    }

    function refreshJSONData() {
        var updateStringArray = JSON.stringify(treeannotations);
        var tempJSONArray = JSON.parse(updateStringArray);
        $$("annotations_table").parse(tempJSONArray);

        var list = $$("currentLayerCombo").getPopup().getList();
        list.clearAll();
        list.parse(treeannotations);

        //var json_data = JSON.stringify(obj);
        //alert(JSON.stringify(layer));
        var annots = layer.annotations();
        var geojsannotations = [];
        for (var i = 0; i < annots.length; i++) {
            var anno = {
                type: annots[i].type(),
                features: annots[i].features()
            }
            geojsannotations[i] = anno;
        }

        var geojsonObj = layer.geojson();

        var metaInfo = {
            dsalayers: treeannotations,
            geojslayer: geojsonObj
        };

        var url = config.BASE_URL + "/item/" + slide._id;
        console.log(url);
        webix.ajax().put(url, { "metadata": metaInfo }, function(text, xml, xhr) {
            // response
            console.log(text);
        });
    }


    // add handlers for drawing annotations
    function draw(type) {
        $('#geojs .geojs-layer').css('pointer-events', 'auto');
        layer.mode(type);
    }

    var color1 = "#fillColor# <span style='background-color:#fillColor#; border-radius:4px; padding-right:10px;'>&nbsp</span>";
    var color2 = "#strokeColor# <span style='background-color:#strokeColor#; border-radius:4px; padding-right:10px;'>&nbsp</span>";

    webix.protoUI({ name: "activeTable" }, webix.ui.treetable, webix.ActiveContent);

    webix.ui({
        view: "window",
        id: "annotations_window",
        move: true,
        resize: true,
        height: 400,
        width: 1050,
        head: {
            view: "toolbar",
            margin: -4,
            cols: [
                { view: "label", label: "Annotations" },
                {
                    view: "text",
                    id: "layername",
                    label: "New Layer"
                        //inputWidth: 300
                },
                {
                    view: "icon",
                    icon: "plus-square",
                    on: {
                        onItemClick: function() {
                            console.log();
                            var newLayer = {
                                id: treeannotations.length + 1,
                                value: $$('layername').getValue(),
                                type: "layer",
                                open: true,
                                data: []
                            };

                            treeannotations[treeannotations.length] = newLayer;
                            currentLayerId = newLayer.id;
                            refreshJSONData();
                            //CLEAR UI
                            $$("layername").setValue("");
                            $$("layername").refresh();
                            $$("currentLayerCombo").setValue(currentLayerId);
                            //$$("currentLayerCombo").refresh();
                        }
                    }
                },
                { view: "icon", icon: "times-circle", click: "$$('annotations_window').hide();" }
            ]
        },
        body: {
            // container:"box",
            view: "activeTable",
            id: "annotations_table",
            threeState: true,
            editable: true,
            //url: "data/treedata.php", datatype:"xml"
            select: true,
            columns: [
                { id: "trash", header: "", template: "{common.trashIcon()}", width: 30 },
                { id: "id", header: "ID", width: 50 },
                {
                    id: "name",
                    header: "Name",
                    width: 250,
                    template: "{common.space()}{common.icon()}{common.treecheckbox()}{common.folder()}#value#"
                },
                { id: "type", header: "Type" },
                { id: "fillColor", header: "Fill Color", editor: "color", template: color1 },
                { id: "strokeColor", header: "Stroke Color", editor: "color", template: color2 },
                { id: "fillOpacity", header: "Fill Opacity", template: "{common.fillOpacity()}", width: 120 },
                { id: "strokeOpacity", header: "Stroke Opacity", template: "{common.strokeOpacity()}", width: 120 },
                { id: "strokeWidth", header: "Stroke Width", template: "{common.strokeWidth()}", width: 120 }
            ],
            scheme: {
                $init: function(obj) {
                    if (obj.type == "layer") {
                        obj.open = true;
                    } else {

                    }
                }
            },

            activeContent: {
                strokeWidth: {
                    id: "stroke_width_counter",
                    view: "counter",
                    width: 100,
                    min: 0,
                    step: 0.2,
                    earlyInit: true,
                    on: {
                        onChange: function(val) {
                            var item = $$("annotations_table").getItem(this.config.$masterId.row);
                            var annotation = layer.annotationById(item.geoid);
                            var opt = annotation.options('style');
                            opt[this.config.$masterId.column] = val;
                            annotation.options({ style: opt }).draw();

                            //UPDATE JSON ALONG WITH LAYER
                            var found = false;
                            for (var i = 0; i < treeannotations.length; i++) {
                                for (var j = 0; j < treeannotations[i].data.length; j++) {
                                    if (treeannotations[i].data[j].geoid == item.geoid) {
                                        treeannotations[i].data[j].strokeWidth = val;
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) {
                                    break;
                                }
                            }
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
                    earlyInit: true,
                    on: {
                        onChange: function(val) {
                            var item = $$("annotations_table").getItem(this.config.$masterId.row);
                            var annotation = layer.annotationById(item.geoid);
                            var opt = annotation.options('style');
                            opt[this.config.$masterId.column] = val;
                            annotation.options({ style: opt }).draw();

                            //UPDATE JSON ALONG WITH LAYER
                            var found = false;
                            for (var i = 0; i < treeannotations.length; i++) {
                                for (var j = 0; j < treeannotations[i].data.length; j++) {
                                    if (treeannotations[i].data[j].geoid == item.geoid) {
                                        treeannotations[i].data[j].fillOpacity = val;
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) {
                                    break;
                                }
                            }
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
                    earlyInit: true,
                    on: {
                        onChange: function(val) {
                            var item = $$("annotations_table").getItem(this.config.$masterId.row);
                            var annotation = layer.annotationById(item.geoid);
                            //console.log(JSON.stringify(annotation));
                            var opt = annotation.options('style');
                            opt[this.config.$masterId.column] = val;
                            annotation.options({ style: opt }).draw();

                            //UPDATE JSON ALONG WITH LAYER
                            var found = false;
                            for (var i = 0; i < treeannotations.length; i++) {
                                for (var j = 0; j < treeannotations[i].data.length; j++) {
                                    if (treeannotations[i].data[j].geoid == item.geoid) {
                                        treeannotations[i].data[j].strokeOpacity = val;
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) {
                                    break;
                                }
                            }
                        }
                    }
                }
            },
            onClick: {
                "fa-trash": function(e, id) {
                    var item = this.getItem(id.row);
                    var annotation = layer.annotationById(item.geoid);
                    layer.removeAnnotation(annotation);
                    this.remove(id.row);
                }
            },
            on: {
                onAfterEditStop: function(state, editor) {
                    var item = this.getItem(editor.row);
                    var annotation = layer.annotationById(item.geoid);
                    var opt = annotation.options('style');
                    opt[editor.column] = state.value;


                    //UPDATE JSON ALONG WITH LAYER
                    var found = false;
                    for (var i = 0; i < treeannotations.length; i++) {
                        for (var j = 0; j < treeannotations[i].data.length; j++) {
                            if (treeannotations[i].data[j].geoid == item.geoid) {
                                switch (editor.column) {
                                    case "fillColor":
                                        treeannotations[i].data[j].fillColor = state.value;
                                        break;
                                    case "strokeColor":
                                        treeannotations[i].data[j].strokeColor = state.value;
                                        break;
                                }
                                found = true;
                                break;
                            }
                        }
                        if (found) {
                            break;
                        }
                    }

                    annotation.options({ style: opt }).draw();
                },
                onItemClick: function(id) {}

            }
        }
    });
});