![](https://david-dm.org/rapid7/conqueso.png)

Install node
------
sudo apt-get update

sudo apt-get install -y python-software-properties python g++ make

sudo add-apt-repository -y ppa:chris-lea/node.js

sudo apt-get update

sudo apt-get install nodejs


Install Grunt and Bower
------
npm install -g grunt-cli bower


Install NPM dependencies
------
npm install


Build, pull down Bower dependencies and more
------
grunt


Run the server
------
npm start


Package for Chef deployment
------
grunt package

This will generate a few things.  First, it will generate a settings.json.erb in a 
templates directory at the root of the project, then that will be included in an 
conqueso-server-<version>.zip file generated in the artifact directory. 

To clean up the resulting artifact and templates directory, run "grunt clean".
