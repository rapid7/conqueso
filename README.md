# Conqueso [![Build Status](https://secure.travis-ci.org/rapid7/conqueso.png)](http://travis-ci.org/rapid7/conqueso) [![Dependency Status](https://david-dm.org/rapid7/conqueso.png)](https://david-dm.org/rapid7/conqueso) #
Conqueso is a web server that provides an interface for centrally managing dynamic properties across your services. Simply add a client library to your service then track and manage its configuration in Conqueso.
Everything's better... Conqueso.

### Features
1. Web interface with REST API for all your configuration property desires
2. Manage typed dynamic properties for each service or globally for all services
3. Track your online services and view/filter by instance metadata

<img src="/images/screenshot1.png">
<img src="/images/screenshot2.png">
<img src="/images/screenshot3.png">

### What's with the name?
[Naming things is hard](http://martinfowler.com/bliki/TwoHardThings.html). The "con" prefix comes from "config" or "configuration". The name is silly and fun to say; we hope you enjoy seeing the word "conqueso" in your code as much as we do.

### License
The Conqueso server and the conqueso-client-java library are licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.html).

### Dependencies
Conqueso runs on [Node.js](http://nodejs.org/) and is backed by MySQL.

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
            "password"      : "root",
            "pool"          : { "maxConnections": 15, "maxIdleTime": 5000 }
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
    "instances": 1
  },
  {
    "name": "test-framework-server",
    "instances": 0
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

###### GET ```/api/roles/:role/properties?json```
Gets JSON properties for a role. This will not include global properties or special (conqueso.:role.ips) properties.
```
{
    "name": "global",
    "properties": [
        {
            "id": 18,
            "name": "bourbon",
            "value": "blantons,four roses,weller",
            "type": "STRING_SET",
            "description": "Mhm",
            "createdAt": "2014-10-02T18:23:33.000Z",
            "updatedAt": "2014-10-02T18:23:33.000Z",
            "roleId": 1
        },
        {
            "id": 17,
            "name": "coffee",
            "value": "true",
            "type": "BOOLEAN",
            "description": "sweet sweet coffee!",
            "createdAt": "2014-10-02T18:20:38.000Z",
            "updatedAt": "2014-10-02T20:09:15.000Z",
            "roleId": 1
        },
        {
            "id": 30,
            "name": "rye",
            "value": "false",
            "type": "BOOLEAN",
            "description": null,
            "createdAt": "2014-10-02T18:38:06.000Z",
            "updatedAt": "2014-10-02T20:09:18.000Z",
            "roleId": 1
        }
    ]
}
```

###### GET ```/api/roles/:role/properties/:property```
Get a specific property value in plain/text.

```
curl -X GET "http://localhost:8080/api/roles/global/properties/test"
```

###### GET ```/api/roles/:role/properties/:property?json```
Get a specific property in JSON.

###### PUT ```/api/roles/:role/properties/:property```
###### PUT ```/api/roles/:role/properties/```
Update an existing property

```
curl -X PUT "http://localhost:8080/api/roles/global/properties/test" -d "value=new_value"
```

If you use the version of this API without the property in the URL, then you must specify it as a data parameter:
```
curl -X PUT "http://localhost:8080/api/roles/global/properties" -d "name=test&value=new_value"
```

###### DELETE ```/api/roles/:role/properties/test```
Delete a property.

###### GET ```/api/roles/:role/instances```
Get all online instances with metadata for a role.
```json
[
  {
    "role" : "analytics-service",
    "ip": "10.1.100.78",
    "pollInterval": 60000,
    "offline": false,
    "createdAt": "2014-02-05T17:05:39.000Z",
    "updatedAt": "2014-02-05T18:46:48.000Z",
    "metadata": {
        "ami-id" : "ami-133cb31d",
        "availability-zone" : "us-east-1d",
        ...
    }
  },
  ...
]
```
You can also query for instances of this role with matching metadata. Example:
```
/api/roles/my_server_role/instances?ami-id=ami-133cb31d&availability-zone=us-east-1d
```

###### POST ```/api/roles/:role/properties```
Send your role properties and instance metadata. Creates a role if one does not already exist. For each property that does not already exist, the property is added with the given type and default value. The description attribute optionally describes the meaning of the property, for display when viewing and editing properties in the Conqueso interface. If an instance does not already exist from the request IP, then a new instance will be created. If an instance from the request IP already exists and the metadata values have changed, other instanaces will be marked offline and a new instance will be created.
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
            "type": "BOOLEAN",
            "description": "Are you wearing skinny jeans?"
        }
    ]
}
```

###### GET ```/api/instances```
Returns a list of all online instances across roles. You may filter this list by matching metadata key/values.
```
/api/instances?ami-id=ami-0be1ba63&availability-zone=us-east-1d
```
```json
[
  {
    "role": "mustache-generation-server",
    "ip": "111.3.3.3",
    "pollInterval": 60000,
    "createdAt": "2014-02-07T14:25:07.000Z",
    "updatedAt": "2014-03-07T14:25:07.000Z",
    "metadata": {
      "conqueso.poll.interval": "50000",
      "instance-type": "t1.micro",
      "ami-id": "ami-0be1ba63",
      "block-device-mapping": "ami",
      "availability-zone": "us-east-1d"
    }
  }
]
```
### Create roles and properties on startup
If you want to initialize your server with roles and/or properties, you may create a defaults.json file in the server/config directory. Example file:
```json
[
    {
        "role": "old-record-player",
        "properties": [
            {
                "name": "company",
                "type": "STRING",
                "value": "Victor Talking Machine Company",
                "description": "What company manufactured the old-record-player"
            }
        ]
    },
    {
        "role": "global",
        "properties": [
            {
                "name": "cassette",
                "type": "BOOLEAN",
                "value": true
            },
            {
                "name": "books",
                "type": "FLOAT",
                "value": 12.2,
                "description": "Books, yeah books."
            }
        ]
    }
]
```
The following types are supported:
```
"STRING", "BOOLEAN", "DOUBLE", "FLOAT", "INT", "LONG", "STRING_LIST", "STRING_MAP", "STRING_SET"
```
The description attribute optionally describes the meaning of the property, for display when viewing and editing properties in the Conqueso interface.
### Building
#### Install node
```
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```

#### Migration from Bower to Yarn

Previous iterations used Bower as package manager but it has been discontinued, therefore Yarn has been implemented, using the following instructions.
https://bower.io/blog/2017/how-to-migrate-away-from-bower/

Go to the root of the directory and run:
```
yarn install
```

The dependencies within package.json with Bower were held under bower_components. By migrating to Yarn, the dependencies are moved to node_modules/@bower_componenets