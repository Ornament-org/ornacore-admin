// Mirrors the `transitions` map in the backend's order.controller.js — kept
// as display/gating metadata only, the backend remains the source of truth
// for which transitions are actually legal.
export const ORDER_TRANSITIONS = {
  REQUESTED: ["PRICE_CONFIRMED", "CONFIRMED", "CANCELLED"],
  PRICE_CONFIRMED: ["CONFIRMED"],
  CONFIRMED: ["PACKED"],
  PACKED: ["DISPATCHED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
