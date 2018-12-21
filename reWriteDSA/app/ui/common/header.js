
define("common/header",function()
        {

            var headerUI = {view:"template",type:"header",template:"DSA 2.0 Rewrite"}
          
            return headerUI

        })

// define(["config", "session", "login"], function(config, session, login) {    
//     if(session.valid())
//         loginBtn = { id:"login_btn", value:"Logout (" + session.username() + ")"}
//     else
//         loginBtn = { id:"login_btn", value:"Login"}
//     console.log(config);
//     var menu = {
//         view:"menu",
//         width: 250,
//         id: "header_menu",
//         data: [
//             loginBtn,
//             { id:"1",value:"TCGA Resources", submenu:[
//                  {value:"TCGA Analytical Tools", href: "https://tcga-data.nci.nih.gov/docs/publications/tcga/", target:"_blank"},
//              ]},
//             { id:"3",value:"Help", submenu:[
//                 {value:"About the CDSA"},
//                 {value:"Repository Stats"}
//             ]}
//         ],
//         type:{height:15},
//         css: "menu",
//         on:{ 
//             onItemClick:function(id){
//                 if(id == "login_btn"){
//                     var val = $$('header_menu').config.data[0].value;
//                     val == "Login" ? $$("login_window").show() : login.logout();
//                 }
//             }
//         }
//     };


//     header = {
//         borderless: true,
//         cols: [{
//             view: "toolbar",
//             height: 66,
//             css: "toolbar",
//             cols: [{
//                     view: "template",
//                     borderless: true,
//                     template: "<img src='" + config.LEFT_HEADER_IMG + "' height='40'/>",
//                     width: 200
//                 }, 
//                 { },
//                 {
//                     rows:[
//                         menu,
//                         {
//                             view: "template",
//                             align: "right",
//                             borderless: true,
//                             template: "<img src='" + config.RIGHT_HEADER_IMG + "' height='50'/>",
//                             width: 250
//                         }
//                     ]
//                 }
//             ]
//         }]
//     };

//     return header;
// });