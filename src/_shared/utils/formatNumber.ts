export const formatNumber = (v: any) => {
  if (v === null || v === undefined) return "";
  const num = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
  if (!isFinite(num)) return v; // 숫자로 변환 불가 시 원본 반환
  return num.toLocaleString();
};
