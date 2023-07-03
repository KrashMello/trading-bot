import { MongoClient } from 'mongodb'
import 'dotenv/config'
class MONGODB {
  private client = new MongoClient(process.env.DB_URL ?? 'localhost')
  private DB_DATABASE = process.env.DB_DATABASE ?? 'test'
  private tableName: string = 'task'
  constructor(tableName: string = 'test') {
    this.tableName = tableName
  }
  public async findOne(query: object, options: object = {}) {
    try {
      const database = this.client.db(this.DB_DATABASE)
      const collections = database.collection(this.tableName)

      const collection = await collections.findOne(query, options)
      return collection
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close()
    }
  }
  public async find(query: object, options: object = {}) {
    try {
      const database = this.client.db(this.DB_DATABASE)
      const collections = database.collection(this.tableName)

      const collection = await collections.find(query, options)
      if ((await collections.countDocuments(query)) === 0) {
        return 'No documents found!'
      }
      return collection
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close()
    }
  }

  public async insertOne(doc: object) {
    this.client = new MongoClient(process.env.DB_URL ?? 'localhost')
    try {
      const database = this.client.db(this.DB_DATABASE)
      const collections = database.collection(this.tableName)
      // create a document to insert
      const collection = await collections.insertOne(doc)

      return `A document was inserted with the _id: ${collection.insertedId}`
    } finally {
      await this.client.close()
    }
  }
  public async insertMany(docs: object[]) {
    try {
      const database = this.client.db(this.DB_DATABASE)
      const collections = database.collection(this.tableName)
      // create many document to insert
      const collection = await collections.insertMany(docs)
      return `${collection.insertedCount} documents were inserted`
    } finally {
      await this.client.close()
    }
  }
  public async updateOne(filter: object, doc: object[], options: object = {}) {
    try {
      const database = this.client.db(this.DB_DATABASE)
      const collections = database.collection(this.tableName)
      // update a document to insert
      const collection = await collections.updateOne(filter, doc, options)
      return `${collection.matchedCount} document(s) matched the filter, updated ${collection.modifiedCount} document(s)`
    } finally {
      await this.client.close()
    }
  }
  public async updateMany(filter: object, doc: object[], options: object = {}) {
    try {
      const database = this.client.db(this.DB_DATABASE)
      const collections = database.collection(this.tableName)
      // update many document to insert
      const collection = await collections.updateMany(filter, doc, options)
      return `Successfully Updated ${collection.modifiedCount} documents`
    } finally {
      await this.client.close()
    }
  }
  public async replaceOne(filter: object, doc: object[], options: object = {}) {
    try {
      const database = this.client.db(this.DB_DATABASE)
      const collections = database.collection(this.tableName)
      // preplace a document to insert
      const collection = await collections.replaceOne(filter, doc, options)
      return `Modified ${collection.modifiedCount} document(s)`
    } finally {
      await this.client.close()
    }
  }
  public async deleteOne(doc: object) {
    try {
      const database = this.client.db(this.DB_DATABASE)
      const collections = database.collection(this.tableName)
      // delete a document to insert
      const collection = await collections.deleteOne(doc)
      if (collection.deletedCount === 1) {
        return 'Successfully deleted one document.'
      } else {
        return 'No documents matched the query. Deleted 0 documents.'
      }
    } finally {
      await this.client.close()
    }
  }
  public async deleteMany(doc: object) {
    try {
      const database = this.client.db(this.DB_DATABASE)
      const collections = database.collection(this.tableName)
      // delete many document to insert
      const collection = await collections.deleteMany(doc)
      return `Successfully deleted ${collection.deletedCount} document.`
    } finally {
      await this.client.close()
    }
  }
}
export let DB = MONGODB
