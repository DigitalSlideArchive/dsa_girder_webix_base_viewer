define("tcgaCached/slidenav", ["config", "viewer", "pubsub", "slide", "jquery", "tcgaSlideCache", "webix"], function(config, viewer, pubsub, slide, $, tcgaSlideCache) {
    webix.message("Using Cached DSA Version")


    //creating a map of cohortName to ID..
    cohortNameToId = {};
    caseNameToId = {};

    Object(tcgaSlideCache).forEach(function(k, idx) {
        cohortNameToId[k['name']] = idx;

        cases = k['caseListData'];
         Object(cases).forEach( function(c,v) {
             caseNameToId[c['name']] = c['_id'];
             })



    })

    $.extend({
        getQueryParameters: function(str) {
            return (str || document.location.search).replace(/(^\?)/, '').split("&").map(function(n) { return n = n.split("="), this[n[0]] = n[1], this }.bind({}))[0];
        }
    });

    function recomputePagerItems() {
        var itemWidth = $$("slideSelector").config.type.width;
        var itemHeight = $$("slideSelector").config.type.height;
        var dataWidth = $$("slideSelector").$width;
        var dataHeight = $$("slideSelector").$height;
        var pagerSize = $$("slideSelector").getPager().config.size;
        /* Compute items per row and items per column */
        thumbsPerRow = Math.floor(dataWidth / itemWidth);
        if (thumbsPerRow < 1) { thumbsPerRow = 1 }

        thumbsPerCol = Math.floor(dataHeight / itemHeight);
        if (thumbsPerCol < 1) { thumbsPerCol = 1 }
        //    console.log(thumbsPerCol,thumbsPerRow);
        pagerSize = thumbsPerCol * thumbsPerRow;
        $$("slideSelector").getPager().define({ size: pagerSize });
        $$("slideSelector").refresh()
    }

    var thumbnailsPanel = {
        view: "dataview",
        id: "slideSelector",
        select: true,
        template: "<div class='webix_strong'>#name#</div><img src='" + config.BASE_URL + "/item/#_id#/tiles/thumbnail'/>",
        pager: "item_pager",
        datafetch: 25,
        type: {
            height: 170,
            width: 200
        },
        on: {
            onItemClick: function(id, e, node) {
                var item = this.getItem(id);
                slide.init(item);
            },
            onAfterLoad: function() {
                if (this.getFirstId()) {
                    var item = this.getItem(this.getFirstId());
                    slide.init(item);
                }
            }
        }
    };

    itemPager = {
        view: "pager",
        id: "item_pager",
        height: 45,
        template: "<center>{common.prev()}{common.page()}/#limit#{common.next()}<br/>(#count# slides)</center>",
        animate: true,
        size: 5,
        group: 4
    };

    //dropdown for slide groups
    //Data is pulled from DSA webservice
    //slideset refers to the COHORT/larger group


    dropdown = {
        view: "combo",
        placeholder: "Select Cohort",
        id: "slideset",
        options: {
            body: {
                template: "#name#"
            }
        },
        on: {
            onChange: function(id) {
                var item = this.getPopup().getBody().getItem(id);
                console.log(id);
                $$("slideSelector").clearAll();
                $$("slideSelector").setPage(0);
                //$$("slideSelector").load(url);

                //$.get(config.BASE_URL + "/tcga/case?limit=2000&cohort=" + item._id, function(resp) {
                //   var cases = resp["data"]
                var ptSamples = $$("ptSamples").getPopup().getList();
                $$("ptSamples").setValue();
                ptSamples.clearAll();
                ptSamples.parse(item["caseListData"]);


                var url = "PagingGirderItems->" + config.BASE_URL + "/tcga/cohort/" + item._id + "/images";
                $$("slideSelector").clearAll();
                $$("slideSelector").load(url);
            },
            onAfterRender: webix.once(function() {

                //Migrating to using a cached list...

                // $.get(config.BASE_URL + "/tcga/cohort", function(resp) {
                var cohorts = tcgaSlideCache;
                var cohortList = $$("slideset").getPopup().getList();
                cohortList.clearAll();
                cohortList.parse(cohorts);
                qp = $.getQueryParameters();
                cohortIdxToLoad = 0; //asssume we load the first value unless the user has requested a valid cohort

                if (qp.cohort) {
                    cohortName = qp.cohort.toLowerCase();
                    if (cohortNameToId[cohortName]) {
                        cohortIdxToLoad = cohortNameToId[cohortName];
                    }
                }
                //This loads the slideSet we want
                $$("slideset").setValue(cohorts[cohortIdxToLoad].id);


                if (qp.patientId) {
                    //webix.message("Also trying to load a specific patient..")
                    patientId = qp.patientId;
                    if( caseNameToId[patientId])
                        {
                $$("ptSamples").setValue(caseNameToId[patientId])
                        }
                    // console.log(caseNameToId);


                }

                // var url = "PagingGirderItems->" + config.BASE_URL + "/tcga/cohort/" + cohorts[0]._id + "/images";
                // $$("slideSelector").clearAll();



                // $$("slideSelector").load(url);
                // });
            })
        }
    };

    samples_dropdown = {
        view: "combo",
        placeholder: "Select Patient",
        id: "ptSamples",
        options: {
            filter: function(item, value) {
                if (item.name.toString().toLowerCase().indexOf(value.toLowerCase()) > -1)
                    return true;
                return false;
            },
            body: {
                template: "#name#"
            }
        },
        on: {
            onChange: function(id) {
                if (id) {
                    var item = this.getPopup().getBody().getItem(id);
                    var thumbs = $$("slideSelector");
                    var url = config.BASE_URL + "/tcga/case/" + item._id + "/images";
                    thumbs.clearAll();
                    thumbs.setPage(0);
                    thumbs.load(url);
                }
            }
        }
    };

    //slides panel is the left panel, contains two rows 
    //containing the slide group dropdown and the thumbnails panel 
    var wideIcon = "<span class='aligned wide webix_icon fa-plus-circle'></span>";
    var narrowIcon = "<span class='aligned narrow webix_icon fa-minus-circle'></span>";
    var slidesPanel = {
        id: "slidenav",
        header: "Slides " + wideIcon + narrowIcon,
        onClick: {
            wide: function(event, id) {
                var count = $$("thumbnails").count();
                this.config.width = 205 * 6;
                this.resize();

                $$("item_pager").config.size = Math.min(30, count);
                $$("item_pager").refresh();
                $$("thumbnails").refresh();
                return false;
            },
            narrow: function(event, id) {
                this.config.width = 220;
                this.resize();

                $$("item_pager").config.size = 5;
                $$("item_pager").refresh();
                $$("thumbnails").refresh();
                return false;
            }
        },
        body: {
            rows: [
                dropdown, samples_dropdown, itemPager, thumbnailsPanel
            ]
        },
        width: 220
    };

    webix.attachEvent("onResize", function() {
        recomputePagerItems();
    })



    return slidesPanel;
});