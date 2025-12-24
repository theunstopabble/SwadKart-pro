const Order = require("../models/orderModel");

// @desc    Create new order
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
};

// @desc    Get order by ID
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("deliveryPartner", "name phone");

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

// @desc    Update order to paid
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

// @desc    Update order to delivered
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

// @desc    Get logged in user orders
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
};

// @desc    Assign Delivery Partner
const assignDeliveryPartner = async (req, res) => {
  const { partnerId } = req.body;
  const order = await Order.findById(req.params.id);
  if (order) {
    order.deliveryPartner = partnerId;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

// @desc    Get All Orders (Admin Only)
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "id name")
      .populate("deliveryPartner", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Owner Orders (Existing Logic)
const getOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name")
    .populate("deliveryPartner", "name")
    .sort({ createdAt: -1 });
  res.json(orders);
};

// 👇 NEW FUNCTION: Delivery Partner ke liye Orders
// @desc    Get orders assigned to logged in Delivery Partner
// @route   GET /api/v1/orders/my-deliveries
const getMyDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.user._id })
      .populate("user", "name phone address") // User details bhi chahiye delivery ke liye
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  getAllOrdersAdmin,
  assignDeliveryPartner,
  getMyDeliveryOrders, // 👈 Export Added
};
