#### Resume

This module helps you organize your API by using a directory as a files container for different resources groups.

For example, if your project have the following structure:

```
./api/ |
       |-- user.js
       |-- document.js
```

And you register your API using:
```javascript
const wsr = require("pathto/wsrouter");

wsr.register(app,{
    resourcesDirectory: path.join(__dirname,"api/web"),
    version: 0.1,
    headers: {
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Headers":"Content-type"
    },
    authenticationFunction: apiAuth
});

function apiAuth(req, res, next){
    ...
}
```
Any API resource decelerated in the user.js file will use the path:

`/api/0.1/user/a_user_resource_name`

and the same thing will happend to any resource decelerated inside the document.js files, except tha the path will be:

`/api/0.1/document/a_document_resource_name`

#### Config parameter

| Property           | Description                                                    | Type    | Default | Mandatory |
|--------------------|----------------------------------------------------------------|:-------:|:-------:|:---------:|
| resourcesDirectory | Relative path to the directory containing the resources files. | String  | null    |yes        |
| version            | The API version added to the path for any API resource path.   | String  | null    |yes        |
| headers            | Lets you headers to the HTTP Response using an object where keys are the heather name, and value the content. | Object | null | no|
| authenticationFunction | A function used as a middleware for API resources authentication | Function | null |no |

#### Resources files definition

All resources files ar modules hence the resources declaration must be exported so the module can bind resources to the app.

The resources files follow the structure down bellow.

```javascript
exports.resourceList = [
    {
        path: "resource_name",
        callback: resource_req_handler,
        method: "Method",
        protected: true | false
    },
    ...
];
```

###### Resource definition: 

| Property           | Description                                     | Type      | Default | Mandatory |
|--------------------|-------------------------------------------------|:---------:|:-------:|:---------:|
| path               | path or name of the resource                    | String    | null    | yes       |
| callback           | Request Handler.                                | Function  | null    | yes       |
| method             | Request method, can be post, get or all         | String    | null    | yes       |
| protected          | Indicates whether to use authentication or not. | Boolean   | false   | no        |

