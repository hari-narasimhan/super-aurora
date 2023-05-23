// const camelcase = require('lodash.camelcase')
// const snakecase = require('lodash.snakecase')

class Repository {
  constructor(table, columns) {
    this.table = table
    this.columns = columns
  }

  findById({ db, params }) {
    return db(this.table).where({ id: params.id }).select().columns(this.columns).first()
  }

  findOne({ db, params }) {
    return db(this.table).where(params.query).select().columns(this.columns).first()
  }

  async create({ db, payload }) {
    const result = await db(this.table).insert(payload).returning('id')
    return this.findById({ db, params: { id: result[0].id } })
  }

  async list({ db, params }) {
    const limit = params.limit || 10
    const page = params.page || 1
    const sort = params?.sort
      ? Object.keys(params.sort).map(k => ({
        column: k,
        order: params.sort[k] < 0 ? 'desc' : 'asc'
      }))
      : []
    const offset = page > 0 ? ((page - 1) * limit) : 0
    const columns = params?.fields?.length > 0 ? params.fields : this.columns
    const totalRecords = await db.count('* as count').from(this.table).where(params.query).first()
    const result = await db(this.table).where(params.query).column(columns)
      .orderBy(sort)
      .offset(offset).limit(limit)
    return {
      records: result,
      cursor: {
        currentPage: page,
        perPage: limit,
        totalRecords: parseInt(totalRecords.count),
        totalPages: parseInt(Math.ceil(totalRecords.count / limit))
      }
    }
  }

  remove({ db, params }) {
    return db(this.table).where({ id: params.id }).del().returning('id')
  }

  async update({ db, params, payload }) {
    // Set the updated_at attribute
    payload.updatedAt = new Date()
    await db(this.table).where({ id: params.id }).update(payload)
    return this.findById({ db, params })
  }
}

module.exports = Repository
