// Thin Shippo REST client (test mode keys start with `shippo_test_`).
// Exported as a mutable object so tests can stub `createLabel`.
// When SHIPPO_API_KEY is not configured, a simulated shipment is produced so
// the admin workflow still works end to end.
const API = "https://api.goshippo.com";

function fromAddress() {
  const e = process.env;
  return {
    name: e.SHIP_FROM_NAME || "Nomadant Tech Store",
    street1: e.SHIP_FROM_STREET1 || "215 Clayton St.",
    city: e.SHIP_FROM_CITY || "San Francisco",
    state: e.SHIP_FROM_STATE || "CA",
    zip: e.SHIP_FROM_ZIP || "94117",
    country: e.SHIP_FROM_COUNTRY || "US",
    phone: e.SHIP_FROM_PHONE || "+14155550100",
    email: e.SHIP_FROM_EMAIL || "shipping@nomadant.example",
  };
}

async function call(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Shippo ${path} failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

const shippoClient = {
  isConfigured() {
    return Boolean(process.env.SHIPPO_API_KEY);
  },

  // address: { name, phone, line1, line2, city, state, postalCode, country }
  async createLabel(address) {
    if (!this.isConfigured()) {
      const tracking = `SIM${Date.now()}`;
      return {
        provider: "simulated",
        carrier: "Simulated Carrier",
        service: "Ground",
        trackingNumber: tracking,
        trackingUrl: null,
        labelUrl: null,
        providerShipmentId: null,
        providerTransactionId: null,
      };
    }

    const shipment = await call("/shipments/", {
      address_from: fromAddress(),
      address_to: {
        name: address.name,
        street1: address.line1,
        street2: address.line2 || "",
        city: address.city,
        state: address.state,
        zip: address.postalCode,
        country: address.country,
        phone: address.phone || "",
      },
      parcels: [
        {
          length: "10",
          width: "8",
          height: "4",
          distance_unit: "in",
          weight: "2",
          mass_unit: "lb",
        },
      ],
      async: false,
    });

    const rates = (shipment.rates || []).filter((r) => r.amount);
    if (rates.length === 0) throw new Error("Shippo returned no rates");
    rates.sort((a, b) => Number(a.amount) - Number(b.amount));

    // Try rates cheapest-first; skip carriers that aren't activated on the account
    let rate;
    let tx;
    let lastError;
    for (const candidate of rates) {
      const attempt = await call("/transactions/", {
        rate: candidate.object_id,
        label_file_type: "PDF",
        async: false,
      });
      if (attempt.status === "SUCCESS") {
        rate = candidate;
        tx = attempt;
        break;
      }
      lastError = `Shippo label failed (${candidate.provider}): ${JSON.stringify(attempt.messages)}`;
    }
    if (!tx) throw new Error(lastError);

    return {
      provider: "shippo",
      carrier: rate.provider,
      service: rate.servicelevel?.name ?? null,
      trackingNumber: tx.tracking_number,
      trackingUrl: tx.tracking_url_provider,
      labelUrl: tx.label_url,
      providerShipmentId: shipment.object_id,
      providerTransactionId: tx.object_id,
    };
  },
};

export default shippoClient;
