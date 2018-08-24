require(["pubsub", "config"], function(pubsub, config) {

     /*
    Update the toolbar: add the pathology button to the 
    main toolbar. This button allows the user to open
    the Aperio widget (window)
     */
    $$("toolbar").addView({
        id: "pathology_window_btn",
        label: "Pathology Report",
        view: "button",
        disabled: true,
        click: ("$$('pathology_report_pdf').show();")
    });

    /*
    Keep listening for changes to the SLIDE variable that gets
    published by the slidenav module.

    If SLIDE changes, then update the pathology report view, by clearing all
    previously loaded data and load the new pathology files.

    If no pathology files are found, disable the button!
    */
    pubsub.subscribe("SLIDE", function(msg, slide) {
        var url = config.BASE_URL + "/tcga/pathology?case=" + slide.tcga.caseId;
        $.get(url, function(resp){
            var reports = resp.data;
            
            if(reports.length > 0){
                $$("pathology_window_btn").enable();
                var reportList = $$("report_list").getPopup().getList();
                reportList.clearAll();
                reportList.parse(reports);
                $$("report_list").setValue(reports[0].id);
            }
            else{
                $$("pathology_window_btn").disable();
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
                {view:"label", label: "Pathology Reports" },
                { view:"icon", icon:"times-circle", click:"$$('pathology_report_pdf').hide();"}
            ]
        },
        id: "pathology_report_pdf",
        move: true,
        position: "top",
        resize: true,
        width: 900,
        height: 800,
        body:{
            rows:[
                {
                    view: "combo",
                    id: "report_list",
                    options: {
                        body: {
                            template: "#name#"  
                        }
                    },
                    on: {
                        onChange: function(id){
                            var report = this.getPopup().getBody().getItem(id);
                            var url = config.BASE_URL + "/file/" + report.file._id + "/download?contentDisposition=inline";
                            var content = "<embed src='"+ url +"' width='100%' height='100%' pluginspage='http://www.adobe.com/products/acrobat/readstep2.html'>"
                            $$("pdfviewer").define("template", content);
                            $$("pdfviewer").refresh();
                        }
                    }
                },
                {
                    id: "pdfviewer", 
                    view:"template", 
                    template:"<embed src='https://www.therapath.com/pdfs/SampleReport.pdf' width='100%' height='100%' pluginspage='http://www.adobe.com/products/acrobat/readstep2.html'>"
                }
            ]
        }
    };

    webix.ui(view);
});