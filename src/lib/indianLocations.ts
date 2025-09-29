// Indian States and Cities Data
export interface City {
  name: string;
  district?: string;
}

export interface State {
  name: string;
  cities: City[];
}

export const indianStatesAndCities: State[] = [
  {
    name: "Andhra Pradesh",
    cities: [
      { name: "Visakhapatnam", district: "Visakhapatnam" },
      { name: "Vijayawada", district: "Krishna" },
      { name: "Guntur", district: "Guntur" },
      { name: "Nellore", district: "Nellore" },
      { name: "Kurnool", district: "Kurnool" },
      { name: "Tirupati", district: "Chittoor" },
      { name: "Rajahmundry", district: "East Godavari" },
      { name: "Kadapa", district: "Kadapa" },
      { name: "Kakinada", district: "East Godavari" },
      { name: "Anantapur", district: "Anantapur" }
    ]
  },
  {
    name: "Arunachal Pradesh",
    cities: [
      { name: "Itanagar", district: "Papum Pare" },
      { name: "Naharlagun", district: "Papum Pare" },
      { name: "Pasighat", district: "East Siang" },
      { name: "Tezpur", district: "Sonitpur" },
      { name: "Bomdila", district: "West Kameng" }
    ]
  },
  {
    name: "Assam",
    cities: [
      { name: "Guwahati", district: "Kamrup" },
      { name: "Dibrugarh", district: "Dibrugarh" },
      { name: "Jorhat", district: "Jorhat" },
      { name: "Silchar", district: "Cachar" },
      { name: "Tezpur", district: "Sonitpur" },
      { name: "Nagaon", district: "Nagaon" },
      { name: "Tinsukia", district: "Tinsukia" },
      { name: "Bongaigaon", district: "Bongaigaon" }
    ]
  },
  {
    name: "Bihar",
    cities: [
      { name: "Patna", district: "Patna" },
      { name: "Gaya", district: "Gaya" },
      { name: "Bhagalpur", district: "Bhagalpur" },
      { name: "Muzaffarpur", district: "Muzaffarpur" },
      { name: "Bihar Sharif", district: "Nalanda" },
      { name: "Purnia", district: "Purnia" },
      { name: "Darbhanga", district: "Darbhanga" },
      { name: "Arrah", district: "Bhojpur" },
      { name: "Begusarai", district: "Begusarai" },
      { name: "Katihar", district: "Katihar" }
    ]
  },
  {
    name: "Chhattisgarh",
    cities: [
      { name: "Raipur", district: "Raipur" },
      { name: "Bhilai", district: "Durg" },
      { name: "Bilaspur", district: "Bilaspur" },
      { name: "Korba", district: "Korba" },
      { name: "Durg", district: "Durg" },
      { name: "Rajnandgaon", district: "Rajnandgaon" },
      { name: "Jagdalpur", district: "Bastar" },
      { name: "Raigarh", district: "Raigarh" }
    ]
  },
  {
    name: "Delhi",
    cities: [
      { name: "New Delhi", district: "New Delhi" },
      { name: "Delhi", district: "Central Delhi" },
      { name: "Dwarka", district: "South West Delhi" },
      { name: "Rohini", district: "North West Delhi" },
      { name: "Lajpat Nagar", district: "South Delhi" },
      { name: "Karol Bagh", district: "Central Delhi" },
      { name: "Janakpuri", district: "West Delhi" },
      { name: "Vasant Kunj", district: "South West Delhi" }
    ]
  },
  {
    name: "Goa",
    cities: [
      { name: "Panaji", district: "North Goa" },
      { name: "Margao", district: "South Goa" },
      { name: "Vasco da Gama", district: "South Goa" },
      { name: "Mapusa", district: "North Goa" },
      { name: "Ponda", district: "North Goa" }
    ]
  },
  {
    name: "Gujarat",
    cities: [
      { name: "Ahmedabad", district: "Ahmedabad" },
      { name: "Surat", district: "Surat" },
      { name: "Vadodara", district: "Vadodara" },
      { name: "Rajkot", district: "Rajkot" },
      { name: "Bhavnagar", district: "Bhavnagar" },
      { name: "Jamnagar", district: "Jamnagar" },
      { name: "Gandhinagar", district: "Gandhinagar" },
      { name: "Junagadh", district: "Junagadh" },
      { name: "Anand", district: "Anand" },
      { name: "Navsari", district: "Navsari" }
    ]
  },
  {
    name: "Haryana",
    cities: [
      { name: "Gurugram", district: "Gurugram" },
      { name: "Faridabad", district: "Faridabad" },
      { name: "Panipat", district: "Panipat" },
      { name: "Ambala", district: "Ambala" },
      { name: "Yamunanagar", district: "Yamunanagar" },
      { name: "Rohtak", district: "Rohtak" },
      { name: "Hisar", district: "Hisar" },
      { name: "Karnal", district: "Karnal" },
      { name: "Sonipat", district: "Sonipat" },
      { name: "Panchkula", district: "Panchkula" }
    ]
  },
  {
    name: "Himachal Pradesh",
    cities: [
      { name: "Shimla", district: "Shimla" },
      { name: "Dharamshala", district: "Kangra" },
      { name: "Solan", district: "Solan" },
      { name: "Mandi", district: "Mandi" },
      { name: "Palampur", district: "Kangra" },
      { name: "Baddi", district: "Solan" },
      { name: "Kullu", district: "Kullu" },
      { name: "Hamirpur", district: "Hamirpur" }
    ]
  },
  {
    name: "Jharkhand",
    cities: [
      { name: "Ranchi", district: "Ranchi" },
      { name: "Jamshedpur", district: "East Singhbhum" },
      { name: "Dhanbad", district: "Dhanbad" },
      { name: "Bokaro", district: "Bokaro" },
      { name: "Deoghar", district: "Deoghar" },
      { name: "Phusro", district: "Bokaro" },
      { name: "Hazaribagh", district: "Hazaribagh" },
      { name: "Giridih", district: "Giridih" }
    ]
  },
  {
    name: "Karnataka",
    cities: [
      { name: "Bangalore", district: "Bangalore Urban" },
      { name: "Mysore", district: "Mysuru" },
      { name: "Hubli", district: "Dharwad" },
      { name: "Mangalore", district: "Dakshina Kannada" },
      { name: "Belgaum", district: "Belgaum" },
      { name: "Gulbarga", district: "Kalaburagi" },
      { name: "Davanagere", district: "Davanagere" },
      { name: "Bellary", district: "Ballari" },
      { name: "Bijapur", district: "Vijayapura" },
      { name: "Shimoga", district: "Shivamogga" }
    ]
  },
  {
    name: "Kerala",
    cities: [
      { name: "Thiruvananthapuram", district: "Thiruvananthapuram" },
      { name: "Kochi", district: "Ernakulam" },
      { name: "Calicut", district: "Kozhikode" },
      { name: "Thrissur", district: "Thrissur" },
      { name: "Alappuzha", district: "Alappuzha" },
      { name: "Kollam", district: "Kollam" },
      { name: "Palakkad", district: "Palakkad" },
      { name: "Kannur", district: "Kannur" },
      { name: "Kottayam", district: "Kottayam" },
      { name: "Malappuram", district: "Malappuram" }
    ]
  },
  {
    name: "Madhya Pradesh",
    cities: [
      { name: "Bhopal", district: "Bhopal" },
      { name: "Indore", district: "Indore" },
      { name: "Gwalior", district: "Gwalior" },
      { name: "Jabalpur", district: "Jabalpur" },
      { name: "Ujjain", district: "Ujjain" },
      { name: "Sagar", district: "Sagar" },
      { name: "Dewas", district: "Dewas" },
      { name: "Satna", district: "Satna" },
      { name: "Ratlam", district: "Ratlam" },
      { name: "Rewa", district: "Rewa" }
    ]
  },
  {
    name: "Maharashtra",
    cities: [
      { name: "Mumbai", district: "Mumbai City" },
      { name: "Pune", district: "Pune" },
      { name: "Nagpur", district: "Nagpur" },
      { name: "Thane", district: "Thane" },
      { name: "Nashik", district: "Nashik" },
      { name: "Aurangabad", district: "Aurangabad" },
      { name: "Solapur", district: "Solapur" },
      { name: "Amravati", district: "Amravati" },
      { name: "Kolhapur", district: "Kolhapur" },
      { name: "Sangli", district: "Sangli" },
      { name: "Akola", district: "Akola" },
      { name: "Latur", district: "Latur" },
      { name: "Dhule", district: "Dhule" },
      { name: "Ahmednagar", district: "Ahmednagar" },
      { name: "Chandrapur", district: "Chandrapur" }
    ]
  },
  {
    name: "Manipur",
    cities: [
      { name: "Imphal", district: "Imphal West" },
      { name: "Thoubal", district: "Thoubal" },
      { name: "Bishnupur", district: "Bishnupur" },
      { name: "Churachandpur", district: "Churachandpur" }
    ]
  },
  {
    name: "Meghalaya",
    cities: [
      { name: "Shillong", district: "East Khasi Hills" },
      { name: "Tura", district: "West Garo Hills" },
      { name: "Cherrapunji", district: "East Khasi Hills" },
      { name: "Jowai", district: "West Jaintia Hills" }
    ]
  },
  {
    name: "Mizoram",
    cities: [
      { name: "Aizawl", district: "Aizawl" },
      { name: "Lunglei", district: "Lunglei" },
      { name: "Champhai", district: "Champhai" },
      { name: "Serchhip", district: "Serchhip" }
    ]
  },
  {
    name: "Nagaland",
    cities: [
      { name: "Kohima", district: "Kohima" },
      { name: "Dimapur", district: "Dimapur" },
      { name: "Mokokchung", district: "Mokokchung" },
      { name: "Tuensang", district: "Tuensang" }
    ]
  },
  {
    name: "Odisha",
    cities: [
      { name: "Bhubaneswar", district: "Khordha" },
      { name: "Cuttack", district: "Cuttack" },
      { name: "Rourkela", district: "Sundargarh" },
      { name: "Berhampur", district: "Ganjam" },
      { name: "Sambalpur", district: "Sambalpur" },
      { name: "Puri", district: "Puri" },
      { name: "Balasore", district: "Balasore" },
      { name: "Baripada", district: "Mayurbhanj" }
    ]
  },
  {
    name: "Punjab",
    cities: [
      { name: "Chandigarh", district: "Chandigarh" },
      { name: "Ludhiana", district: "Ludhiana" },
      { name: "Amritsar", district: "Amritsar" },
      { name: "Jalandhar", district: "Jalandhar" },
      { name: "Patiala", district: "Patiala" },
      { name: "Bathinda", district: "Bathinda" },
      { name: "Mohali", district: "Mohali" },
      { name: "Firozpur", district: "Firozpur" },
      { name: "Pathankot", district: "Pathankot" },
      { name: "Moga", district: "Moga" }
    ]
  },
  {
    name: "Rajasthan",
    cities: [
      { name: "Jaipur", district: "Jaipur" },
      { name: "Jodhpur", district: "Jodhpur" },
      { name: "Kota", district: "Kota" },
      { name: "Bikaner", district: "Bikaner" },
      { name: "Udaipur", district: "Udaipur" },
      { name: "Ajmer", district: "Ajmer" },
      { name: "Bhilwara", district: "Bhilwara" },
      { name: "Alwar", district: "Alwar" },
      { name: "Bharatpur", district: "Bharatpur" },
      { name: "Pali", district: "Pali" },
      { name: "Tonk", district: "Tonk" },
      { name: "Kishangarh", district: "Ajmer" }
    ]
  },
  {
    name: "Sikkim",
    cities: [
      { name: "Gangtok", district: "East Sikkim" },
      { name: "Namchi", district: "South Sikkim" },
      { name: "Gyalshing", district: "West Sikkim" },
      { name: "Mangan", district: "North Sikkim" }
    ]
  },
  {
    name: "Tamil Nadu",
    cities: [
      { name: "Chennai", district: "Chennai" },
      { name: "Coimbatore", district: "Coimbatore" },
      { name: "Madurai", district: "Madurai" },
      { name: "Tiruchirappalli", district: "Tiruchirappalli" },
      { name: "Salem", district: "Salem" },
      { name: "Tirunelveli", district: "Tirunelveli" },
      { name: "Tiruppur", district: "Tiruppur" },
      { name: "Vellore", district: "Vellore" },
      { name: "Erode", district: "Erode" },
      { name: "Thoothukkudi", district: "Thoothukkudi" },
      { name: "Dindigul", district: "Dindigul" },
      { name: "Thanjavur", district: "Thanjavur" },
      { name: "Ranipet", district: "Ranipet" },
      { name: "Sivakasi", district: "Virudhunagar" }
    ]
  },
  {
    name: "Telangana",
    cities: [
      { name: "Hyderabad", district: "Hyderabad" },
      { name: "Warangal", district: "Warangal Urban" },
      { name: "Nizamabad", district: "Nizamabad" },
      { name: "Khammam", district: "Khammam" },
      { name: "Karimnagar", district: "Karimnagar" },
      { name: "Ramagundam", district: "Peddapalli" },
      { name: "Mahbubnagar", district: "Mahbubnagar" },
      { name: "Nalgonda", district: "Nalgonda" },
      { name: "Adilabad", district: "Adilabad" },
      { name: "Suryapet", district: "Suryapet" }
    ]
  },
  {
    name: "Tripura",
    cities: [
      { name: "Agartala", district: "West Tripura" },
      { name: "Dharmanagar", district: "North Tripura" },
      { name: "Udaipur", district: "Gomati" },
      { name: "Kailasahar", district: "Unakoti" },
      { name: "Belonia", district: "South Tripura" }
    ]
  },
  {
    name: "Uttar Pradesh",
    cities: [
      { name: "Lucknow", district: "Lucknow" },
      { name: "Kanpur", district: "Kanpur Nagar" },
      { name: "Ghaziabad", district: "Ghaziabad" },
      { name: "Agra", district: "Agra" },
      { name: "Varanasi", district: "Varanasi" },
      { name: "Meerut", district: "Meerut" },
      { name: "Allahabad", district: "Allahabad" },
      { name: "Bareilly", district: "Bareilly" },
      { name: "Aligarh", district: "Aligarh" },
      { name: "Moradabad", district: "Moradabad" },
      { name: "Saharanpur", district: "Saharanpur" },
      { name: "Gorakhpur", district: "Gorakhpur" },
      { name: "Firozabad", district: "Firozabad" },
      { name: "Jhansi", district: "Jhansi" },
      { name: "Muzaffarnagar", district: "Muzaffarnagar" }
    ]
  },
  {
    name: "Uttarakhand",
    cities: [
      { name: "Dehradun", district: "Dehradun" },
      { name: "Haridwar", district: "Haridwar" },
      { name: "Roorkee", district: "Haridwar" },
      { name: "Haldwani", district: "Nainital" },
      { name: "Rudrapur", district: "Udham Singh Nagar" },
      { name: "Rishikesh", district: "Dehradun" },
      { name: "Kotdwar", district: "Pauri Garhwal" },
      { name: "Ramnagar", district: "Nainital" }
    ]
  },
  {
    name: "West Bengal",
    cities: [
      { name: "Kolkata", district: "Kolkata" },
      { name: "Howrah", district: "Howrah" },
      { name: "Durgapur", district: "Burdwan" },
      { name: "Asansol", district: "Burdwan" },
      { name: "Siliguri", district: "Darjeeling" },
      { name: "Malda", district: "Malda" },
      { name: "Barasat", district: "North 24 Parganas" },
      { name: "Bardhaman", district: "Purba Bardhaman" },
      { name: "Jalpaiguri", district: "Jalpaiguri" },
      { name: "Kharagpur", district: "Paschim Medinipur" },
      { name: "Haldia", district: "Purba Medinipur" }
    ]
  }
];

// Helper functions
export const getStateNames = (): string[] => {
  return indianStatesAndCities.map(state => state.name).sort();
};

export const getCitiesByState = (stateName: string): City[] => {
  const state = indianStatesAndCities.find(s => s.name === stateName);
  return state ? state.cities.sort((a, b) => a.name.localeCompare(b.name)) : [];
};

export const getAllCities = (): City[] => {
  return indianStatesAndCities.flatMap(state => state.cities).sort((a, b) => a.name.localeCompare(b.name));
};