export const RATE_UNITS = [
  { value: "PER_10G", label: "Per 10 gm (Gold)", short: "/10gm", multiplier: 10 },
  { value: "PER_KG",  label: "Per kg (Silver)",  short: "/kg",   multiplier: 1000 },
  { value: "PER_G",   label: "Per gm (Diamond)", short: "/gm",   multiplier: 1 },
];

export const getRateUnitMeta = (rateUnit) =>
  RATE_UNITS.find((u) => u.value === rateUnit) ?? RATE_UNITS[0];

export const rateUnitShort = (rateUnit) => getRateUnitMeta(rateUnit).short;
export const rateUnitMultiplier = (rateUnit) => getRateUnitMeta(rateUnit).multiplier;
