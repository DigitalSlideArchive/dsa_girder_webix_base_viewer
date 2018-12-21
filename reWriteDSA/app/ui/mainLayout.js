/* This module defines the basic layout of a single page DSA Web App */


define("app/ui/mainLayout", 
			["common/header","common/leftPanel","common/rightPanel",
			"common/mainPanel","webix"],
		 function(header,leftPanel,rightPanel,mainPanel) {


    dsaFooter = { view: "template", id: "dsaFooter", height: 25, view:"template", 
                template: "<span>#name# #_id#</span>",
                data:{name:"",_id:""}}

// define("common/footer", function() {
    
//     var footer = {
//         id: "footer", 
//         borderless: true, 
//         height: 25, 
//         view: "template", 
//         template: "<span>#name# </span>", 
//         data:{name: "", url: ""},
//         css: "footer"
//     };

// //        template: "<span>#name# | #url#</span>", 


//     return footer;
// });


    dsaLayout = {
        id: "root",
        rows: [
           header,
            {
                cols: [
                   leftPanel,
                    {view:"resizer"},
                   mainPanel,
                    {view:"resizer"},
				rightPanel
                ]
            },
            dsaFooter
        ]
    }
    return dsaLayout
})



//       switch(config.UI){
//           case "standard":
//               standard.init();
//               break;
//           case "tcga":
//               tcga.init();
//               break;
//           case "tcgaCached":
// console.log("Trying to load Cached TCGA Version...");
//               tcgaCached.init();
//               break;

//           default:
//               console.error("Invalid configuration: " + config.UI + " UI not found");
//       }

//     webix.event(window, 'resize', function(){
//         $$("root").resize();
//     });
// }