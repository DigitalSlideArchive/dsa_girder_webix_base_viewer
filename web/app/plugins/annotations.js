require(["viewer", "osdfabric", "fabric"], function(viewer, osdfabric) {

    var overlay = viewer.fabricjsOverlay(); 
    var canvas = overlay.fabricCanvas(); 
    console.log(canvas)
    var drawing = null;
    
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
                        drawing = "ellipse";
                        selectionOff();
                        drawOn();
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
                        drawing = "rect";
                        selectionOff();
                        drawOn();
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
                        drawOff();
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
                        drawOn();
                   }
                   else{
                    selectionOff()
                        drawOff();
                   }
                }
            },
            {}

        ]
    };

    function drawOff(){
        viewer.setControlsEnabled(true);
        viewer.setMouseNavEnabled(true);
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
    }

    function drawOn(){
        drawOff();
        console.log("enable drawing")
        viewer.setControlsEnabled(false);
        viewer.setMouseNavEnabled(false);

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
        //canvas.isDrawingMode = false;
        viewer.setControlsEnabled(false);
        viewer.setMouseNavEnabled(false);
        canvas.selection = true;
        canvas.forEachObject(function(o){ o.setCoords() })
    }

    function selectionOff(){
        //canvas.isDrawingMode = true;
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
    }

    function drawEllipse(){
        var ellipse, isDown, origin;
        console.log(canvas)
        canvas.on('mouse:down', function(o){
            if(drawing != "ellipse") return;
            isDown = true;
            var pointer = canvas.getPointer(o.e);
            origin = canvas.getPointer(o.e);
            ellipse = new fabric.Ellipse({
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
            canvas.add(ellipse);
        });

        canvas.observe('mouse:move', function(o){
          if (!isDown) return;
          var pointer = canvas.getPointer(o.e);
          ellipse.set({ rx: Math.abs(origin.x - pointer.x),ry:Math.abs(origin.y - pointer.y) });
          canvas.renderAll();
        });

        canvas.on('mouse:up', function(o){
          isDown = false;
        });
    }

    function drawRectangle(){
        var rect, isDown, origin;
        
        canvas.on('mouse:down', function(o){
            if(drawing != "rect") return;
            isDown = true;
            origin = canvas.getPointer(o.e);
            var pointer = canvas.getPointer(o.e);
            rect = new fabric.Rect({
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
            canvas.add(rect);
        });

        canvas.on('mouse:move', function(o){
            if (!isDown) return;
            var pointer = canvas.getPointer(o.e);

            if(origin.x>pointer.x){
                rect.set({ left: Math.abs(pointer.x) });
            }
            if(origin.y>pointer.y){
                rect.set({ top: Math.abs(pointer.y) });
            }

            rect.set({ width: Math.abs(origin.x - pointer.x) });
            rect.set({ height: Math.abs(origin.y - pointer.y) });

            canvas.renderAll();
        });

        canvas.on('mouse:up', function(o){
          isDown = false;
        });
    }

    $$("viewer_root").addView(tools, 1);


});