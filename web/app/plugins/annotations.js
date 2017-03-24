require(["viewer", "osdfabric", "fabric"], function(viewer, osdfabric) {

     viewer.setControlsEnabled(false);
        viewer.setMouseNavEnabled(false);
    var overlay = viewer.fabricjsOverlay(); 
    var canvas = overlay.fabricCanvas(); 
    var annotationMode = false;
    selectionOff();

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
                        annotationMode = true;
                        selectionOff();
                        drawEllipse();
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
                        annotationMode = true;
                        selectionOff();
                        drawRectangle();
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
                       annotationMode = true;
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
                        annotationMode = false;
                        selectionOn();
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
                        annotationMode = false;
                       deleteSelected();
                    }
                }
            },
            {}

        ]
    };

    function selectionOn(){
        //canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
        canvas.forEachObject(function(o){ o.setCoords() })
    }

    function selectionOff(){
        //canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.on('mouse:down');
        canvas.on('mouse:move');
        canvas.on('mouse:up');
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
    }

    function drawEllipse(){
        var ellip, iseDown, eorigin;

        canvas.observe('mouse:down', function(o){
        iseDown = true;
        var pointer = canvas.getPointer(o.e);
        eorigin = canvas.getPointer(o.e);
        ellip = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            strokeWidth: 1,
            stroke: 'black',
            fill: 'white',
            selectable: true,
            originX: 'center', originY: 'center',
             rx: 5,
            ry: 1
          });
          canvas.add(ellip);
        });

        canvas.observe('mouse:move', function(o){
          if (!iseDown) return;
          var pointer = canvas.getPointer(o.e);
          ellip.set({ rx: Math.abs(eorigin.x - pointer.x),ry:Math.abs(eorigin.y - pointer.y) });
          canvas.renderAll();
        });

        canvas.on('mouse:up', function(o){
          iseDown = false;
        });
    }

    function drawRectangle(){
        var rect, isDown, rorigin;

        canvas.on('mouse:down', function(o){
            console.log("draw rect")
            isDown = true;
            rorigin = canvas.getPointer(o.e);
            var pointer = canvas.getPointer(o.e);
            rect = new fabric.Rect({
                left: rorigin.x,
                top: rorigin.y,
                originX: 'left',
                originY: 'top',
                width: pointer.x-rorigin.x,
                height: pointer.y-rorigin.y,
                angle: 0,
                fill: 'rgba(255,0,0,0.2)',
                transparentCorners: false
            });
            canvas.add(rect);
        });

        canvas.on('mouse:move', function(o){
            if (!isDown) return;
            var pointer = canvas.getPointer(o.e);

            if(rorigin.x>pointer.x){
                rect.set({ left: Math.abs(pointer.x) });
            }
            if(rorigin.y>pointer.y){
                rect.set({ top: Math.abs(pointer.y) });
            }

            rect.set({ width: Math.abs(rorigin.x - pointer.x) });
            rect.set({ height: Math.abs(rorigin.y - pointer.y) });

            canvas.renderAll();
        });

        canvas.on('mouse:up', function(o){
          isDown = false;
        });
    }

    $$("viewer_root").addView(tools, 1);


});