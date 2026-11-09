import { db } from "./connection.js";

export async function listRestaurants({
  name = "",
  neighborhood = "",
  result = "",
  page = 1,
  pageSize = 10,
} = {}) {
  const matches = {};

  if (name) {
    // Treat search text as literal characters, not a regular expression.
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    matches.restaurantName = {
      $regex: escapedName,
      $options: "i",
    };
  }

  if (neighborhood) {
    matches.neighborhood = neighborhood;
  }

  if (result) {
    matches.latestResult = result;
  }

  const [data] = await db
    .collection("inspections")
    .aggregate([
      { $match: { isSynthetic: true } },

      // Put each restaurant's newest inspection first.
      {
        $sort: {
          restaurantId: 1,
          inspectionDate: -1,
          _id: -1,
        },
      },

      // Produce one summary per restaurant.
      {
        $group: {
          _id: "$restaurantId",
          restaurantName: { $first: "$restaurantName" },
          neighborhood: { $first: "$neighborhood" },
          latestInspectionDate: { $first: "$inspectionDate" },
          latestResult: { $first: "$result" },
        },
      },

      // Match the field names expected by RestaurantResults.
      {
        $project: {
          _id: 0,
          restaurantId: "$_id",
          restaurantName: 1,
          neighborhood: 1,
          latestInspectionDate: 1,
          latestResult: 1,
        },
      },

      // Apply filters after selecting the latest inspection.
      { $match: matches },
      { $sort: { restaurantName: 1, restaurantId: 1 } },

      {
        $facet: {
          restaurants: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
          metadata: [{ $count: "total" }],
        },
      },
    ])
    .toArray();

  const total = data?.metadata?.[0]?.total ?? 0;

  return {
    restaurants: data?.restaurants ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getRestaurantDetails(restaurantId) {
  const records = await db
    .collection("inspections")
    .find({ restaurantId, isSynthetic: true })
    .sort({ inspectionDate: -1, _id: -1 })
    .toArray();

  if (records.length === 0) {
    return null;
  }

  // Use the newest inspection for the restaurant's details.
  const latest = records[0];

  return {
    restaurant: {
      restaurantId: latest.restaurantId,
      restaurantName: latest.restaurantName,
      neighborhood: latest.neighborhood,
      address: latest.address,
      isSynthetic: latest.isSynthetic,
    },
    inspections: records.map(({ inspectionDate, result, violations }) => ({
      inspectionDate,
      result,
      violations,
    })),
  };
}
