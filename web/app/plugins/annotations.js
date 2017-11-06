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
    var currentShape = "rectangle";
    var animationInProgress = false;

    var tools = {
        height: 25,
        cols: [{
                view: "button",
                width: 28,
                type: "htmlbutton",
                css: "icon_btn",
                label: "<span class='webix_icon fa fa-connectdevelop'>",
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
                view: "toggle",
                id: "draw_toggle",
                type: "iconButton",
                name: "Draw",
                inputWidth: 180,
                offIcon: "toggle-off",
                onIcon: "toggle-on",
                offLabel: "Drawing Disabled",
                onLabel: "Drawing Enabled",
                on: {
                    onItemClick: function() {
                        draw(currentShape);
                    }
                }
            },
            {
                view: "toggle",
                id: "show_labels_toggle",
                type: "iconButton",
                name: "Labels",
                inputWidth: 180,
                offIcon: "toggle-off",
                onIcon: "toggle-on",
                offLabel: "No Labels",
                onLabel: "Labels",
                on: {
                    onItemClick: function() {
                        toggleLabel();
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

    //UTILITY FUNCTION MIGHT NEED TO REMOVE THIS
    function isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }

    // add handlers for drawing annotations
    function draw(type) {
        console.log("Entering drawing function...");
        if ($$("draw_toggle").getValue() === 1) {
            currentShape = type;
            $('#geojs .geojs-layer').css('pointer-events', 'auto');
            layer.mode(currentShape);
        }
    }

    //Toggle Labels
    function toggleLabel() {
        if ($$("show_labels_toggle").getValue() === 1) {
            //ON
            layer.options('showLabels', true);
            layer.draw();
        } else {
            //OFF
            layer.options('showLabels', false);
            layer.draw();
        }
    }

    //WE NEED TO USE THESE TO CONVERT GEOJS RGB INITIAL VALUE TO HEX - CURRENTLY NOT USED
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    //WE NEED TO USE THESE TO CONVERT GEOJS RGB INITIAL VALUE TO HEX - CURRENTLY NOT USED
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    // add a handler for when an annotation is created
    function created(evt) {
        $('#geojs .geojs-layer').css('pointer-events', 'none');
        //WE NEED TO USE THESE TO CONVERT GEOJS RGB INITIAL VALUE TO HEX - CURRENTLY NOT USED
        var fill = evt.annotation.options('style').fillColor;
        var stroke = evt.annotation.options('style').strokeColor;
        //console.log(evt.annotation);
        //console.log(evt.annotation.options());

        console.log(JSON.stringify(fill));

        var newAnnotationTree = {
            id: currentLayerId + ".",
            geoid: evt.annotation.id(),
            value: evt.annotation.name(),
            type: evt.annotation.type(),
            fillColor: "#00FF00",
            fillOpacity: evt.annotation.options('style').fillOpacity,
            strokeColor: "#000000",
            strokeOpacity: evt.annotation.options('style').strokeOpacity,
            strokeWidth: evt.annotation.options('style').strokeWidth
        };

        console.log("CREATED:" + newAnnotationTree.geoid);
        console.log("TREE ANNOTATIONS: " + JSON.stringify(treeannotations));

        for (var i = 0; i < treeannotations.length; i++) {
            if (treeannotations[i].id === currentLayerId) {
                var tempArray = treeannotations[i].data;
                newAnnotationTree.id = newAnnotationTree.id + (tempArray.length + 1);
                tempArray[tempArray.length] = newAnnotationTree;
                break;
            }
        }
        updateGirderWithAnnotationData();
        //console.log(JSON.stringify($$("annotations_table").getChecked()));
    }

    function updateGirderWithAnnotationData() {
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

        //var geojsonObj = layer.geojson();
        //Johnathan Fix for  storing projection information in the geojson it will always be interpreted correctly even if we change the default behavio
        var geojsonObj = layer.geojson(undefined, undefined, undefined, true);

        var metaInfo = {
            dsalayers: treeannotations,
            geojslayer: geojsonObj
        };

        var url = config.BASE_URL + "/item/" + slide._id;
        console.log(url);
        webix.ajax().put(url, { "metadata": metaInfo }, function(text, xml, xhr) {
            // response
            console.log("Successfully updated girder with annotations");
            //console.log(text);
            if ($$("draw_toggle").getValue() === 1) {
                console.log("completed adding annotation to UI, draw is sticky calling draw function again");
                //currentshape is retained it only changes when you click the button
                draw(currentShape);
            }
        });
    }

    function reinitializeTreeLayers() {
        //Forcefully clear the arry to stop appending till ECMAScript 5
        treeannotations.length = 0;
        treeannotations = [{
            "id": "1",
            "value": "Default Layer",
            "type": "layer",
            "open": true,
            "data": []
        }];
        reloadAnnotationsTable();
        treeCheckBoxesClicked();
    }

    function reloadAnnotationsTable() {
        console.log("Updating UI with annotation layers: " + JSON.stringify(treeannotations));
        $$("annotations_table").clearAll();
        //RELOAD LAYERS UI
        var updateStringArray = JSON.stringify(treeannotations);
        var tempJSONArray = JSON.parse(updateStringArray);
        $$("annotations_table").parse(tempJSONArray);

        //RELOAD THE DROP DOWN COMBO
        var list = $$("currentLayerCombo").getPopup().getList();
        list.clearAll();
        list.parse(treeannotations);

        toggleLabel();
    }

    pubsub.subscribe("SLIDE", function(msg, slide) {
        animationInProgress = false;
        // initialize the geojs viewer
        const params = geo.util.pixelCoordinateParams('#geojs', slide.tiles.sizeX, slide.tiles.sizeY, slide.tiles.tileWidth, slide.tiles.tileHeight);
        //console.log("SLIDE: " + JSON.stringify(slide));
        currentSlide = slide;

        params.map.clampZoom = false;
        params.map.clampBoundsX = false;
        params.map.clampBoundsY = false;
        map = geo.map(params.map);
        layer = map.createLayer('annotation', );
        // turn off geojs map navigation
        map.interactor().options({ actions: [] });

        // add handlers to tie navigation events together
        viewer.addHandler('open', setBounds);
        viewer.addHandler('animation', setBounds);
        map.geoOn(geo.event.annotation.state, created);

        layer.clear();
        map.draw();
        if (!isEmpty(slide.meta)) {
            //console.log("META: " + JSON.stringify(slide.meta));
            if (typeof slide.meta.dsalayers === "undefined") {
                console.log("No exisitng layers found");
            } else if (!isEmpty(slide.meta.dsalayers) && slide.meta.dsalayers.length > 0) {
                console.log("LAYERS Found: " + JSON.stringify(slide.meta.dsalayers));
                treeannotations.length = 0;
                treeannotations = slide.meta.dsalayers;
                reloadAnnotationsTable();
            } else {
                console.log("No layers associated with this slide. Setting Defaults");
                reinitializeTreeLayers();
            }

            //Reload existing annotations.
            if (typeof slide.meta.geojslayer === "undefined") {
                console.log("No exisitng annotations found");
            } else if (!isEmpty(slide.meta.geojslayer)) {
                var geojsJSON = slide.meta.geojslayer;
                console.log("GEOJSON: " + JSON.stringify(geojsJSON));

                //One way of reloading annotations. But we loose GeoIDs if we do it this way
                /*
                var reader = geo.createFileReader('jsonReader', { 'layer': layer });
                map.fileReader(reader);
                reader.read(
                    geojsJSON,
                    function() {
                        map.draw();
                    }
                );
                */
                layer.geojson(geojsJSON, true, null, true);
            }
        } else {
            console.log("No metadata associated with this slide. Setting Defaults");
            reinitializeTreeLayers();
        }
    });

    function treeCheckBoxesClicked() {
        console.log(JSON.stringify($$("annotations_table").getChecked()));
    }

    function setAnimate() {
        animationInProgress = false;
    }

    function animateTimeOut() {
        setTimeout(setAnimate(), 3000);
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
                            var newLayer = {
                                id: treeannotations.length + 1,
                                value: $$('layername').getValue(),
                                type: "layer",
                                open: true,
                                data: []
                            };

                            treeannotations[treeannotations.length] = newLayer;
                            currentLayerId = newLayer.id;
                            updateGirderWithAnnotationData();
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
                            updateGirderWithAnnotationData();
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
                            updateGirderWithAnnotationData();
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
                            updateGirderWithAnnotationData();
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

                    //UPDATE JSON ALONG WITH LAYER
                    var found = false;
                    for (var i = 0; i < treeannotations.length; i++) {
                        for (var j = 0; j < treeannotations[i].data.length; j++) {
                            if (treeannotations[i].data[j].geoid == item.geoid) {
                                //delete treeannotations[i].data[j];
                                treeannotations[i].data.splice(j, 1);
                                found = true;
                                break;
                            }
                        }
                        if (found) {
                            break;
                        }
                    }
                    updateGirderWithAnnotationData();
                    treeCheckBoxesClicked();
                }
            },
            on: {
                onAfterEditStop: function(state, editor) {
                    var item = this.getItem(editor.row);
                    var annotation = layer.annotationById(item.geoid);
                    console.log("COLOR CHANGE:" + item.geoid);
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
                    updateGirderWithAnnotationData();
                },
                onItemClick: function(id) {
                    animationInProgress = true;

                    /*
                    var item = $$("annotations_table").getItem(id);
                    var annotation = layer.annotationById(item.geoid);
                    //console.log(JSON.stringify(annotation));
                    var opt = annotation.options('style');


                    var opacity = 0.1;
                    var increment = 0.1;
                    while (animationInProgress) {
                        opacity += 0.1;
                        if (opacity === 1.0 || opacity === 0.1) {
                            increment = increment * -1;
                        }
                        opt[strokeOpacity] = opacity;
                        annotation.options({ style: opt }).draw();
                    }
                    */
                },
                onItemCheck: function(id, value, event) {
                    treeCheckBoxesClicked();
                }
            }
        }
    });
});