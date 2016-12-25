define("ui/header", function() {

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