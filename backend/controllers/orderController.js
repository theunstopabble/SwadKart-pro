import Order from "../models/orderModel.js";

// =================================================================
// 🛒 ORDER CREATION & FETCHING
// =================================================================

// @desc    Create new order
export const addOrderItems = async (req, res) => {
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
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product,
        _id: undefined,
      })),
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
export const getOrderById = async (req, res) => {
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

// @desc    Get logged in user orders
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
};

// =================================================================
// 🚚 STATUS UPDATES & REAL-TIME SOCKETS ⚡
// =================================================================

// @desc    Update order status (General: Cooking, On Way, etc.)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.orderStatus = status;

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // 🔥 SOCKET: Specific Order Room mein update bhejo
    req.io.to(order._id.toString()).emit("orderUpdated", updatedOrder);
    // Backup: Global update (agar room join nahi kiya tab bhi dikhe)
    req.io.emit("globalOrderUpdate", updatedOrder);

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

// @desc    Update order to paid
export const updateOrderToPaid = async (req, res) => {
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
    req.io.to(order._id.toString()).emit("orderUpdated", updatedOrder);

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

// @desc    Update order to delivered
export const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = "Delivered";

    const updatedOrder = await order.save();
    req.io.to(order._id.toString()).emit("orderUpdated", updatedOrder);

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

// @desc    Assign Delivery Partner
export const assignDeliveryPartner = async (req, res) => {
  const { deliveryPartnerId } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.deliveryPartner = deliveryPartnerId;
    order.orderStatus = "Out for Delivery";

    const updatedOrder = await order.save();
    req.io.to(order._id.toString()).emit("orderUpdated", updatedOrder);

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

// =================================================================
// 👑 ADMIN & PARTNER ROUTES
// =================================================================

export const getAllOrdersAdmin = async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name")
    .populate("deliveryPartner", "name")
    .sort({ createdAt: -1 });
  res.json(orders);
};

export const getOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name")
    .populate("deliveryPartner", "name")
    .sort({ createdAt: -1 });
  res.json(orders);
};

export const getMyDeliveryOrders = async (req, res) => {
  const orders = await Order.find({ deliveryPartner: req.user._id })
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });
  res.json(orders);
};
