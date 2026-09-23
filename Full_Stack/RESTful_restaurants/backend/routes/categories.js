const express = require("express");
const router = express.Router();
const supabase = require("../provider/supabase");

// -----------------------------
// GET ALL CATEGORIES
// -----------------------------
router.get("/", async (req, res) => {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Fetch assignments
  const { data: assignments, error: assignError } = await supabase
    .from("category_restaurants")
    .select("*");

  if (assignError) return res.status(500).json({ error: assignError.message });

  // Attach restaurantIds to each category
  const categoriesWithRestaurants = categories.map((cat) => ({
    ...cat,
    restaurantIds: assignments
      .filter((a) => a.category_id === cat.id)
      .map((a) => a.restaurant_id),
  }));

  res.json(categoriesWithRestaurants);
});

// -----------------------------
// GET CATEGORY BY ID
// -----------------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data: category, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !category)
    return res.status(404).json({ error: "Category not found" });

  const { data: assignments } = await supabase
    .from("category_restaurants")
    .select("restaurant_id")
    .eq("category_id", id);

  res.json({
    ...category,
    restaurantIds: assignments.map((a) => a.restaurant_id),
  });
});

// -----------------------------
// CREATE CATEGORY
// -----------------------------
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Name is required" });

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ ...data, restaurantIds: [] });
});

// -----------------------------
// UPDATE CATEGORY NAME
// -----------------------------
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Name is required" });

  const { data, error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    return res.status(404).json({ error: "Category not found" });

  res.json(data);
});

// -----------------------------
// DELETE CATEGORY
// -----------------------------
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Delete assignments first (FK cascade also works)
  await supabase.from("category_restaurants").delete().eq("category_id", id);

  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    return res.status(404).json({ error: "Category not found" });

  res.json(data);
});

// -----------------------------
// ASSIGN RESTAURANT TO CATEGORY
// -----------------------------
router.post("/:id/assign", async (req, res) => {
  const { id: categoryId } = req.params;
  const { restaurantId } = req.body;

  if (!restaurantId)
    return res.status(400).json({ error: "restaurantId is required" });

  // Remove restaurant from any previous category
  await supabase
    .from("category_restaurants")
    .delete()
    .eq("restaurant_id", restaurantId);

  // Insert new assignment
  const { error } = await supabase
    .from("category_restaurants")
    .insert([{ category_id: categoryId, restaurant_id: restaurantId }]);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    message: "Restaurant assigned to category",
    categoryId,
    restaurantId,
  });
});

// -----------------------------
// REMOVE RESTAURANT FROM CATEGORY
// -----------------------------
router.post("/:id/remove", async (req, res) => {
  const { id: categoryId } = req.params;
  const { restaurantId } = req.body;

  if (!restaurantId)
    return res.status(400).json({ error: "restaurantId is required" });

  const { error } = await supabase
    .from("category_restaurants")
    .delete()
    .eq("category_id", categoryId)
    .eq("restaurant_id", restaurantId);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    message: "Restaurant removed from category",
    categoryId,
    restaurantId,
  });
});

module.exports = { router };
