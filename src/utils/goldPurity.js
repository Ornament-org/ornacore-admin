const roundedKarat = (value) => Number((value * 24 * 0.01).toFixed(2));

export const calculateMetalPurityFromTunch = (value) => {
  if (value === "" || value === null || value === undefined) {
    return { karat: "", purity: "" };
  }

  const tunch = Number(value);
  if (!Number.isFinite(tunch) || tunch < 0 || tunch > 100) {
    return { karat: "", purity: "" };
  }

  const karat = roundedKarat(tunch);
  return {
    karat: String(karat),
    purity: `${karat}K`,
  };
};
