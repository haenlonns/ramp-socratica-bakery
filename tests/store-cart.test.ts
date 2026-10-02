import assert from "node:assert/strict";
import test from "node:test";
import { applyCartChange, cartTotals, parseCart, PER_TEAM_LIMIT, serializeCart } from "../src/lib/store/cart";

test("adding accumulates and removing decrements", () => {
  let lines = applyCartChange([], { type: "add", productId: "granola" });
  lines = applyCartChange(lines, { type: "add", productId: "granola", quantity: 2 });
  assert.deepEqual(lines, [{ productId: "granola", quantity: 3 }]);
  lines = applyCartChange(lines, { type: "remove", productId: "granola" });
  assert.deepEqual(lines, [{ productId: "granola", quantity: 2 }]);
});

test("removing the last one drops the line entirely", () => {
  const lines = applyCartChange([{ productId: "granola", quantity: 1 }], { type: "remove", productId: "granola" });
  assert.deepEqual(lines, []);
});

test("unknown products are never added", () => {
  assert.deepEqual(applyCartChange([], { type: "add", productId: "ghost" }), []);
});

test("a stale cookie cannot resurrect a removed product", () => {
  const raw = JSON.stringify([{ p: "granola", q: 2 }, { p: "ghost", q: 9 }]);
  assert.deepEqual(parseCart(raw), [{ productId: "granola", quantity: 2 }]);
});

test("malformed cookies degrade to an empty cart", () => {
  assert.deepEqual(parseCart(undefined), []);
  assert.deepEqual(parseCart("not json"), []);
  assert.deepEqual(parseCart('{"not":"an array"}'), []);
  assert.deepEqual(parseCart('[{"p":"granola","q":0}]'), []);
  assert.deepEqual(parseCart('[{"p":"granola","q":"two"}]'), []);
});

test("totals are priced from the catalogue", () => {
  // granola 1500, trail mix 1300
  const { count, totalCents } = cartTotals([
    { productId: "granola", quantity: 2 },
    { productId: "trail-mix", quantity: 1 },
  ]);
  assert.equal(count, 3);
  assert.equal(totalCents, 1500 * 2 + 1300);
});

test("the cookie round-trips", () => {
  const lines = [{ productId: "granola", quantity: 2 }, { productId: "yogurt", quantity: 1 }];
  assert.deepEqual(parseCart(serializeCart(lines)), lines);
});

test("add never exceeds the per-team limit", () => {
  let lines = applyCartChange([], { type: "add", productId: "granola", quantity: 3 });
  lines = applyCartChange(lines, { type: "add", productId: "granola", quantity: 3 });
  assert.equal(lines[0].quantity, PER_TEAM_LIMIT);
  lines = applyCartChange(lines, { type: "add", productId: "granola" });
  assert.equal(lines[0].quantity, PER_TEAM_LIMIT);
});

test("set replaces the quantity, clamps to the limit, and 0 removes", () => {
  let lines = applyCartChange([], { type: "set", productId: "granola", quantity: 2 });
  assert.deepEqual(lines, [{ productId: "granola", quantity: 2 }]);
  lines = applyCartChange(lines, { type: "set", productId: "granola", quantity: 1 });
  assert.equal(lines[0].quantity, 1);
  lines = applyCartChange(lines, { type: "set", productId: "granola", quantity: 99 });
  assert.equal(lines[0].quantity, PER_TEAM_LIMIT);
  lines = applyCartChange(lines, { type: "set", productId: "granola", quantity: 0 });
  assert.deepEqual(lines, []);
});

test("a stale cookie is only held to a sanity ceiling on read", () => {
  const lines = parseCart(JSON.stringify([{ p: "granola", q: 5000 }]));
  assert.equal(lines[0].quantity, 99);
});

test("per-product limits (team limit or low stock) cap add and set", () => {
  const ids = new Set(["granola", "honey"]);
  const limits = new Map([["granola", 2], ["honey", 1]]);
  let lines = applyCartChange([], { type: "add", productId: "granola", quantity: 5 }, ids, limits);
  assert.equal(lines[0].quantity, 2);
  lines = applyCartChange(lines, { type: "set", productId: "granola", quantity: 9 }, ids, limits);
  assert.equal(lines[0].quantity, 2);
  lines = applyCartChange(lines, { type: "add", productId: "honey", quantity: 3 }, ids, limits);
  assert.equal(lines.find((line) => line.productId === "honey")?.quantity, 1);
});
