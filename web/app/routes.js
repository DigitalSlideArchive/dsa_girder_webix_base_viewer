require(["crossroads", "hasher", "jquery", "config", "slide", "pubsub", "webix"], function(crossroads, hasher, $, config, slide, pubsub) {

    crossroads.addRoute("/slide/{id}", function(id){
        $$("viewer_panel").showProgress({type:"icon"});
        $$("viewer_panel").showOverlay("<div style='color:gray;font-size:24px'>Loading Slide...</div>");

        webix.delay(function(){
            var url = config.BASE_URL + "/item/" + id;
            $.ajax({
                url: url, 
                success: function(item){
                    slide.init(item);

                    $$("viewer_panel").hideProgress();
                    $$("viewer_panel").hideOverlay();
                },
                error: function(){
                    $$("viewer_panel").hideProgress();
                    $$("viewer_panel").hideOverlay();

                    webix.alert({
                        title: "Error",
                        type:"confirm-error",
                        width: 400,
                        text:"The slide ID " + id + " is invalid. <br/>Please use the left navigation to find your slide."
                    });
                }
            })
        }, null, null, 1000)
    });

    hasher.initialized.add(function(h) {
        crossroads.parse(h);
    });
    
    hasher.changed.add(function(h) {
        crossroads.parse(h);
    });

    hasher.init();
});