// scheduleEngine.js
// Upgraded deterministic schedule generator with override replacement,
// frequency support, timezone normalization, and sorted output.

export function buildSchedule(items, overrides, from, to) {
  // Normalize date range
  const start = new Date(from);
  const end = new Date(to);

  // Convert overrides into a lookup map: { "YYYY-MM-DD_itemId_time": override }
  const overrideMap = {};
  overrides.forEach(o => {
    const dateStr = normalizeDate(o.date);
    const key = `${dateStr}_${o.item_id}_${o.time}`;
    overrideMap[key] = {
      item_id: o.item_id,
      name: null, // will be filled later
      date: dateStr,
      time: o.time,
      dosage: o.dosage,
      source: "override",
      notes: o.notes || null
    };
  });

  const schedule = [];

  // Iterate through each day in the range
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = normalizeDate(d);

    items.forEach(item => {
      const times = resolveTimes(item);

      // Frequency logic (MVP: daily or weekly)
      if (!shouldScheduleToday(item.frequency, d)) return;

      times.forEach(time => {
        const key = `${dateStr}_${item.id}_${time}`;

        if (overrideMap[key]) {
          // Override replaces proposal
          schedule.push({
            ...overrideMap[key],
            name: item.name // fill name now
          });
        } else {
          // Proposal entry
          schedule.push({
            item_id: item.id,
            name: item.name,
            date: dateStr,
            time,
            dosage: item.dosage_per_intake,
            source: "proposal"
          });
        }
      });
    });
  }

  // Sort schedule by date + time
  schedule.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    if (da.getTime() !== db.getTime()) return da - db;
    return timeOrder(a.time) - timeOrder(b.time);
  });

  return schedule;
}

/* -----------------------------
   Helper Functions
------------------------------*/

// Normalize date to YYYY-MM-DD
function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  return d.toISOString().split("T")[0];
}

// Default times if none provided
function resolveTimes(item) {
  if (item.times_of_day && item.times_of_day.length > 0) {
    return item.times_of_day;
  }
  // Default rule: morning
  return ["morning"];
}

// Frequency logic
function shouldScheduleToday(frequency, dateObj) {
  if (!frequency || frequency === "daily") return true;

  if (frequency === "weekly") {
    // Weekly rule: schedule only on the same weekday as the start date
    // (You can customize this later)
    return dateObj.getDay() === 1; // Monday example
  }

  // Future: custom frequencies
  return true;
}

// Time sorting order
function timeOrder(time) {
  const order = {
    morning: 1,
    afternoon: 2,
    evening: 3,
    night: 4
  };
  return order[time] || 99;
}