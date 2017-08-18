#!/bin/bash

source /home/dgutman/anaconda/envs/dsa_girder/bin/activate dsa_girder
/home/dgutman/anaconda/envs/dsa_girder/bin/jupyter notebook --config=/home/dgutman/.jupyter/jupyter_notebook_config.py --notebook-dir=/home/mkhali8/dev/dsa_girder_webix_base_viewer/experimental/loadScripts --port 8891
