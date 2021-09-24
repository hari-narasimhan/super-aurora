class ResourceProvider {
  constructor () {
    this._providers = {}
  }

  add(params) {
    try {
      const _provider = require('./providers/' + params.type)
      if (!_provider) {
        throw new Error('Unknown provider type, cannot instantiate provider');
      }
  
      this._providers[params.name] = new _provider(params.config)
      return this._providers[params.name]  
    } catch (err) {
      throw new Error('Module not available!')
    }
  }

  get(name) {
    return this._providers[name]
  }
}

module.exports = ResourceProvider
