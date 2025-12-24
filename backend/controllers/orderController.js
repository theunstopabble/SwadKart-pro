const Order = require("../models/orderModel");

// =================================================================
// 🛒 ORDER CREATION & FETCHING
// =================================================================

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
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
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("deliveryPartner", "name phone");

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
};

// =================================================================
// 🚚 STATUS UPDATES & ASSIGNMENT
// =================================================================

// @desc    Update order to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private
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

// @desc    Update order to delivered (Used by Delivery Partner)
// @route   PUT /api/v1/orders/:id/deliver
// @access  Private (Admin/Delivery)
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

// @desc    Assign Delivery Partner
// @route   PUT /api/v1/orders/:id/assign
// @access  Private (Admin Only)
const assignDeliveryPartner = async (req, res) => {
  // 👇 FIX: Use 'deliveryPartnerId' to match Frontend
  const { deliveryPartnerId } = req.body;

  const order = await Order.findById(req.params.id);

  if (order) {
    order.deliveryPartner = deliveryPartnerId;

    // Optional: Agar partner assign ho gaya, toh status update kar sakte hain
    // order.orderStatus = "Out for Delivery";

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

// =================================================================
// 👑 ADMIN & PARTNER ROUTES
// =================================================================

// @desc    Get All Orders (Admin Only)
// @route   GET /api/v1/orders/admin/all
// @access  Private (Admin)
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

// @desc    Get All Orders (Generic - for flexibility)
const getOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name")
    .populate("deliveryPartner", "name")
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get orders assigned to logged in Delivery Partner
// @route   GET /api/v1/orders/my-deliveries
// @access  Private (Delivery Partner)
const getMyDeliveryOrders = async (req, res) => {
  try {
    // Find orders where 'deliveryPartner' matches the logged-in user's ID
    const orders = await Order.find({ deliveryPartner: req.user._id })
      .populate("user", "name email phone") // User info for delivery contact
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
  assignDeliveryPartner, // 👈 Exported for Route
  getMyDeliveryOrders, // 👈 Exported for Route
};
