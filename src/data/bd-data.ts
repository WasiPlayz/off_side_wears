export const districts = [
  "Dhaka", "Chattogram", "Cumilla", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh",
  "Bagerhat", "Bandarban", "Barguna", "Bhola", "Bogra", "Brahmanbaria", "Chandpur", "Chapainawabganj",
  "Chuadanga", "Cox's Bazar", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
  "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachari", "Kishoreganj",
  "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Maulvibazar",
  "Meherpur", "Munshiganj", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona",
  "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rangamati",
  "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Tangail", "Thakurgaon"
].sort();

export const thanas: Record<string, string[]> = {
  "Dhaka": ["Adabor", "Badda", "Bangsal", "Cantonment", "Chak Bazar", "Dakshinkhan", "Darus Salam", "Dhanmondi", "Demra", "Dhamrai", "Dohar", "Gendaria", "Gulshan", "Hazaribagh", "Jatrabari", "Kadamtali", "Kafrul", "Kalabagan", "Kamrangirchar", "Keraniganj", "Khilgaon", "Khilkhet", "Kotwali", "Lalbagh", "Mirpur", "Mohammadpur", "Motijheel", "Mughda", "Nawabganj", "New Market", "Pallabi", "Paltan", "Ramna", "Rampura", "Sabujbagh", "Savar", "Shah Ali", "Shahbagh", "Sher-e-Bangla Nagar", "Shyampur", "Sutrapur", "Tejgaon", "Turag", "Uttara", "Uttarkhan"],
  "Mymensingh": ["Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Mymensingh Sadar", "Muktagacha", "Nandail", "Phulpur", "Trishal", "Tara Khanda"],
  "Chattogram": ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda", "Panchlaish", "Double Mooring", "Kotwali", "Bandar", "Chawkbazar"],
  "Sylhet": ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshin Surma", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmani Nagar", "Sylhet Sadar", "Zakiganj"],
  "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Tongi"],
  "Narayanganj": ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon", "Fatullah", "Siddhirganj"],
  // Default for others to avoid crashes
};
