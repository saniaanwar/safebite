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
    // Treat search text as literal characters.
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

      // Summarize each restaurant and count its history.
      {
        $group: {
          _id: "$restaurantId",
          restaurantName: { $first: "$restaurantName" },
          neighborhood: { $first: "$neighborhood" },
          latestInspectionDate: { $first: "$inspectionDate" },
          latestResult: { $first: "$result" },
          inspectionCount: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          restaurantId: "$_id",
          restaurantName: 1,
          neighborhood: 1,
          latestInspectionDate: 1,
          latestResult: 1,
          inspectionCount: 1,
        },
      },

      // Filter using each restaurant's latest result.
      { $match: matches },
      { $sort: { restaurantName: 1, restaurantId: 1 } },

      {
        $facet: {
          restaurants: [
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
            { $project: { inspectionCount: 0 } },
          ],
          metadata: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                inspectionCount: { $sum: "$inspectionCount" },
                latestPassCount: {
                  $sum: {
                    $cond: [{ $eq: ["$latestResult", "pass"] }, 1, 0],
                  },
                },
                latestFailCount: {
                  $sum: {
                    $cond: [{ $eq: ["$latestResult", "fail"] }, 1, 0],
                  },
                },
              },
            },
          ],
        },
      },
    ])
    .toArray();

  const metadata = data?.metadata?.[0];
  const total = metadata?.total ?? 0;

  return {
    restaurants: data?.restaurants ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    summary: {
      inspectionCount: metadata?.inspectionCount ?? 0,
      latestPassCount: metadata?.latestPassCount ?? 0,
      latestFailCount: metadata?.latestFailCount ?? 0,
    },
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
