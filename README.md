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
The following plugins are currenty included in the base DSA:

* **Annotations**: This plugin uses GeoJS to draw annotations on the slide, allows to change opacity, color and stroke for each annotation and delete annotations.

* Aperio

* Derm

* Filters

* Metadata

* Pathology Reports
