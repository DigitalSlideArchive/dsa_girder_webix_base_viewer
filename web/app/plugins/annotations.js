require(["viewer", "slide", "geo", "pubsub", "config"], function(viewer, slide, geo, pubsub, config) {

    /***********************************************************************************************/
    /************************************** GLOBAL VARIABLES  **************************************/
    /***********************************************************************************************/

    var DEBUG = false;
    var layer;
    var map;
    var annotations = [];
    var treeannotations = [{
        "id": "1",
        "type": "layer",
        "fillColor": "#00FF00",
        "strokeColor": "#000000",
        "value": "Default Layer",
        "open": true,
        "data": []
    }];
    var currentSlide;
    var currentLayerId = "1";
    var currentShape = "rectangle";
    var animationInProgress = false;

    /***********************************************************************************************/
    /********************************* USER INTERFACE ELEMENTS *************************************/
    /***********************************************************************************************/

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

    /***********************************************************************************************/
    /********************************* VIEWER BOUNDS ***********************************************/
    /***********************************************************************************************/

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

    /***********************************************************************************************/
    /********************************* UTILITIES ***************************************************/
    /***********************************************************************************************/

    function isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return JSON.stringify(obj) === JSON.stringify({});
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

    /***********************************************************************************************/
    /********************************* GEO JS ******************************************************/
    /***********************************************************************************************/

    pubsub.subscribe("SLIDE", function(msg, slide) {
        //debugger;
        resetDataStructures();

        animationInProgress = false;
        // initialize the geojs viewer
        const params = geo.util.pixelCoordinateParams('#geojs', slide.tiles.sizeX, slide.tiles.sizeY, slide.tiles.tileWidth, slide.tiles.tileHeight);
        if (DEBUG) {
            //console.log("SLIDE: " + JSON.stringify(slide));
        }

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
        //viewer.addHandler('tile-unloaded', resetDataStructures);
        map.geoOn(geo.event.annotation.state, created);

        //get metadata to load existing annotations
        getMetadataAndLoadAnnotations();
    });

    // add handlers for drawing annotations
    function draw(type) {
        if (DEBUG)
            console.log("Entering drawing function...");
        if ($$("draw_toggle").getValue() === 1) {
            currentShape = type;
            $('#geojs .geojs-layer').css('pointer-events', 'auto');
            layer.mode(currentShape);
        }
    }

    // add a handler for when an annotation is created
    function created(evt) {
        $('#geojs .geojs-layer').css('pointer-events', 'none');
        //WE NEED TO USE THESE TO CONVERT GEOJS RGB INITIAL VALUE TO HEX - CURRENTLY NOT USED
        var fill = evt.annotation.options('style').fillColor;
        var stroke = evt.annotation.options('style').strokeColor;

        if (DEBUG) {
            //console.log(evt.annotation);
            //console.log(evt.annotation.options());
            console.log(JSON.stringify(fill));
        }
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

        if (DEBUG) {
            console.log("CREATED:" + newAnnotationTree.geoid);
            console.log("TREE ANNOTATIONS: " + JSON.stringify(treeannotations));
        }
        for (var i = 0; i < treeannotations.length; i++) {
            if (treeannotations[i].id === currentLayerId) {
                var tempArray = treeannotations[i].data;
                newAnnotationTree.id = newAnnotationTree.id + (tempArray.length + 1);
                tempArray[tempArray.length] = newAnnotationTree;
                break;
            }
        }
        updateGirderWithAnnotationData();
    }

    /***********************************************************************************************/
    /********************************* ANNOTATION CONTROL ******************************************/
    /***********************************************************************************************/

    $$("currentLayerCombo").attachEvent("onChange", function(newv, oldv) {
        currentLayerId = newv;
        //webix.message("Value changed from: " + oldv + " to: " + newv);
    });

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

    // Toggle Annotations
    function treeCheckBoxesClicked() {
        if (DEBUG)
            console.log(JSON.stringify($$("annotations_table").getChecked()));
        /*
        annotation.style({fill: false, stroke: false})
        annotation.style('fill', function (d, i) { return !d.checked; })
        */

        var checkedIds = $$("annotations_table").getChecked();
        for (var i = 0; i < treeannotations.length; i++) {
            for (var j = 0; j < treeannotations[i].data.length; j++) {
                var annotation = layer.annotationById(treeannotations[i].data[j].geoid);
                console.log(checkedIds);
                if (checkedIds.includes(treeannotations[i].data[j].id)) {
                    annotation.options('showLabel', true)
                    annotation.style({ fill: true, stroke: true });
                } else {
                    annotation.options('showLabel', false)
                    annotation.style({ fill: false, stroke: false });
                }
                map.draw();
            }
        }
    }

    function setAnimate() {
        animationInProgress = false;
    }

    function animateTimeOut() {
        setTimeout(setAnimate(), 3000);
    }

    /***********************************************************************************************/
    /********************************* DATA STRUCTURE/UI CONTROL ***********************************/
    /***********************************************************************************************/

    function reinitializeTreeLayers() {
        //Forcefully clear the arry to stop appending till ECMAScript 5
        treeannotations.length = 0;
        treeannotations = [{
            "id": "1",
            "value": "Default Layer",
            "type": "layer",
            "fillColor": "#00FF00",
            "strokeColor": "#000000",
            "open": true,
            "data": []
        }];
        reloadAnnotationsTable();
        treeCheckBoxesClicked();
    }

    function reloadAnnotationsTable() {
        if (DEBUG)
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
        console.log(updateStringArray);
        $$("currentLayerCombo").refresh();
        toggleLabel();
    }

    function resetDataStructures() {
        if (layer != null) {
            if (DEBUG)
                console.log("RESETTING DATA STRUCTURES");
            reinitializeTreeLayers();
            layer.removeAllAnnotations();
            //layer.geojson({}, true);
            map.draw();

        }
    }

    //Function to copy parameter values from GeoJson to DSA layer data structure
    function propertiesEdited(property, geoid, value, editorcolumn) {
        //UPDATE JSON ALONG WITH LAYER
        var found = false;
        var visibleAnnotationsChanged = false;
        for (var i = 0; i < treeannotations.length; i++) {
            //webix.message("Deleting Layer, ID" + geoid);
            if (property === "deleteLayer") {
                //webix.message("ID" + geoid + "MATCHING ID" + treeannotations[i].id);
                //LAYER DELETE HERE GEOID IS THE TREE ID OF THE LAYER
                if (treeannotations[i].id === geoid) {
                    webix.message("ID" + geoid + "MATCHING ID" + treeannotations[i].id);
                    console.log(treeannotations[i]);
                    treeannotations.splice(i, 1);
                    visibleAnnotationsChanged = true;
                    reloadAnnotationsTable();
                    break;
                }
            } else {
                for (var j = 0; j < treeannotations[i].data.length; j++) {
                    if (treeannotations[i].data[j].geoid == geoid) {
                        switch (property) {
                            case "strokeWidth":
                                treeannotations[i].data[j].strokeWidth = val;
                                break;
                            case "fillOpacity":
                                treeannotations[i].data[j].fillOpacity = val;
                                break;
                            case "strokeOpacity":
                                treeannotations[i].data[j].strokeOpacity = val;
                                break;
                            case "deleteAnnotation":
                                treeannotations[i].data.splice(j, 1);
                                visibleAnnotationsChanged = true;
                                break;
                            case "annotationStyleChange":
                                switch (editorcolumn) {
                                    case "fillColor":
                                        treeannotations[i].data[j].fillColor = value;
                                        break;
                                    case "strokeColor":
                                        treeannotations[i].data[j].strokeColor = value;
                                        break;
                                    case "name":
                                        treeannotations[i].data[j].value = value;
                                        break;
                                }
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
        }
        updateGirderWithAnnotationData();
        if (visibleAnnotationsChanged) {
            treeCheckBoxesClicked();
        }
    }
    /***********************************************************************************************/
    /********************************* GIRDER UPDATES **********************************************/
    /***********************************************************************************************/

    function getMetadataAndLoadAnnotations() {
        var url = config.BASE_URL + "/item/" + slide._id;
        webix.ajax().get(url, function(text) {
            resetDataStructures();
            currentSlide = JSON.parse(text);
            if (typeof currentSlide === "undefined") {
                //DO NOTHING
            } else {

                if (!(typeof currentSlide.meta === "undefined")) {
                    if (typeof currentSlide.meta.dsalayers === "undefined") {
                        if (DEBUG)
                            console.log("No exisitng layers found");
                    } else if (!isEmpty(currentSlide.meta.dsalayers) && currentSlide.meta.dsalayers.length > 0) {
                        if (DEBUG)
                            console.log("LAYERS Found: " + JSON.stringify(currentSlide.meta.dsalayers));
                        treeannotations.length = 0;
                        treeannotations = currentSlide.meta.dsalayers;
                        reloadAnnotationsTable();
                    } else {
                        if (DEBUG)
                            console.log("No layers associated with this slide. Setting Defaults");
                        reinitializeTreeLayers();
                    }

                    //Reload existing annotations.
                    if (typeof currentSlide.meta.geojslayer === "undefined") {
                        if (DEBUG)
                            console.log("No exisitng annotations found");
                    } else if (!isEmpty(currentSlide.meta.geojslayer)) {
                        var geojsJSON = currentSlide.meta.geojslayer;
                        if (DEBUG)
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
                        //layer.geojson(geojsJSON, true, null, true);
                        //console.log("GEOJSON LOADING: " + JSON.stringify(geojsJSON));
                        layer.geojson(geojsJSON, 'update');

                    }
                }
            }
        });
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
        //console.log("GEOJSON SAVING: " + JSON.stringify(geojsonObj));

        var metaInfo = {
            dsalayers: treeannotations,
            geojslayer: geojsonObj
        };

        var url = config.BASE_URL + "/item/" + slide._id;
        if (DEBUG)
            console.log(url);
        webix.ajax().put(url, { "metadata": metaInfo }, function(text, xml, xhr) {
            // response
            if (DEBUG)
                console.log("Successfully updated girder with annotations");
            //console.log(text);
            if ($$("draw_toggle").getValue() === 1) {
                if (DEBUG)
                    console.log("completed adding annotation to UI, draw is sticky calling draw function again");
                //currentshape is retained it only changes when you click the button
                draw(currentShape);
            }
        });
    }

    /***********************************************************************************************/
    /********************************* WEBIX ANNOTATION LAYERS *************************************/
    /***********************************************************************************************/

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
                            if ($$('layername').getValue().length === 0) {
                                webix.message("<font size=\"3\" color=\"red\">Layer name cannot be empty!</font>");
                            } else {
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
                    editor: "text",
                    template: "{common.space()}{common.icon()}{common.treecheckbox()}{common.folder()}#value#"
                },
                { id: "type", header: "Type" },
                {
                    id: "fillColor",
                    header: "Fill Color",
                    editor: "color",
                    template: function(obj, common)

                    { return obj.type === "layer" ? "" : color1 }
                },
                {
                    id: "strokeColor",
                    header: "Stroke Color",
                    editor: "color",
                    template: function(obj, common)

                    { return obj.type === "layer" ? "" : color2 }
                },
                {
                    id: "fillOpacity",
                    header: "Fill Opacity",
                    width: 120,
                    template: function(obj, common)

                    { return obj.type === "layer" ? "" : common.strokeWidth(obj, common) }
                },

                {
                    id: "strokeOpacity",
                    header: "Stroke Opacity",
                    width: 120,
                    template: function(obj, common) { return obj.type === "layer" ? "" : common.strokeOpacity(obj, common) }

                },


                {
                    id: "strokeWidth",
                    header: "Stroke Width",
                    template: function(obj, common) { return obj.type === "layer" ? "" : common.strokeWidth(obj, common) }

                    ,
                    width: 120
                }
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
                            propertiesEdited("strokeWidth", item.geoid, val, "");
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
                            propertiesEdited("fillOpacity", item.geoid, val, "");
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
                            propertiesEdited("strokeOpacity", item.geoid, val, "");
                        }
                    }
                }
            },
            onClick: {
                "fa-trash": function(e, id) {
                    var item = this.getItem(id.row);
                    if (item.type === "layer") {
                        console.log(item.data);

                        curAnnotationToDeleteID = $$("annotations_table").getFirstChildId(item.id);
                        while (curAnnotationToDeleteID) {
                            curAnnotationToDelete = $$("annotations_table").getItem(curAnnotationToDeleteID);
                            var annotation = layer.annotationById(curAnnotationToDelete.geoid);
                            layer.removeAnnotation(annotation);
                            this.remove(curAnnotationToDelete.id);
                            propertiesEdited("deleteAnnotation", curAnnotationToDelete.geoid, "", "");
                            curAnnotationToDeleteID = $$("annotations_table").getFirstChildId(item.id);
                        }
                        //Now deleting the layer after we just removed all of its child annotations
                        propertiesEdited("deleteLayer", item.id, "", "");
                        //ADD LAYER COLOR CHANGES CONTROL HERE IN THE FUTURE
                    } else {
                        var annotation = layer.annotationById(item.geoid);
                        layer.removeAnnotation(annotation);
                        this.remove(id.row);
                        propertiesEdited("deleteAnnotation", item.geoid, "", "");
                    }
                }
            },
            on: {
                onAfterEditStop: function(state, editor) {
                    var item = this.getItem(editor.row);
                    if (item.type === "layer") {
                        //ADD LAYER COLOR CHANGES CONTROL HERE IN THE FUTURE
                    } else {
                        var annotation = layer.annotationById(item.geoid);
                        if (DEBUG)
                            console.log("COLOR CHANGE:" + item.geoid);
                        var opt = annotation.options('style');

                        if (editor.column === "name") {
                            //Name edit to  Geo JSON
                            annotation.name(state.value);
                            map.draw();
                        } else {
                            //Color (Stroke & Fill) edits to  Geo JSON
                            opt[editor.column] = state.value;
                            annotation.options({ style: opt }).draw();
                        }
                        propertiesEdited("annotationStyleChange", item.geoid, state.value, editor.column);
                    }
                },
                onItemClick: function(id) {
                    animationInProgress = true;
                    //TODO ANIMATE WHEN CLICKED ON TREE
                },
                onItemCheck: function(id, value, event) {
                    treeCheckBoxesClicked();
                }
            }
        }
    });
});