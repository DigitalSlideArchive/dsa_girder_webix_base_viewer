Digital Slide Archive
=============================

This version of the Digital Slide Archive (DSA) uses Girder for the backend and Webix UI for the frontend. 
It also provides two types of UIs that you can set in the app/config.js file. Those UIs are the TCGA UI and the standard
UI, which I will discuss in more details below. The repo provides the base version for this DSA, but you can also create plugins and widgets
to add mroe functionalities, which you will find examples of in app/plugins. This keeps the DSA components independent and the code cleaner.

Dependencies:
-----------------------------
Before installing the DSA make sure you install the following:

* bower


Installation:
-----------------------------
Clone the github repo:

`git clone https://github.com/DigitalSlideArchive/dsa_girder_webix_base_viewer.git`

cd into dsa_girder_webix_base_viewer

`cd dsa_girder_webix_base_viewer/web`

# Please note, the default version of NodeJS on Ubuntu 16.04 is quite old, and you will likely have issues installing bower, use the following link to add a Package Repository/PPA that has a more recent version to make installing nodejs (and then bower) easier

https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04

Run bower install

`bower install`

Rename app/config.js.example

`mv app/config.js.example app/config.js`

Configurations:
------------------------------
There are few parameters you need to change in config.js before making the DSA live.

`BASE_URL`: this is the base URL for the Girder API

`COLLECTION_NAME`: collection name (required only if you are using non TCGA data)

`UI`: type of UI. Either **tcga** if you are using TCGA endpoints or **standard** for non-TCGA data/endpoints

Deployment:
-------------------------------
Deployment is easy once the installation and configurations are completed. If you are working locally, simply
open index.html in the browser. If you are deploying on a server there are two options. The second option is what you should 
use for production deployment.

#### Option 1: SimpleHTTPServer
Make sure you are in the `web` directory and run the following command

`python -m SimpleHTTPServer 8000`

You can use whatever port, 8000 is just for illustration.

#### Option 2: NGINX
For this option make you have NGINX installed

`sudo apt-get install nginx`

`cd /etc/nginx/sites-enabled`

Open the file default in whatever text editor you like and in the server block we need to add the following three lines

```
location /dsa {
    alias /path/to/dsa_girder_webix_base_viewer/web;
}
```

Your server block will look like that

```
server {
    listen 80 default_server;
    listen [::]:80 default_server ipv6only=on;
     
    ...
    ...

    location /dsa {
        alias /path/to/dsa_girder_webix_base_viewer/web;
    }
}
```

Save the file and restart NGINX

`sudo service nginx restart`

Point your browser to http://yourdomain.com/dsa to access the DSA.

Plugins:
----------------------------

#### Available plugins:

The following plugins are currenty included in the base DSA:

* **Annotations**: This plugin uses GeoJS to draw annotations on the slide, allows to change opacity, color and stroke for each annotation and delete annotations.

* **Aperio**: loads aperio annotations into a window.

* **Derm**: derm path plugin enables users to review slides using predefined set of questions (designed for Micheal Sargen study)

* **Filters**: filter widget for the slides where you can adjust contrast, brightness, etc.

* **Metadata**: metadata widget to render the TCGA metadata (TCGA ONLY)

* **Pathology Reports**: pathology report widget for TCGA data (TCGA ONLY)

#### Enable plugins:

1. All plugins should be defined in main.js under `paths`

2. Plugins are enabled in app/app.js

3. Enabled plugins should be listed in the require([]) as follows:

```
require(["routes", "aperio", "filters", "derm"]);
```

where routes, aperio, etc are plugin names defined in main.js
