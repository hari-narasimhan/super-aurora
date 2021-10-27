# super-aurora
Collection of nodejs application development tools

# Working with mongo provider

## Configuring the provider
```
const ResourceProvider = require('@super-aurora/resource-provider)
const provider = new ResourceProvider()

// Add the mongo provider inside an async function

await provider.add({
  type: 'mongo',
  name: 'db,
  config: {
    uri: 'http://localhost:27017'
  }
})
```

## consuming the provider
Make sure that `provider.get` method is called within a function and not on top of the module.
```
const db = provider.get('db')
```

## Calling mongodb methods
All mongodb provider method follow the same method signature. They have two parameters. The first parameter signifies a context and contains the database and collection to be used for the call. The second parameter consists of options required to complete the call. All calls returns a promise if successful. In case of failure an error is thrown.

Example
```
// Context is identity database and the collection is users
const ctx = {db: 'identity', coll: 'users'}

// find the user with email `john.doe@acme.com`
const options = { query: { email: 'john.doe@acme.com' }}

await db.find(ctx, options)
```
### find

Signature: `find(ctx, options)`, returns an object containing records and optionally a cursor

The options is an object that can contain one or more of the following parameters

* query - object      - Corresponds to a mongo query
* projection - object - An object containing keys that must be returned, the key with value 1 is returned, key with value 0 is omitted
* page - number (integer) - The starting page to return the data
* limit - number (integer) - Number of records to be returned, default is 10
* sort - object - An object containing keys for sorting, the value 1 for the key indicated ascending order and -1 indicates descending order
* includeCursor - boolean

```
Example:

find({db: 'identity', coll: 'users}, {
  query: { department: 'marketing' },
  projection: {firstName: 1, lastName: 1, department: 0}
  page: 1,
  limit: 50,
  sort: { firstName: 1 }
  includeCursor: true
})
```

### count

Signature: `count(ctx, query)`
The options is an object that can contain one or more of the following parameters

* query - object      - Corresponds to a mongo query for which the count is returned

```
Example:

count({db: 'identity', coll: 'users}, {
  query: { department: 'marketing' }
})

```

### findOne

Signature: `find(ctx, options)`, returns a single matching record otherwise null

The options is an object that can contain one or more of the following parameters

* query - object      - Corresponds to a mongo query
* projection - object - An object containing keys 

```
Example:

findOne({db: 'identity', coll: 'users}, {
  query: { email: 'john@acme.com' },
  projection: {firstName: 1, lastName: 1, department: 1}
})
```

### insert

Signature `insert(ctx, options)`, inserts the record and returns the raw response

The options is an object that can contain one or more of the following parameters

* payload - object - The payload to be inserted into the collection

```
Example
insert({db: 'identity', coll: 'users'}, {
  payload: {
    firstName: 'John',
    lastName: 'doe',
    email: 'john.doe@acme.com',
    department: 'marketing'
  }
})
```

### update
Signature `update(ctx, options)`, updates the record and returns the raw response. Please note that this method only updates the first matching record

The options is an object that can contain one or more of the following parameters

* criteria - The filter criteria to match the record for update
* payload - object - The payload to be inserted into the collection

```
Example
update({db: 'identity', coll: 'users'}, {
  criteria: {email: 'john.doe@acme.com'},
  payload: {
    department: 'sales'
  }
})
```

### upsert
Signature `upsert(ctx, options)`, updates the record if exists otherwise creates a new record and returns the raw response. 
The options is an object that can contain one or more of the following parameters

* criteria - The filter criteria to match the record for update
* payload - object - The payload to be inserted into the collection

```
Example
upsert({db: 'identity', coll: 'users'}, {
  criteria: {email: 'john.doe@acme.com'},
  payload: {
    department: 'sales'
  }
})
```

### remove
Signature `remove(ctx, options)`, removes the record and returns the raw response. Please note that this method only updates the first matching record

The options is an object that can contain one or more of the following parameters

* criteria - The filter criteria to match the record for removal

```
Example
remove({db: 'identity', coll: 'users'}, {
  criteria: {email: 'john.doe@acme.com'}
})
```


### removeMultiple
Signature `removeMultiple(ctx, options)`, removes multiple record that matches the criteria param

The options is an object that can contain one or more of the following parameters

* criteria - The filter criteria to match the record for removal

```
Example
remove({db: 'identity', coll: 'users'}, {
  criteria: {department: 'marketing'}
})
```
