'use strict'

class Repository {
  constructor(table, columns) {
    this.table = table
    this.columns = columns
  }

  async findById({ db, params }) {
    try {
      const data = await db(this.table)
        .where({ id: params.id })
        .select()
        .columns(this.columns)
        .first()
      if (!data) {
        throw new Error('Record doesnt exists!')
      }
      return data
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async findOne({ db, params }) {
    try {
      return await db(this.table)
        .where(params && params.query ? params.query : params)
        .select()
        .columns(this.columns)
        .first()
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async create({ db, payload }) {
    try {
      const data = await this.findOne({ db, params: payload })
      if (!data) {
        const result = await db(this.table).insert(payload).returning('id')
        return await this.findById({ db, params: { id: result[0].id } })
      } else {
        throw new Error({ message: 'Record already exists' })
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async list({ db, params }) {
    try {
      const limit = params.limit || 10
      const page = params.page || 1
      const sort = params?.sort
        ? Object.keys(params.sort).map((k) => ({
          column: k,
          order: params.sort[k] < 0 ? 'desc' : 'asc',
        }))
        : []
      const offset = page > 0 ? (page - 1) * limit : 0
      const columns = params?.fields?.length > 0 ? params.fields : this.columns
      const totalRecords = await db
        .count('* as count')
        .from(this.table)
        .where(params.query)
        .first()
      const result = await db(this.table)
        .where(params.query)
        .column(columns)
        .orderBy(sort)
        .offset(offset)
        .limit(limit)
      return {
        records: result,
        cursor: {
          currentPage: page,
          perPage: limit,
          totalRecords: parseInt(totalRecords.count),
          totalPages: parseInt(Math.ceil(totalRecords.count / limit)),
        },
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async remove({ db, params }) {
    try {
      const data = await this.findById({ db, params })
      if (data) {
        return await db(this.table)
          .where({ id: params.id })
          .del()
          .returning('id')
      } else {
        throw new Error('Record doesnt exists!')
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async update({ db, params, payload, updateAt = true }) {
    try {
      if (updateAt) payload.updatedAt = new Date()
      const data = await this.findById({ db, params })
      if (data) {
        await db(this.table).where({ id: params.id }).update(payload)
        return await this.findById({ db, params })
      } else {
        throw new Error('Record doesnt exists!')
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async updateAny({ db, params, payload, updateAt = true }) {
    try {
      if (updateAt) payload.updatedAt = new Date()
      await db(this.table).where(params).update(payload)
      return await this.findOne({ db, params })
    } catch (err) {
      throw new Error(err.message)
    }
  }

}

module.exports = Repository
