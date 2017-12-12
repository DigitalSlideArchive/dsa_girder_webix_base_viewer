require(["d3", "viewer", "pubsub", "config", "svg", "jquery", "session", "fabric"], function(d3, viewer, pubsub, config, svg, $, session) {
    
     /*
    Let us declare some variables for this module
     */
    var imageWidth = null;

    /*
    Update the toolbar: add the aperio button to the 
    main toolbar. This button allows the user to open
    the Aperio widget (window)
     */
    $$("toolbar").addView({
        id: "aperio_window_btn",
        label: "Aperio Annotations",
        view: "button",
        disabled: true,
        click: onWindowOpen
    });

    /*
    Keep listening for changes to the SLIDE variable that gets
    published by the slidenav module.

    If SLIDE changes, then update the Aperio view, by clearing all
    previously loaded data and load the new Aperio files.

    If no Aperio files are found, disable the button!
     */
    pubsub.subscribe("SLIDE", function(msg, slide) {
        imageWidth = slide.tiles.sizeX;
        clearAll();
        $.get(config.BASE_URL + "/item/" + slide._id + "/aperio", function(aperio){
            $$("aperio_window_btn").disable();
            if(aperio.length && session.valid()){
                $$("aperio_window_btn").enable();
                $$("file_list").parse(aperio);
            }
        })
    });

    /*
    Define data driver to parse the Aperio XML
    file to load it into tree view
     */
    webix.DataDriver.AperioXML = webix.extend({
        records:"/*/Annotation",
        child:function(obj){
            if(obj.$level == 1)
                return obj.Regions;
            if(obj.$level == 2)
                return obj.Region;
        }
    }, webix.DataDriver.xml);

    /*
    onWindowOpen()
        Actions that should be taken when the user clicks the slide Aperio button
        - Show the window
        - Select the first Aperio file
        - Load the Aperio XML tree and display the annotations
     */
    function onWindowOpen(){
        $$('aperio_window').show();
        var aperio = $$("file_list").getItem($$("file_list").getFirstId());
        var url = config.BASE_URL + "/file/" + aperio.file._id + "/download";
        $$("file_list").select($$("file_list").getFirstId())
        $$("aperio_xml_tree").load(url);
    }

    /*
    clearAll()
        Clear all views within the aperio widgets. This will clear:
        - file list
        - region key value datatable
        - region attributes
        - Aperio XML tree view
        - remove any overlays
     */
    function clearAll(){
        $$("region_properties").clearAll();
        $$("file_list").clearAll();
        $$("aperio_xml_tree").clearAll();
        $(".annotation_overlay").remove();
    }

    /*
    clearAllButFiles()
        This is the same as the function above except it will
        not clear the files list
     */
    function clearAllButFiles(){
        $$("region_properties").clearAll();
        $$("aperio_xml_tree").clearAll();
        $(".annotation_overlay").remove();
    }

    /*
    transformVertices()
        Map the Aperio coordinates to Openseadragon
        coordinate system
        
        Arguments:
            array - vertices
            int - imageWidth

        Return:
            string - coordinates, space separated
     */
    function transformVertices(vertices, imageWidth) {
        coordinates = new Array();
        scaleFactor = 1 / imageWidth;
        $.each(vertices, function(index, vertex) {
            x = parseFloat(vertex.X) * scaleFactor;
            y = parseFloat(vertex.Y) * scaleFactor;
            coordinates.push(x + "," + y);
        });

        return coordinates.join(" ");
    }

    /*
    rgb2hex()
        Converts RGB values to Hex code

        Arguments:
            string - rgb string

        Return:
            string - hex code
     */
    function rgb2hex(rgb) {
        rgb = "0".repeat(9 - rgb.length) + rgb;
        var r = parseInt(rgb.substring(0,3));
        var g = parseInt(rgb.substring(3,3));
        var b = parseInt(rgb.substring(7,3));
      
        var h = b | (g << 8) | (r << 16);
        return '#' + "0".repeat(6 - h.toString(16).length) + h.toString(16);
    }

    /*
    Start of the Aperio UI widget/window
     */
    var aperioXmlTree = {rows:[
        {view: "form",
         height: 30,
         margin: 0,
         padding: 0,
         elements:[{
            cols:[
                { view:"button", type:"icon", icon:"plus-square", tooltip:"Expand All", width: 35, click: 
                    function(){
                        $$("aperio_xml_tree").openAll();
                    }
                },
                { view:"button", type:"icon", icon:"minus-square", tooltip:"Minimize All", width: 35, click: 
                    function(){
                        $$("aperio_xml_tree").closeAll();
                    }
                },
                { view:"button", type:"icon", icon:"check-square", tooltip:"Select All", width: 35, click: 
                    function(){
                        $$("aperio_xml_tree").checkAll();
                    }
                },
                { view:"button", type:"icon", icon:"square-o", tooltip:"Unselect All", width: 35, click: 
                    function(){
                        $$("aperio_xml_tree").uncheckAll();
                    }
                },
            ]
         }
         ]},
        {
        view:"tree",
        width: 300,
        type:"lineTree",
        threeState: true,
        select: true,
        datatype:"AperioXML",
        id: "aperio_xml_tree",
        url: "http://digitalslidearchive.emory.edu/v1/aperio/home/mkhali8/test.xml",
        template:function(obj, common){
            var icons = common.icon(obj, common) + common.checkbox(obj, common) + common.folder(obj, common);
            var text = "";
            var readOnly = "1";

            if(obj.$level == 1){
                text = "Annotation " + obj.Id;
                readOnly = obj.ReadOnly;
            }
            if(obj.$level == 2){
                var allheader = [];
                for(var i = 0; i<obj.RegionAttributeHeaders.AttributeHeader.length; i++)
                    allheader.push(obj.RegionAttributeHeaders.AttributeHeader[i].Name);
                text = "Regions";
                readOnly = $$("aperio_xml_tree").getItem(obj.$parent).ReadOnly;
            }
            if(obj.$level == 3){
                text = "Region " + obj.Id;
                readOnly = $$("aperio_xml_tree").getItem($$("aperio_xml_tree").getItem(obj.$parent).$parent).ReadOnly;

                if(readOnly == "0")
                    obj.Coords = transformVertices(obj.Vertices.Vertex, imageWidth);
            }

            if(readOnly == "0")
                return icons + text;

            return "";
        },
        on:{
            onItemCheck: function(){
                $(".annotation_overlay").remove();
                $$("region_properties").clearAll();
                var regionAttr = [];

                $.each(this.getChecked(), function(index, id){
                    var tree = $$("aperio_xml_tree");
                    item = tree.getItem(id);

                    if(item.$level == 3){  
                        var annotationId = tree.getParentId(tree.getParentId(id));
                        item.LineColor = rgb2hex(tree.getItem(annotationId).LineColor);
                     
                        item.AnnotationId = tree.getItem(annotationId).Id;
                        regionAttr.push(item);
                        var overlayId = "region_overlay_" + item.AnnotationId + "_" + item.Id;
                        var overlayClass = "annotation_overlay";

                        //type 2: circle/ellipse
                        if(item.Type == "2"){
                            coords = item.Coords.split(/[\s,]/);
                            x1 = parseFloat(coords[0]), y1 = parseFloat(coords[1]), x2 = parseFloat(coords[2]), y2 = parseFloat(coords[3]);
                            shape = d3.select(viewer.svgOverlay().node()).append("ellipse")
                                        .attr("cx", (x1 + x2)/2)                //center x coordinate
                                        .attr("cy", (y1 + y2)/2)                //center y coordinate
                                        .attr("rx", Math.abs(x1 - x2))          //horizontal radius
                                        .attr("ry", Math.abs(y1 - y2));         //vertical radius
                        }
                        //else assume type 0: polygon
                        else{
                            shape = d3.select(viewer.svgOverlay().node()).append("polygon")
                              .attr("points",item.Coords);
                        }

                        shape.style('fill', "white")
                              .style('fill-opacity', 0)
                              .attr('opacity', 1)
                              .attr('class', overlayClass)
                              .attr('id', overlayId)
                              .attr('stroke', item.LineColor)
                              .attr('stroke-width', 0.001);

                        //set whatever handler for each region
                        (function(region){
                            $("#"+overlayId).hover(function(){
                                $(this).css({"stroke-width": 0.002});
                            }, function(){
                                $(this).css({"stroke-width": 0.001});
                            });
                        })(item); 
                    }
                });
              
                $$("region_properties").parse(regionAttr); 
            },
            onItemClick: function(id){
                item = this.getItem(id);
                var attr = [];
                $.each(item, function(key, val){
                    attr.push({"key": key, "value":val});
                });

                var overlayId = "region_overlay_" + item.AnnotationId + "_" + item.Id;
                $("#"+overlayId).css({"stroke-width": 0.003});
                $("#"+overlayId).animate({"stroke-width": 0.001}, 2000);
                       
                $$("region_properties").clearAll();
                $$("region_properties").parse(attr);
            },
            onAfterLoad: function(){
                this.openAll();
                this.checkAll();
            }
        }
        }]
    };

    var fileList = {
        view: "list",
        id: "file_list",
        template: "#name#",
        select: true,
        width: 300,
        on: {
            onItemClick: function(id){
                var aperio = this.getItem(id);
                var url = config.BASE_URL + "/file/" + aperio.file._id + "/download";
                clearAllButFiles();
                $$("aperio_xml_tree").load(url);
            }
        }
    };

    var parameterList = {
        header: "Properties",
        collapsed: true,
        body:{
            id: "region_properties",
            view: "datatable",
            autoConfig: true,
            columns: [{
                id: "key",
                header: "Property",
                width: 150
            }, {
                id: "value", header: "Value", fillspace:true
            }]
        }
    };

    var view = {
        view: "window",
        id: "aperio_window",
        move: true,
        resize: true,
        head: {
            view: "toolbar",
            margin: -4,
            cols: [{
                view: "label",
                label: "Aperio Annotations"
            }, {
                view: "icon",
                icon: "times-circle",
                click: "$$('aperio_window').hide();"
            }]
        },
        height: 500,
        width: 900,
        body: {cols: [fileList, aperioXmlTree, parameterList]}
    };

    webix.ui(view);
});
