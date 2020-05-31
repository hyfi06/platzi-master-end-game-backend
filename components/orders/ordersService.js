const MongoLib = require('../../lib/mongo');
const { ObjectId } = require('mongodb');
const { config } = require('../../config');
const OrdersModel = require('../../utils/schema/ordersSchema');
const validationModelHandler = require('../../utils/middleware/validationModelHandler');
const boom = require('@hapi/boom');

class OrdersService {
  constructor() {
    this.collection = config.dbCollections.orders;
    this.mongoDB = new MongoLib();
  }

  /**
   * Create a new Order
   * @param {Object} order data of order
   * @returns {string} id of new order
   */
  async createOrder(order) {
    await validationModelHandler(order, OrdersModel);

    const createOrderId = await this.mongoDB.create(
      this.collection,
      new OrdersModel(order)
    );

    return createOrderId;
  }

  /**
   * Retrieve a order
   * @param {string} id id of order
   * @returns {Object} order information
   */
  async getOrder(id) {
    const order = await this.mongoDB.get(
      this.collection,
      id
    );

    if (!order) {
      throw boom.notFound('Test details could not be found');
    }

    return order;
  }

  /**
   * 
   * @param {Object} query query
   * @param {string} query.user user id
   * @param {Boolean} query.isComplete
   * @returns {Object[]}
   */
  async getOrders({ patient, isComplete }) {
    const query = {};
    if (typeof isComplete !== 'undefined' && patient) {
      query['$and'] = [
        { isComplete: isComplete },
        { patientId: ObjectId(patient) },
      ];
    } else if (patient) {
      query.patientId = ObjectId(patient);
    }

    const orders = await this.mongoDB.getAll(this.collection, query);

    if (orders.length == 0) {
      let complete ='';
      if(typeof isComplete !== 'undefined'){
        complete = isComplete ? ' completed': ' pending';
      }
      throw boom.notFound(`There isn't test${complete} for this patient`);
    }

    return orders;
  }
}

module.exports = OrdersService;
