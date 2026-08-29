export const schoolPostAgeWarning = (createdAt: string, expiresAt?: string | null) => {
  if (expiresAt) return "";
  const created = new Date(createdAt);
  const now = new Date();
  const threshold = (years: number, months = 0) => {
    const value = new Date(now);
    value.setFullYear(value.getFullYear() - years);
    value.setMonth(value.getMonth() - months);
    return value;
  };
  if (created <= threshold(2)) return "2年前の投稿です。古い情報の可能性があります";
  if (created <= threshold(1)) return "1年前の投稿です。古い情報の可能性があります";
  if (created <= threshold(0, 6)) return "半年前の投稿です。古い情報の可能性があります";
  return "";
};

export const isExpiredSchoolPost = (expiresAt?: string | null) =>
  Boolean(expiresAt && new Date(expiresAt) < new Date());
