export const COUNTRY = "Pakistan";

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
];

// Suggestions only: customers can still type any town.
export const CITIES = {
  Punjab: [
    "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura",
    "Jhang", "Rahim Yar Khan", "Gujrat", "Kasur", "Sahiwal", "Okara", "Wah Cantt", "Dera Ghazi Khan", "Chiniot",
    "Kamoke", "Sadiqabad", "Burewala", "Jhelum", "Khanewal", "Hafizabad", "Muzaffargarh", "Mandi Bahauddin", "Attock",
  ],
  Sindh: [
    "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", "Jacobabad", "Shikarpur", "Khairpur",
    "Dadu", "Thatta", "Badin", "Tando Adam", "Tando Allahyar", "Umerkot", "Sanghar",
  ],
  "Khyber Pakhtunkhwa": [
    "Peshawar", "Mardan", "Abbottabad", "Mingora", "Kohat", "Dera Ismail Khan", "Swabi", "Nowshera", "Charsadda",
    "Mansehra", "Bannu", "Haripur", "Chitral",
  ],
  Balochistan: ["Quetta", "Turbat", "Khuzdar", "Hub", "Chaman", "Gwadar", "Sibi", "Zhob", "Loralai"],
  "Islamabad Capital Territory": ["Islamabad"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu", "Hunza", "Ghanche"],
  "Azad Jammu & Kashmir": ["Muzaffarabad", "Mirpur", "Kotli", "Bhimber", "Rawalakot", "Bagh"],
};

// Accepts 03XXXXXXXXX, 3XXXXXXXXX, 923XXXXXXXXX or +92 3XX XXXXXXX (spaces/dashes ignored).
export function normalizePkPhone(input) {
  const digits = String(input || "").replace(/[^\d]/g, "");
  let local = null;
  if (/^03\d{9}$/.test(digits)) local = digits.slice(1);
  else if (/^3\d{9}$/.test(digits)) local = digits;
  else if (/^923\d{9}$/.test(digits)) local = digits.slice(2);
  return local ? `+92${local}` : null;
}

export const formatPkPhone = (phone) => {
  const n = normalizePkPhone(phone);
  return n ? `+92 ${n.slice(3, 6)} ${n.slice(6)}` : phone || "";
};

export const whatsappLink = (phone, text = "") => {
  const n = normalizePkPhone(phone);
  return n ? `https://wa.me/${n.slice(1)}${text ? `?text=${encodeURIComponent(text)}` : ""}` : null;
};
