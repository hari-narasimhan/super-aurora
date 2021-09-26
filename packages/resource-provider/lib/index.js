class ResourceProvider {
  constructor () {
    this._providers = {}
  }
  // Add a new provider
  async add(params) {
    try {
      const _provider = require('./providers/' + params.type)
      if (!_provider) {
        throw new Error('Unknown provider type, cannot instantiate provider');
      }
      this._providers[params.name] = await _provider.create(params.config)
      return this._providers[params.name]  
    } catch (err) {
      throw new Error('Module not available!')
    }
  }
  // Get resource provider
  get(name) {
    return this._providers[name]
  }
}

module.exports = ResourceProvider
