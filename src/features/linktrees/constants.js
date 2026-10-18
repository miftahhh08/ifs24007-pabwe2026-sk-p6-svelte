export const TYPE_LABELS = {
  public: "Publik",
  unlisted: "Tidak terdaftar",
  private: "Privat",
};

export const TYPE_STYLES = {
  public: "bg-emerald-50 text-emerald-700",
  unlisted: "bg-amber-50 text-amber-700",
  private: "bg-slate-100 text-slate-600",
};

// Satu-satunya tempat yang menentukan "milik saya".
// Bila API memakai nama field lain, cukup ubah di sini.
export function isOwner(linkTree, profile) {
  return Boolean(profile) && linkTree.user_id === profile.id;
}
