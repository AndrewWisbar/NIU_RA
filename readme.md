# Project Title

This project is made up of several smaller applications

## Setup

After cloning or downloading the repository, it should be placed in the root directory of a webserver.
Only two other setup steps should need to be followed 
- Source and add images
> The images should be placed in a folder folder titled "images" within the root directory of the repository. Each of the images inside the folder should be named imgXXXX.jpg, beginning with img0000.jpg. By default, the application expects 8 images. However, the number can be changed by editing the appropriate entry in settings.js

- Dowload and compile LCM
> The application uses a program called LCM to find bipartite cliques in the relationship visualizer portion of the project. The source code for the program can be found here: <br>
http://research.nii.ac.jp/~uno/codes.htm (version 5.3 should used)<br> 
and documentation for the code can be found here: <br>
http://research.nii.ac.jp/~uno/code/lcm.html <br>
After downloading and compiling the source code, the exe file should be placed in the "PHP" file/directory


## Image And Caption Linking Application

In its current state, this application displays, to the user, the output of an object detection machine learning model.  

The user can then alter the results of the model to be more accurate, and draw connections between the text displayed above the image, and the objects detected in the image. The user can also draw bounding boxes around any object(s) the model may have missed. 

In the future, we hope to have a machine learning model generate a text caption to display to the user, but for the moment the caption is a pre-written sample. It is also planned to have a machine learning model automatically generate links between the generated caption and the image.


## Relationship Visualizer Application

This application allows the user to interact with and explore relationships within bipartite graphs.
