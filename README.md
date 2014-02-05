# Conqueso [![Build Status](https://secure.travis-ci.org/rapid7/conqueso.png)](http://travis-ci.org/rapid7/conqueso) [![Dependency Status](https://david-dm.org/rapid7/conqueso.png)](https://david-dm.org/rapid7/conqueso) #
Conqueso is a web server that provides an interface for centrally managing dynamic properties across your services. Simply add a client library to your service then track and manage its configuration in Conqueso.

### Features
1. Web interface with REST API for all your configuration property desires
2. Manage typed dynamic properties for each service or globally for all services
3. Track your online services and view/filter by instance metadata

<img src="/images/screenshot1.png">
<img src="/images/screenshot2.png">
<img src="/images/screenshot3.png">

### Dependencies
Conqueso runs on [Node](http://nodejs.org/) and is backed by MySQL.

### Setup and configuration
Conqueso requires that you provide a SQL user account capable of creating a database and tables. We'll manage all the migrations and database updates for you. You can modify your server settings by modifying
```
server/config/settings.json
```
```json
{
    "http": {
        "port": 8080
    },
    "db" : {
        "type" : "MYSQL",
        "config" : {
            "host"          : "localhost",
            "port"          : "3306",
            "databaseName"  : "conqueso",
            "user"          : "root",
            "password"      : "root"
        }
    },
    "properties" : {
        "pollIntervalSecs" : 15
    },
    "logging" : {
        "dir"    : "logs",
        "file"   : "server.log",
        "level"  : "info"
    }
}
```
### Running the server
The easiest way to run Conqueso is to download a release, unzip it and run
```
node server/app
```

### Supported clients
1. [Java](http://github.com/rapid7/conqueso-client-java)

### REST API
###### GET ```/api/roles```
Gets all roles with instances.
```json
[{
    "name": "analytics-service",
    "createdAt": "2014-01-22T18:22:28.000Z",
    "updatedAt": "2014-01-22T18:22:28.000Z",
    "instances": [
      {
        "ip": "10.1.100.78",
        "pollInterval": 60000,
        "offline": false,
        "createdAt": "2014-02-05T17:05:39.000Z",
        "updatedAt": "2014-02-05T18:00:15.000Z",
      }
    ]
  },
  {
    "name": "test-framework-server",
    "createdAt": "2014-02-03T14:54:19.000Z",
    "updatedAt": "2014-02-03T14:54:19.000Z",
    "instances": []
  }]
```
###### GET ```/api/roles/:role/properties```
Gets plain/text properties for a role. This will overlay (with precedence) any global properties. For convenience, this will also include special Conqueso properties (conqueso.:role.ips) which is a list of online instances for all the other roles. You may find this useful if you need one service to know where to find another service.
```
globalprop=my_global_value
aws.metrics.enabled=false
fitness.value=88.33
list.of.items=item1,item2,item3,item4,item5
max.login.attempts=10
web.url.public=http://my-public-url.com
conqueso.analytics-service.ips=10.1.100.78
conqueso.test-framework-server.ips=
conqueso.web-interface-service.ips=
```

###### GET ```/api/roles/:role/properties/:property```
Get a specific property in plain/text.

###### GET ```/api/roles/:role/instances"```
Get all online instances with metadata for a role.
```json
[
  {
    "ip": "10.1.100.78",
    "pollInterval": 60000,
    "offline": false,
    "createdAt": "2014-02-05T17:05:39.000Z",
    "updatedAt": "2014-02-05T18:46:48.000Z",
    "metadata": [
      {
        "attributeKey": "ami-id",
        "attributeValue": "ami-133cb31d",
        "createdAt": "2014-02-05T17:05:39.000Z",
        "updatedAt": "2014-02-05T17:05:39.000Z",
      },
      {
        "attributeKey": "availability-zone",
        "attributeValue": "us-east-1d",
        "createdAt": "2014-02-05T17:05:39.000Z",
        "updatedAt": "2014-02-05T17:05:39.000Z",
      },
...
    ]
  }
]
```
###### POST ```/api/roles/:role/properties"```
Send your role properties and instance metadata. Creates a role if one does not already exist. If an instance does not already exist from the request IP, then a new instance will be created. If an instance from the request IP already exists and the metadata values have changed, other instanaces will be marked offline and a new instance will be created.
```json
{
    "instanceMetadata": {
        "meta.property.1": "songs you've never heard of",
        "meta.property.2": "artisanal cream cheese"
    },
    "properties": [
        {
            "name": "hipster-mode-enabled",
            "value": "true",
            "type": "BOOLEAN"
        }
    ]
}
```

### What's with the name?
Naming things is hard. The "con" prefix comes from "config" or "configuration". The name is silly and fun to say; we hope you enjoy seeing the word "conqueso" in your code as much as we do.

### Building
#### Install node
```
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```

#### Install Grunt and Bower
```
npm install -g grunt-cli bower
```

#### Install NPM dependencies
```
npm install
```

#### Build, pull down Bower dependencies and more
```
grunt
```

#### Package for Chef deployment
```
grunt package
```

This will generate a few things.  First, it will generate a settings.json.erb in a 
templates directory at the root of the project, then that will be included in an 
conqueso-server-<version>.zip file generated in the artifact directory. 

To clean up the resulting artifact and templates directory, run "grunt clean".
