require(["crossroads", "hasher", "jquery", "config", "slide", "pubsub", "webix"], function(crossroads, hasher, $, config, slide, pubsub) {

    var image = null;

    crossroads.addRoute("/slide/{id}", function(id){
        $$("viewer_panel").showProgress({type:"icon"});
        $$("viewer_panel").showOverlay("<div style='color:gray;font-size:24px'>Loading Slide...</div>");

        var url = config.ENDPOINTS.item.replace("{ID}", id);

        $.get(url)
         .then(
            function(item){
                image = item;
                $$("viewer_panel").hideProgress();
                $$("viewer_panel").hideOverlay();
                return $.get(config.BASE_URL + "/folder/" + image.folderId);
        }).then(function(specimen){
                return $.get(config.BASE_URL + "/folder/" + specimen.parentId);
        }).then(function(patient){
                var cohortList = $$("slideset").getPopup().getList();
                var w = cohortList.find(function(obj){
                    return obj._id == patient.parentId;
                });
                    
                $$("slideset").setValue(w[0].id);
                
                webix.delay(function(){
                    slide.init(image);
                }, null, null, 500)
        }).fail(function(){
                $$("viewer_panel").hideProgress();
                $$("viewer_panel").hideOverlay();

                webix.alert({
                    title: "Error",
                    type:"confirm-error",
                    width: 400,
                    text:"The slide ID " + id + " is invalid. <br/>Please use the left navigation to find your slide."
                });
        });
    });

    hasher.initialized.add(function(h) {
        crossroads.parse(h);
    });
    
    hasher.changed.add(function(h) {
        crossroads.parse(h);
    });

    hasher.init();
});