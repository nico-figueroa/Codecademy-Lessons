const express = require("express");
const router = express.Router();
const supabase = require("../provider/supabase");

// --------------------------------------------------
// GET ALL STARRED RESTAURANTS (JOIN WITH RESTAURANTS)
// --------------------------------------------------
router.get("/", async (req, res) => {
  const { data: starred, error } = await supabase
    .from("starred_restaurants")
    .select("id, comment, restaurantId");

  if (error) return res.status(500).json({ error: error.message });

  // Fetch restaurant names
  const { data: restaurants, error: restError } = await supabase
    .from("restaurants")
    .select("id, name");

  if (restError) return res.status(500).json({ error: restError.message });

  // Join manually (same as your in-memory logic)
  const joined = starred.map((s) => {
    const restaurant = restaurants.find((r) => r.id === s.restaurantId);
    return {
      id: s.id,
      comment: s.comment,
      name: restaurant ? restaurant.name : "Unknown Restaurant",
    };
  });

  res.json(joined);
});

// --------------------------------------------------
// GET ONE STARRED RESTAURANT
// --------------------------------------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data: starred, error } = await supabase
    .from("starred_restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !starred) return res.sendStatus(404);

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", starred.restaurantId)
    .single();

  res.json({
    id: starred.id,
    comment: starred.comment,
    name: restaurant ? restaurant.name : "Unknown Restaurant",
  });
});

// --------------------------------------------------
// ADD NEW STARRED RESTAURANT
// --------------------------------------------------
router.post("/", async (req, res) => {
  const { restaurantId, comment } = req.body;

  if (!restaurantId)
    return res.status(400).json({ error: "restaurantId is required" });

  // Insert into Supabase
  const { data: newStarred, error } = await supabase
    .from("starred_restaurants")
    .insert([{ restaurantId, comment }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Fetch restaurant name
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", restaurantId)
    .single();

  res.json({
    id: newStarred.id,
    comment: newStarred.comment,
    name: restaurant ? restaurant.name : "Unknown Restaurant",
  });
});

// --------------------------------------------------
// DELETE STARRED RESTAURANT
// --------------------------------------------------
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("starred_restaurants")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return res.sendStatus(404);

  res.sendStatus(200);
});

// --------------------------------------------------
// UPDATE STARRED RESTAURANT COMMENT
// --------------------------------------------------
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { newComment } = req.body;

  const { data, error } = await supabase
    .from("starred_restaurants")
    .update({ comment: newComment })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return res.sendStatus(404);

  res.json(data);
});

module.exports = { router };
