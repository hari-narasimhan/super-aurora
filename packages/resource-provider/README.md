# `@super-aurora/resource-provider`
> This is a generic resource provider for accessing backend resources from a server application

## Usage
```
const ResourceProvider = require('@super-aurora/resource-provider');
const resourceProvider = new ResourceProvider();

resourceProvider.add({ type: 'type', name: 'name', config: {} });

const provider = resourceProvider.get('name');
```
