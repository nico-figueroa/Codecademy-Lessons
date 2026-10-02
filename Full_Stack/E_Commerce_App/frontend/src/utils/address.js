// Shared helpers for the delivery address form.
export const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

export function addressFromProfile(user) {
  const a = user?.address || {};
  return {
    name: user?.name || "",
    phone: user?.phone || "",
    line1: a.line1 || "",
    line2: a.line2 || "",
    city: a.city || "",
    state: a.state || "",
    postalCode: a.postalCode || "",
    country: a.country || "US",
  };
}

// Drops blank optional fields so the backend validation accepts the payload.
export function cleanAddress(address) {
  return Object.fromEntries(
    Object.entries(address).filter(([, v]) => String(v).trim() !== ""),
  );
}
