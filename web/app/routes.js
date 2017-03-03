define("routes", ["crossroads", "hasher", "jquery", "config", "slide"], function(crossroads, hasher, $, config, slide) {

    crossroads.addRoute("/slide/{id}", function(id){
        var url = config.BASE_URL + "/item/" + id;
        $.get(url, function(item){
            console.log(item);
        })
    });
   
    crossroads.bypassed.add(function() {
        console.log('ROUTE BYPASS');
    });

    hasher.initialized.add(function(h) {
        crossroads.parse(h);
    });
    
    hasher.changed.add(function(h) {
        crossroads.parse(h);
    });

    hasher.init();
});