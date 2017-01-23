require(["d3", "viewer"], function(d3, viewer) {

    webix.DataDriver.AperioXML = webix.extend({
        records:"/*/Annotation",
        child:function(obj){
            if(obj.$level == 1)
                return obj.Regions;
            if(obj.$level == 2)
                return obj.Region;
        }
    }, webix.DataDriver.xml);

    $$("toolbar").addView({
        id: "aperio_window_btn",
        label: "Aperio Annotations",
        view: "button",
        click: ("$$('aperio_window').show();")
    });

    var aperioXmlTree = {
        view:"tree",
        type:"lineTree",
        threeState: true,
        select: true,
        url:"http://digitalslidearchive.emory.edu/v1/aperio/home/mkhali8/test.xml",
        datatype:"AperioXML",
        id: "aperio_xml_tree",
        ready:function(){
            this.openAll();
        },
        template:function(obj, common){
           var icons = common.icon(obj, common) + common.checkbox(obj, common) + common.folder(obj, common);
           var text = "";

            if(obj.$level == 1){
                text = "Annotation " + obj.Id;
                obj.LineColor = rgb2hex(obj.LineColor);
            }
            if(obj.$level == 2){
                var allheader = [];
                for(var i = 0; i<obj.RegionAttributeHeaders.AttributeHeader.length; i++)
                    allheader.push(obj.RegionAttributeHeaders.AttributeHeader[i].Name);
                text = "Regions";
            }
            if(obj.$level == 3){
                text = "Region " + obj.Id;
                obj.Coords = transformVertices(obj.Vertices.Vertex, imageWidth);
            }

            return icons + text;
        },
        on:{
            onItemCheck: function(){
                $(".annotation_overlay").remove();
                $$("region_attributes").clearAll();
                var regionAttr = [];

                $.each(this.getChecked(), function(index, id){
                    var tree = $$("aperio_xml_tree");
                    item = tree.getItem(id);

                    if(item.$level == 3){  
                        var annotationId = tree.getParentId(tree.getParentId(id));
                        item.LineColor = tree.getItem(annotationId).LineColor;
                        item.AnnotationId = tree.getItem(annotationId).Id;
                        regionAttr.push(item);
                        var overlayId = "region_overlay_" + item.AnnotationId + "_" + item.Id;
                        var overlayClass = "annotation_overlay";

                        d3.select(viewer.svgOverlay().node()).append("polygon")
                          .attr("points",item.Coords)
                          .style('fill', "white")
                          .style('fill-opacity', 0)
                          .attr('opacity', 1)
                          .attr('class', overlayClass)
                          .attr('id', overlayId)
                          .attr('stroke', item.LineColor)
                          .attr('stroke-width', 0.001);
                      
                        (function(region){
                            $("#"+overlayId).hover(function(){
                                $(this).css({stroke: "red", "stroke-width": 0.002});
                                webix.message("Region: " + region.Id + 
                                              "<br/>Area (Microns): " + region.AreaMicrons + 
                                              "<br/>Length (Microns):" + region.LengthMicrons);
                            }, function(){
                                $(this).css({stroke: region.LineColor, "stroke-width": 0.001});
                            });
                        })(item); 
                    }
                });
              
                $$("region_attributes").parse(regionAttr); 
            },
            onItemClick: function(id){
                item = this.getItem(id);
                var attr = [];
                $.each(item, function(key, val){
                    attr.push({"key": key, "value":val});

                });

                $$("region_keyvalue").clearAll();
                $$("region_keyvalue").parse(attr);
            }
        }
    };

    var fileList = {
        view: "list",
        height: 200,
        id: "file_list",
        template: "#name#",
        select: true,
        on: {
            onItemClick: function(id){
                $$("region_keyvalue").clearAll();
                $$("region_attributes").clearAll();
                $$("aperio_xml_tree").clearAll();
                $$("aperio_xml_tree").load(this.getItem(id).url);
                $(".boundaryClass").remove();
            }
        }
    };

    var parameterList = {
        view: "datatable",
        width: "auto",
        id: "region_keyvalue",
        columns: [{
            'id': "key"
        }, {
            'id': "value", fillspace:true
        }],
        autoConfig: true

    };

    var ROIColumns = [{
        id: "Id"
    }, {
        id: "AnnotationId", header: "Annotation ID"
    }, {
        id: "AreaMicrons", header: "Area Microns"
    }, {
        id: "LengthMicrons", header: "Length Microns"
    }, {
        id: "NegativeROA", header: "Negative ROA"
    }, {
        id: "Zoom", fillspace:true
    }];

    var layoutROIInfo = {
        view: "datatable",
        width: "auto",
        id: "region_attributes",
        select: true,
        columns: ROIColumns
    };

    var aperioWindow = {
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
                icon: "question-circle",
                click: "webix.message('About pressed')"
            }, {
                view: "icon",
                icon: "times-circle",
                click: "$$('aperio_window').hide();"
            }]
        },
        height: 400,
        width: 700,
        body: {
            rows: [{
                    cols: [fileList, aperioXmlTree, parameterList]
                },
                layoutROIInfo
            ]
        }
    };

    function transformVertices(vertices, imageWidth) {
        coordinates = new Array();
        scaleFactor = 1 / imageWidth;
        $.each(vertices, function(index, vertex) {
            x = parseFloat(vertex.X) * scaleFactor;
            y = parseFloat(vertex.Y) * scaleFactor;
            coordinates.push(x + "," + y);
        });

        return coordinates.join(" ")
    }

    function rgb2hex (rgb) {
        rgb = "0".repeat(9 - rgb.length) + rgb;
        var r = parseInt(rgb.substring(0,3));
        var g = parseInt(rgb.substring(3,3));
        var b = parseInt(rgb.substring(7,3));
    
        var h = b | (g << 8) | (r << 16);
        return '#' + "0".repeat(6 - h.toString(16).length) + h.toString(16);
    }

    webix.ui(aperioWindow);
});