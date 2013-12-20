First install these...

Install node
------
sudo apt-get update

sudo apt-get install -y python-software-properties python g++ make

sudo add-apt-repository -y ppa:chris-lea/node.js

sudo apt-get update

sudo apt-get install nodejs



Install bower
------
sudo npm install -g bower


Build, pull down Bower dependencies and more (run this in the root directory)
------
grunt


Run the server
------
node server/app