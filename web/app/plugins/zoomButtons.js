define("zoomButtons", ["viewer", "osdImgHelper", "osd", "pubsub"], function(viewer, osdIH, osd, pubsub) {


    webix.message("Zoom Button module loaded");

    var imagingHelper = new OpenSeadragonImaging.ImagingHelper({ viewer: viewer });

    function create_fixed_zoom_btn(viewer, helper, zb) {
        var url_base = "/img/";
        var btn = new OpenSeadragon.Button({
            srcRest: url_base + zb + "x_rest.png",
            srcGroup: url_base + zb + "x_grouphover.png",
            srcHover: url_base + zb + "x_hover.png",
            srcDown: url_base + zb + "x_pressed.png",
            tooltip: "Zoom to " + zb + "x",
            onClick: function() {
                var zoomVal = parseFloat(zb);

                //the 40 assumes all the images are at 40X which is not true... TO WORK ON
                var newzoom = zoomVal / 40.0;
                // Not sure why dividing by 4 is necessary to get visual to show correct scale. 
                // Perhaps OpenSeadragon is scaling by 4 or something // 1, 2, 4, 10, 20, 40 // 0 => 1
                console.log("zoomVal=" + newzoom);
                helper.setZoomFactor(newzoom);
                viewer.viewport.zoomTo(zoomVal, null, true);
                viewer.viewport.applyConstraints();
                return false;
            }
        });
        return btn;
    }

    // imagingHelper.addHandler('image-view-changed', debounce(function(event) {
    //     var currentPPM = event.zoomFactor * 4000000;
    //     var containerSize = seadragon.viewport.getContainerSize();
    //     var currX = containerSize.x / (event.zoomFactor * 4000000) * 1000;
    //     var currY = containerSize.y / (event.zoomFactor * 4000000) * 1000;
    //     $('#slide-area').html((currX * currY).toFixed(3) + ' mm²');
    //     $('#slide-width').html(currX.toFixed(3) + ' mm');
    //     $('#slide-height').html(currY.toFixed(3) + ' mm');
    // }, 10));


    //This will need to be adapted based on the MAX zoom of the image... TO DO
    var zoom_btns = ["1", "2", "4", "10", "20", "40"];
    var btn_list = [];
    for (var i = 0; i < zoom_btns.length; i++) {
        var zb = zoom_btns[i];
        var btn = create_fixed_zoom_btn(viewer, imagingHelper, zb);
        btn_list.push(btn);
    }
    var btnGroup = new OpenSeadragon.ButtonGroup({ buttons: btn_list });

    //console.log(btn_list);

    //was seadragon.addControl
    viewer.addControl(btnGroup.element, { attachToViewer: true, anchor: OpenSeadragon.ControlAnchor.TOP_LEFT });

})