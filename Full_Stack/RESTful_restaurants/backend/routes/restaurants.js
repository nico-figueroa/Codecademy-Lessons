const express = require("express");
const router = express.Router();
const supabase = require("../provider/supabase");

// GET ALL RESTAURANTS
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("name", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// GET RESTAURANT BY ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return res.sendStatus(404);

  res.json(data);
});

// CREATE RESTAURANT
router.post("/", async (req, res) => {
  const { name } = req.body;

  const { data, error } = await supabase
    .from("restaurants")
    .insert([{ name }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// DELETE RESTAURANT
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await supabase.from("category_restaurants").delete().eq("restaurant_id", id);

  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", id);

  if (error) return res.sendStatus(404);

  res.sendStatus(200);
});

// UPDATE RESTAURANT NAME
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;

  const { error } = await supabase
    .from("restaurants")
    .update({ name: newName })
    .eq("id", id);

  if (error) return res.sendStatus(404);

  res.sendStatus(200);
});

module.exports = { router };
