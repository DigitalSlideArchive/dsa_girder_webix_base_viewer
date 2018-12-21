define("common/mainPanel", ["webix"], function(webix) {

    webix.protoUI({
        name: "webixOSD",
        $init: function(config) {
            this.$view.innerHTML = '<div id="openseadragon1" style="width: 100%; height: 100%;"></div>'        },
        // defaults: {
        //     width: 1000,
        //     height: 1000
        // }
    }, webix.ui.view);



 // var rightPanel = {
 //        header: "slideDetails",
 //        id: "rightPanel",
 //        gravity: 0.5,
        
 //        multi: true,
 //        collapsed: true,
 //        body: {
 //            rows: [
 //                { view: "template", type:"header",template: "rightPanelTop" },
 //                curItemInfo
 //            ]
 //        }
 //    }


    var mainPanel = {
        id: "mainPanel",
        header: "viewerPanel",
        gravity: 2,
        multi:true,
        body: {
            rows: [
            { view: "template", type: "header", template: "mainPanelToolBar" },
            { view: "webixOSD", id:"osdMain" }, //in case I add more panels later.
            { view: "template", type: "header", template: "mainPanelFooter",hidden:true }
        ]}
    }

return mainPanel

})