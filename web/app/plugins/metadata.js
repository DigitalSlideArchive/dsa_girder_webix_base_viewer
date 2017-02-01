require(["pubsub", "config"], function(pubsub, config) {

     /*
    Update the toolbar: add the pathology button to the 
    main toolbar. This button allows the user to open
    the Aperio widget (window)
     */
    $$("toolbar").addView({
        id: "metadata_window_btn",
        label: "Metadata",
        view: "button",
        disabled: true,
        click: ("$$('metadata_window').show();")
    });

    /*
    Keep listening for changes to the SLIDE variable that gets
    published by the slidenav module.

    If SLIDE changes, then update the pathology report view, by clearing all
    previously loaded data and load the new pathology files.

    If no pathology files are found, disable the button!
    */
    pubsub.subscribe("SLIDE", function(msg, slide) {
        var url = config.BASE_URL + "/tcga/case/" + slide.tcga.caseId + "/metadata/tables";
        $$("metadata_window_btn").disable();
        $.get(url, function(tables){
            if(tables.length){
                $$("metadata_window_btn").enable();
            }
        })
    });

    /* Window */
    var view = {
        view:"window",
        head:{
            view: "toolbar", 
            margin:-4, 
            cols:[
                {view:"label", label: "Metadata" },
                { view:"icon", icon:"times-circle", click:"$$('metadata_window').hide();"}
            ]
        },
        id: "metadata_window",
        move: true,
        position: "top",
        resize: true,
        width: 900,
        height: 800,
        body:{
            rows:[
                {
                    view: "combo",
                    id: "metadata_tables",
                    on: {
                        onChange: function(id){

                            var table = this.getPopup().getBody().getItem(id);
                            var url = config.BASE_URL + "/tcga/" + slide.tcga.caseId + "/metadata/" + table;
                            $$("metadata_table").clearAll();

                            $.get(url, function(resp){
                                meta = []
                                $.each(resp, function(key, val){
                                    meta.push({"key": key, "value": val});
                                })

                                $$("metadata_table").parse(meta);
                            })
                        }
                    }
                },
                {   
                    view: "datatable", 
                    width:800,
                    height:450,
                    select:"row",
                    id: "metadata_table",
                    columns:[
                        { id: "key", header: "Key", width: 250},
                        { id: "value", header: "Value", fillspace:true}
                    ]
                }
            ]
        }
    };

    webix.ui(view);
});