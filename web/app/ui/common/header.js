define("common/header", ["login"], function(login) {
    
    var menu = {
        view:"menu",
        width: 400,
        id: "header_menu",
        data: [
            { id:"1",value:"TCGA Resources", submenu:[
                 {value:"TCGA Analytical Tools", href: "https://tcga-data.nci.nih.gov/docs/publications/tcga/", target:"_blank"},
             ]},
            { id:"3",value:"Help", submenu:[
                {value:"About the CDSA"},
                {value:"Repository Stats"}
            ]},
            { id:"login_btn", value:"Login"}
        ],
        type:{height:55},
        css: "menu",
        on:{ 
            onItemClick:function(id){
                var val = $$('header_menu').config.data[2].value;
                val == "Login" ? $$("login_window").show() : login.logout();
            }
        }
    };

    header = {
        borderless: true,
        cols: [{
            view: "toolbar",
            height: 66,
            css: "toolbar",
            cols: [{
                    view: "template",
                    borderless: true,
                    template: "<img src='img/CDSA_Slide_50.png' height='40'/>",
                    width: 200
                }, 
                {},
                menu,
                {
                    view: "template",
                    borderless: true,
                    template: "<img src='http://cancer.digitalslidearchive.net/imgs/Winship_06-2011/Winship_NCI_shortTag/horizontal/jpg_png/Winship_NCI_shortTag_hz_280.png' height='50'/>",
                    width: 160
                },
            ]
        }]
    };

    return header;
});